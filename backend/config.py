import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent

load_dotenv(BASE_DIR / ".env")


def _get_env(chave: str, padrao: str | None = None, obrigatorio: bool = False) -> str:
    valor = os.getenv(chave, padrao)
    if obrigatorio and not valor:
        raise RuntimeError(
            f"Variável de ambiente obrigatória não configurada: {chave}. "
            f"Crie o arquivo .env baseado no .env.example."
        )
    return valor


DATABASE_URL = _get_env("DATABASE_URL", "sqlite:///./imobiliaria.db")

SECRET_KEY = _get_env("SECRET_KEY", obrigatorio=True)
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = int(_get_env("TOKEN_EXPIRE_HOURS", "8"))

ADMIN_USERNAME = _get_env("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH", "")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")

CORS_ORIGINS = [
    origem.strip().strip('"').strip("'").rstrip("/").lower()
    for origem in _get_env(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origem.strip()
]

CORS_ORIGIN_REGEX = r"^https://[a-z0-9-]+\.github\.io$"
