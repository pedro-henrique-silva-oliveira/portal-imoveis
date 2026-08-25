from datetime import datetime, timezone

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)

from database import Base


def agora_utc() -> datetime:
    return datetime.now(timezone.utc)


class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False, index=True)
    descricao = Column(Text, default="")
    preco = Column(Float, nullable=False, index=True)
    tipo = Column(String(50), nullable=False, index=True)
    transacao = Column(String(20), nullable=False, index=True)
    quartos = Column(Integer, default=0)
    suites = Column(Integer, default=0)
    banheiros = Column(Integer, default=0)
    vagas = Column(Integer, default=0)
    area = Column(Float, default=0.0)
    cep = Column(String(20), default="")
    endereco = Column(String(255), default="")
    bairro = Column(String(120), default="", index=True)
    cidade = Column(String(120), default="", index=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    fotos = Column(JSON, default=list)
    features = Column(JSON, default=dict)
    data_criacao = Column(DateTime, default=agora_utc)


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), nullable=False)
    email = Column(String(160), nullable=False)
    telefone = Column(String(30), nullable=False)
    mensagem = Column(Text, default="")
    status = Column(String(20), nullable=False, default="novo", server_default="novo", index=True)
    imovel_id = Column(Integer, ForeignKey("properties.id"), nullable=True)
    data_criacao = Column(DateTime, default=agora_utc)


class Demanda(Base):
    __tablename__ = "demandas"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), nullable=False)
    telefone = Column(String(30), nullable=False)
    email = Column(String(160), default="")
    bairro = Column(String(120), default="")
    cidade = Column(String(120), default="")
    preco_min = Column(Float, nullable=True)
    preco_max = Column(Float, nullable=True)
    dormitorios = Column(Integer, nullable=True)
    observacoes = Column(Text, default="")
    atendida = Column(Boolean, nullable=False, default=False, server_default="0")
    data_criacao = Column(DateTime, default=agora_utc)


class Configuracao(Base):
    __tablename__ = "configuracoes"

    chave = Column(String(60), primary_key=True)
    valor = Column(String(300), nullable=False)
