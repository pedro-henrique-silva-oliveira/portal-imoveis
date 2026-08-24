import re
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

TIPOS_IMOVEL = {"casa", "apartamento", "terreno", "comercial"}
TRANSACOES = {"venda", "aluguel"}


class PropertyBase(BaseModel):
    titulo: str = Field(min_length=3, max_length=200)
    descricao: str = Field(default="", max_length=8000)
    preco: float = Field(gt=0)
    tipo: str
    transacao: str
    quartos: int = Field(default=0, ge=0, le=50)
    suites: int = Field(default=0, ge=0, le=50)
    banheiros: int = Field(default=0, ge=0, le=50)
    vagas: int = Field(default=0, ge=0, le=50)
    area: float = Field(default=0.0, ge=0)
    cep: str = Field(default="", max_length=20)
    endereco: str = Field(default="", max_length=255)
    bairro: str = Field(default="", max_length=120)
    cidade: str = Field(default="", max_length=120)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    fotos: list[str] = Field(default_factory=list)
    features: dict[str, bool] = Field(default_factory=dict)

    @field_validator("tipo")
    @classmethod
    def validar_tipo(cls, v: str) -> str:
        v = (v or "").strip().lower()
        if v not in TIPOS_IMOVEL:
            raise ValueError(f"tipo deve ser um de: {', '.join(sorted(TIPOS_IMOVEL))}")
        return v

    @field_validator("transacao")
    @classmethod
    def validar_transacao(cls, v: str) -> str:
        v = (v or "").strip().lower()
        if v not in TRANSACOES:
            raise ValueError(
                f"transacao deve ser um de: {', '.join(sorted(TRANSACOES))}"
            )
        return v

    @field_validator("fotos")
    @classmethod
    def validar_fotos(cls, v: list[str]) -> list[str]:
        if len(v) > 25:
            raise ValueError("Máximo de 25 fotos por imóvel.")
        for foto in v:
            if len(foto) > 4_000_000:
                raise ValueError("Uma das imagens é grande demais (máx. ~3MB).")
        return v


class PropertyCreate(PropertyBase):
    pass


class PropertyUpdate(BaseModel):
    titulo: Optional[str] = Field(default=None, min_length=3, max_length=200)
    descricao: Optional[str] = Field(default=None, max_length=8000)
    preco: Optional[float] = Field(default=None, gt=0)
    tipo: Optional[str] = None
    transacao: Optional[str] = None
    quartos: Optional[int] = Field(default=None, ge=0, le=50)
    suites: Optional[int] = Field(default=None, ge=0, le=50)
    banheiros: Optional[int] = Field(default=None, ge=0, le=50)
    vagas: Optional[int] = Field(default=None, ge=0, le=50)
    area: Optional[float] = Field(default=None, ge=0)
    cep: Optional[str] = Field(default=None, max_length=20)
    endereco: Optional[str] = Field(default=None, max_length=255)
    bairro: Optional[str] = Field(default=None, max_length=120)
    cidade: Optional[str] = Field(default=None, max_length=120)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    fotos: Optional[list[str]] = None
    features: Optional[dict[str, bool]] = None

    @field_validator("tipo")
    @classmethod
    def validar_tipo(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip().lower()
            if v not in TIPOS_IMOVEL:
                raise ValueError(
                    f"tipo deve ser um de: {', '.join(sorted(TIPOS_IMOVEL))}"
                )
        return v

    @field_validator("transacao")
    @classmethod
    def validar_transacao(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip().lower()
            if v not in TRANSACOES:
                raise ValueError(
                    f"transacao deve ser um de: {', '.join(sorted(TRANSACOES))}"
                )
        return v

    @field_validator("fotos")
    @classmethod
    def validar_fotos(cls, v: Optional[list[str]]) -> Optional[list[str]]:
        if v is not None:
            if len(v) > 25:
                raise ValueError("Máximo de 25 fotos por imóvel.")
            for foto in v:
                if len(foto) > 4_000_000:
                    raise ValueError("Uma das imagens é grande demais (máx. ~3MB).")
        return v


class PropertyOut(PropertyBase):
    id: int
    data_criacao: datetime

    model_config = ConfigDict(from_attributes=True)


class ListaImoveis(BaseModel):
    items: list[PropertyOut]
    total: int
    page: int
    per_page: int
    pages: int


class LoginRequest(BaseModel):
    username: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=4, max_length=200)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LeadCreate(BaseModel):
    nome: str = Field(min_length=2, max_length=120)
    email: EmailStr
    telefone: str = Field(min_length=8, max_length=30)
    mensagem: str = Field(default="", max_length=2000)
    imovel_id: Optional[int] = None

    @field_validator("telefone")
    @classmethod
    def validar_telefone(cls, v: str) -> str:
        digitos = re.sub(r"\D", "", v or "")
        if not 8 <= len(digitos) <= 13:
            raise ValueError("Telefone inválido.")
        return v.strip()


class LeadOut(BaseModel):
    id: int
    nome: str
    email: str
    telefone: str
    mensagem: str
    imovel_id: Optional[int]
    data_criacao: datetime

    model_config = ConfigDict(from_attributes=True)
