import hmac
from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, ExpiredSignatureError, jwt

from config import (
    ADMIN_PASSWORD,
    ADMIN_PASSWORD_HASH,
    ADMIN_USERNAME,
    ALGORITHM,
    SECRET_KEY,
    TOKEN_EXPIRE_HOURS,
)

bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(senha: str) -> str:
    return bcrypt.hashpw(senha.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verificar_senha(senha: str, hash_senha: str) -> bool:
    try:
        return bcrypt.checkpw(
            senha.encode("utf-8"),
            hash_senha.encode("utf-8") if isinstance(hash_senha, str) else hash_senha,
        )
    except Exception:
        return False


CHAVE_SENHA_BANCO = "admin_password_hash"


def obter_hash_ativo() -> str:
    """Hash efetivo da senha: banco de dados tem prioridade sobre o .env."""
    from sqlalchemy.orm import Session

    from database import engine
    from models import Configuracao

    try:
        with Session(engine) as db:
            linha = db.get(Configuracao, CHAVE_SENHA_BANCO)
            if linha and linha.valor:
                return linha.valor
    except Exception:
        pass
    return (ADMIN_PASSWORD_HASH or "").strip()


def senha_valida(password: str) -> bool:
    hash_ativo = obter_hash_ativo()
    if hash_ativo:
        return verificar_senha(password or "", hash_ativo)
    if ADMIN_PASSWORD:
        return hmac.compare_digest(password or "", ADMIN_PASSWORD)
    raise RuntimeError(
        "Nenhuma credencial de administrador configurada. "
        "Defina ADMIN_PASSWORD_HASH ou ADMIN_PASSWORD no arquivo .env."
    )


def salvar_novo_hash(novo_hash: str) -> None:
    from sqlalchemy.orm import Session

    from database import engine
    from models import Configuracao

    with Session(engine) as db:
        linha = db.get(Configuracao, CHAVE_SENHA_BANCO)
        if linha is None:
            db.add(Configuracao(chave=CHAVE_SENHA_BANCO, valor=novo_hash))
        else:
            linha.valor = novo_hash
        db.commit()


def autenticar_admin(username: str, password: str) -> bool:
    usuario_ok = hmac.compare_digest(
        (username or "").strip().lower(), (ADMIN_USERNAME or "").strip().lower()
    )
    return usuario_ok and senha_valida(password)


def criar_token(subject: str) -> str:
    expiracao = datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRE_HOURS)
    payload = {"sub": subject, "exp": expiracao}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_admin(
    credenciais: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> str:
    excecao = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não autorizado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credenciais is None or credenciais.scheme.lower() != "bearer":
        raise excecao
    try:
        payload = jwt.decode(credenciais.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sessão expirada. Faça login novamente.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError:
        raise excecao
    subject = payload.get("sub")
    if not subject:
        raise excecao
    return subject
