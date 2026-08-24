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


def autenticar_admin(username: str, password: str) -> bool:
    usuario_ok = hmac.compare_digest(
        (username or "").strip().lower(), (ADMIN_USERNAME or "").strip().lower()
    )
    if ADMIN_PASSWORD_HASH:
        senha_ok = verificar_senha(password, ADMIN_PASSWORD_HASH)
    elif ADMIN_PASSWORD:
        senha_ok = hmac.compare_digest(password or "", ADMIN_PASSWORD)
    else:
        raise RuntimeError(
            "Nenhuma credencial de administrador configurada. "
            "Defina ADMIN_PASSWORD_HASH ou ADMIN_PASSWORD no arquivo .env."
        )
    return usuario_ok and senha_ok


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
