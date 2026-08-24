import logging
import math
import traceback
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

import schemas
from auth import autenticar_admin, criar_token, get_current_admin
from config import ADMIN_PASSWORD, ADMIN_PASSWORD_HASH, CORS_ORIGINS
from database import Base, engine, get_db
from models import Lead, Property

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("portal-imobiliario")


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    if not (ADMIN_PASSWORD_HASH or ADMIN_PASSWORD):
        logger.warning(
            "ATENÇÃO: nenhuma senha de administrador configurada. "
            "Defina ADMIN_PASSWORD_HASH (recomendado) ou ADMIN_PASSWORD no .env."
        )
    logger.info("Banco de dados inicializado.")
    yield


app = FastAPI(
    title="Portal Imobiliário - API",
    description="API white-label de portal imobiliário.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.exception_handler(Exception)
async def handler_erro_global(request: Request, exc: Exception):
    logger.error(
        "Erro interno em %s: %s\n%s",
        request.url.path,
        exc,
        traceback.format_exc(),
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "Erro interno do servidor. Tente novamente mais tarde."},
    )


ORDENS = {
    "recentes": lambda q: q.order_by(Property.data_criacao.desc(), Property.id.desc()),
    "preco_asc": lambda q: q.order_by(Property.preco.asc()),
    "preco_desc": lambda q: q.order_by(Property.preco.desc()),
    "area_desc": lambda q: q.order_by(Property.area.desc()),
}


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/auth/login", response_model=schemas.TokenResponse)
def login(dados: schemas.LoginRequest):
    try:
        ok = autenticar_admin(dados.username, dados.password)
    except RuntimeError as erro:
        logger.error(str(erro))
        raise HTTPException(status_code=500, detail="Servidor mal configurado.")
    if not ok:
        raise HTTPException(status_code=401, detail="Usuário ou senha inválidos.")
    return {"access_token": criar_token(dados.username), "token_type": "bearer"}


@app.get("/api/imoveis", response_model=schemas.ListaImoveis)
def listar_imoveis(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=12, ge=1, le=60),
    tipo: str | None = None,
    transacao: str | None = None,
    cidade: str | None = None,
    bairro: str | None = None,
    preco_min: float | None = Query(default=None, ge=0),
    preco_max: float | None = Query(default=None, ge=0),
    quartos_min: int | None = Query(default=None, ge=0),
    ordem: str = Query(default="recentes"),
    db: Session = Depends(get_db),
):
    consulta = db.query(Property)
    if tipo:
        consulta = consulta.filter(func.lower(Property.tipo) == tipo.strip().lower())
    if transacao:
        consulta = consulta.filter(
            func.lower(Property.transacao) == transacao.strip().lower()
        )
    if cidade:
        consulta = consulta.filter(Property.cidade.ilike(f"%{cidade.strip()}%"))
    if bairro:
        consulta = consulta.filter(Property.bairro.ilike(f"%{bairro.strip()}%"))
    if preco_min is not None:
        consulta = consulta.filter(Property.preco >= preco_min)
    if preco_max is not None:
        consulta = consulta.filter(Property.preco <= preco_max)
    if quartos_min is not None:
        consulta = consulta.filter(Property.quartos >= quartos_min)

    total = consulta.count()
    paginas = max(math.ceil(total / per_page), 1)
    page = min(page, paginas)

    ordenador = ORDENS.get(ordem, ORDENS["recentes"])
    consulta = ordenador(consulta)

    items = consulta.offset((page - 1) * per_page).limit(per_page).all()
    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": paginas,
    }


@app.get("/api/imoveis/{imovel_id}", response_model=schemas.PropertyOut)
def obter_imovel(imovel_id: int, db: Session = Depends(get_db)):
    imovel = db.get(Property, imovel_id)
    if not imovel:
        raise HTTPException(status_code=404, detail="Imóvel não encontrado.")
    return imovel


@app.post("/api/imoveis", response_model=schemas.PropertyOut, status_code=201)
def criar_imovel(
    dados: schemas.PropertyCreate,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_admin),
):
    imovel = Property(**dados.model_dump())
    db.add(imovel)
    db.commit()
    db.refresh(imovel)
    return imovel


@app.put("/api/imoveis/{imovel_id}", response_model=schemas.PropertyOut)
def atualizar_imovel(
    imovel_id: int,
    dados: schemas.PropertyUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_admin),
):
    imovel = db.get(Property, imovel_id)
    if not imovel:
        raise HTTPException(status_code=404, detail="Imóvel não encontrado.")
    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(imovel, campo, valor)
    db.commit()
    db.refresh(imovel)
    return imovel


@app.delete("/api/imoveis/{imovel_id}")
def excluir_imovel(
    imovel_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_admin),
):
    imovel = db.get(Property, imovel_id)
    if not imovel:
        raise HTTPException(status_code=404, detail="Imóvel não encontrado.")
    db.query(Lead).filter(Lead.imovel_id == imovel_id).update({"imovel_id": None})
    db.delete(imovel)
    db.commit()
    return {"mensagem": "Imóvel excluído com sucesso."}


@app.get("/api/admin/metrics")
def metricas(
    db: Session = Depends(get_db),
    _: str = Depends(get_current_admin),
):
    return {
        "total_imoveis": db.query(func.count(Property.id)).scalar() or 0,
        "venda": db.query(func.count(Property.id))
        .filter(Property.transacao == "venda")
        .scalar()
        or 0,
        "aluguel": db.query(func.count(Property.id))
        .filter(Property.transacao == "aluguel")
        .scalar()
        or 0,
        "leads": db.query(func.count(Lead.id)).scalar() or 0,
    }


@app.post("/api/leads", status_code=201)
def criar_lead(dados: schemas.LeadCreate, db: Session = Depends(get_db)):
    if dados.imovel_id is not None and not db.get(Property, dados.imovel_id):
        raise HTTPException(status_code=404, detail="Imóvel de interesse não encontrado.")
    lead = Lead(**dados.model_dump())
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return {"id": lead.id, "mensagem": "Contato recebido! Em breve retornaremos."}


@app.get("/api/admin/leads", response_model=list[schemas.LeadOut])
def listar_leads(
    db: Session = Depends(get_db),
    _: str = Depends(get_current_admin),
):
    return db.query(Lead).order_by(Lead.data_criacao.desc()).all()


@app.delete("/api/admin/leads/{lead_id}")
def excluir_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_admin),
):
    lead = db.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead não encontrado.")
    db.delete(lead)
    db.commit()
    return {"mensagem": "Lead excluído."}
