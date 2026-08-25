import logging
import math
import traceback
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from sqlalchemy import func, text
from sqlalchemy.orm import Session

import schemas
from auth import (
    autenticar_admin,
    criar_token,
    get_current_admin,
    hash_password,
    salvar_novo_hash,
    senha_valida,
)
from config import (
    ADMIN_PASSWORD,
    ADMIN_PASSWORD_HASH,
    CONFIG_PADRAO,
    CORS_ORIGINS,
    CORS_ORIGIN_REGEX,
)
from database import Base, engine, get_db
from feed_xml import gerar_feed_portais
from imagens import foto_com_marca
from models import Configuracao, Demanda, Lead, Property

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("portal-imobiliario")


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    _migrar_coluna_status_leads()
    semear_config_padrao()
    if not (ADMIN_PASSWORD_HASH or ADMIN_PASSWORD):
        logger.warning(
            "ATENÇÃO: nenhuma senha de administrador configurada. "
            "Defina ADMIN_PASSWORD_HASH (recomendado) ou ADMIN_PASSWORD no .env."
        )
    logger.info("Banco de dados inicializado.")
    yield


def _migrar_coluna_status_leads() -> None:
    """Adiciona a coluna status (mini-CRM) em bancos criados antes da feature."""
    try:
        with engine.begin() as conn:
            conn.execute(
                text("ALTER TABLE leads ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'novo'")
            )
        logger.info("Coluna 'status' adicionada à tabela leads.")
    except Exception:
        pass  # coluna já existe


def semear_config_padrao() -> None:
    with Session(engine) as db:
        existentes = {c.chave for c in db.query(Configuracao).all()}
        for chave, valor in CONFIG_PADRAO.items():
            if chave not in existentes:
                db.add(Configuracao(chave=chave, valor=valor))
        db.commit()


app = FastAPI(
    title="Portal Imobiliário - API",
    description="API white-label de portal imobiliário.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=CORS_ORIGIN_REGEX,
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


def _config_map(db: Session) -> dict:
    valores = {**CONFIG_PADRAO}
    for linha in db.query(Configuracao).all():
        if linha.chave in CONFIG_PADRAO:
            valores[linha.chave] = linha.valor
    return valores


@app.get("/api/imoveis/{imovel_id}/fotos/{indice:int}")
def servir_foto(
    imovel_id: int,
    indice: int,
    db: Session = Depends(get_db),
):
    """Serve a foto com marca d'água (nome + CRECI) aplicada dinamicamente."""
    imovel = db.get(Property, imovel_id)
    if not imovel:
        raise HTTPException(status_code=404, detail="Imóvel não encontrado.")
    fotos = imovel.fotos or []
    if indice < 0 or indice >= len(fotos):
        raise HTTPException(status_code=404, detail="Foto não encontrada.")

    config = _config_map(db)
    marca = f"{config['brand_name']} · {config['creci']}".strip(" ·")
    conteudo = foto_com_marca(fotos[indice], marca)
    if conteudo is None:
        raise HTTPException(status_code=404, detail="Foto inválida.")

    return Response(
        content=conteudo,
        media_type="image/jpeg",
        headers={"Cache-Control": "public, max-age=3600"},
    )


@app.get("/api/feed/{portal}.xml")
def feed_portais(portal: str, request: Request, db: Session = Depends(get_db)):
    """Feed XML para portais externos: vivareal, zap ou olx."""
    if portal not in ("vivareal", "zap", "olx"):
        raise HTTPException(status_code=404, detail="Portal não suportado.")
    imoveis = (
        db.query(Property)
        .order_by(Property.data_criacao.desc(), Property.id.desc())
        .limit(200)
        .all()
    )
    config = _config_map(db)
    xml = gerar_feed_portais(imoveis, str(request.base_url), config, portal=portal)
    return Response(content=xml, media_type="application/xml; charset=utf-8")


@app.get("/api/config")
def obter_config_publica(db: Session = Depends(get_db)):
    """Somente as chaves públicas (nunca expõe hash de senha)."""
    linhas = db.query(Configuracao).all()
    return {c.chave: c.valor for c in linhas if c.chave in CONFIG_PADRAO}


@app.put("/api/admin/senha")
def alterar_senha(
    dados: schemas.AlterarSenhaRequest,
    _: str = Depends(get_current_admin),
):
    try:
        atual_ok = senha_valida(dados.senha_atual)
    except RuntimeError:
        raise HTTPException(status_code=500, detail="Servidor mal configurado.")
    if not atual_ok:
        raise HTTPException(status_code=401, detail="Senha atual incorreta.")
    salvar_novo_hash(hash_password(dados.nova_senha))
    return {
        "mensagem": "Senha alterada com sucesso! Use a nova senha no próximo login."
    }


@app.put("/api/admin/configuracoes")
def salvar_configuracoes(
    dados: schemas.ConfiguracaoUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_admin),
):
    alteracoes = dados.model_dump(exclude_none=True)
    if not alteracoes:
        raise HTTPException(status_code=422, detail="Nenhum campo para atualizar.")
    for chave, valor in alteracoes.items():
        linha = db.get(Configuracao, chave)
        if linha is None:
            db.add(Configuracao(chave=chave, valor=valor))
        else:
            linha.valor = valor
    db.commit()
    linhas = db.query(Configuracao).all()
    atual = {c.chave: c.valor for c in linhas if c.chave in CONFIG_PADRAO}
    return {"mensagem": "Configurações salvas com sucesso.", "config": atual}


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
        "demandas": db.query(func.count(Demanda.id)).scalar() or 0,
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


@app.put("/api/admin/leads/{lead_id}/status", response_model=schemas.LeadOut)
def alterar_status_lead(
    lead_id: int,
    dados: schemas.LeadStatusUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_admin),
):
    """Move o lead no funil do mini-CRM (kanban)."""
    lead = db.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead não encontrado.")
    lead.status = dados.status
    db.commit()
    db.refresh(lead)
    return lead


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


@app.post("/api/demandas", status_code=201)
def criar_demanda(dados: schemas.DemandaCreate, db: Session = Depends(get_db)):
    """Captura de demanda passiva: perfil do imóvel desejado pelo cliente."""
    demanda = Demanda(**dados.model_dump())
    db.add(demanda)
    db.commit()
    db.refresh(demanda)
    return {
        "id": demanda.id,
        "mensagem": "Recebemos seu pedido! Vamos entrar em contato quando encontrarmos.",
    }


@app.get("/api/admin/demandas", response_model=list[schemas.DemandaOut])
def listar_demandas(
    db: Session = Depends(get_db),
    _: str = Depends(get_current_admin),
):
    return db.query(Demanda).order_by(Demanda.data_criacao.desc()).all()


@app.put("/api/admin/demandas/{demanda_id}/status", response_model=schemas.DemandaOut)
def alterar_status_demanda(
    demanda_id: int,
    dados: schemas.DemandaStatusUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_admin),
):
    demanda = db.get(Demanda, demanda_id)
    if not demanda:
        raise HTTPException(status_code=404, detail="Demanda não encontrada.")
    demanda.atendida = dados.atendida
    db.commit()
    db.refresh(demanda)
    return demanda


@app.delete("/api/admin/demandas/{demanda_id}")
def excluir_demanda(
    demanda_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_admin),
):
    demanda = db.get(Demanda, demanda_id)
    if not demanda:
        raise HTTPException(status_code=404, detail="Demanda não encontrada.")
    db.delete(demanda)
    db.commit()
    return {"mensagem": "Demanda excluída."}
