"""Otimizacao de imagens servidas publicamente.

As fotos originais sao armazenadas intactas no banco; no momento em que a
imagem e servida ela e redimensionada e re-comprimida para economizar
trafego, com cache em memoria para nao reprocessar a cada visita.
"""

import base64
import binascii
import io

from PIL import Image, UnidentifiedImageError

_LARGURA_MAXIMA = 1600
_QUALIDADE_JPEG = 85
_CACHE_LIMITE = 128
_cache: dict[int, bytes] = {}


def _decodificar(data_url: str) -> Image.Image | None:
    try:
        payload = data_url.split(",", 1)[-1]
        bruto = base64.b64decode(payload, validate=False)
        imagem = Image.open(io.BytesIO(bruto))
        return imagem.convert("RGB")
    except (binascii.Error, ValueError, OSError, UnidentifiedImageError):
        return None


def otimizar_foto(data_url: str) -> bytes | None:
    """Retorna os bytes JPEG da foto otimizada (sem marca d'agua).

    Resultados ficam em cache em memoria (limite fixo) para nao reprocessar
    a mesma imagem a cada visita. Retorna None se a foto for invalida.
    """
    chave = hash(data_url)
    if chave in _cache:
        return _cache[chave]

    imagem = _decodificar(data_url)
    if imagem is None:
        return None

    if imagem.width > _LARGURA_MAXIMA:
        nova_altura = round(imagem.height * _LARGURA_MAXIMA / imagem.width)
        imagem = imagem.resize((_LARGURA_MAXIMA, nova_altura))

    buffer = io.BytesIO()
    imagem.save(buffer, "JPEG", quality=_QUALIDADE_JPEG, optimize=True)
    conteudo = buffer.getvalue()

    if len(_cache) >= _CACHE_LIMITE:
        _cache.pop(next(iter(_cache)))
    _cache[chave] = conteudo
    return conteudo
