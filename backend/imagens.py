"""Processamento de imagens: marca d'água com nome da imobiliária e CRECI.

As fotos originais são armazenadas intactas no banco; a marca d'água é
aplicada no momento em que a imagem é servida publicamente, evitando
reprocessamento e dupla aplicação sobre o mesmo arquivo.
"""

import base64
import binascii
import io

from PIL import Image, ImageDraw, ImageFont, UnidentifiedImageError

_LARGURA_MAXIMA = 1600
_QUALIDADE_JPEG = 85
_CACHE_LIMITE = 128
_cache: dict[tuple, tuple[str, bytes]] = {}


def _decodificar(data_url: str) -> Image.Image | None:
    try:
        payload = data_url.split(",", 1)[-1]
        bruto = base64.b64decode(payload, validate=False)
        imagem = Image.open(io.BytesIO(bruto))
        return imagem.convert("RGB")
    except (binascii.Error, ValueError, OSError, UnidentifiedImageError):
        return None


def _carregar_fonte(tamanho: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    try:
        return ImageFont.load_default(size=tamanho)
    except TypeError:
        return ImageFont.load_default()


def _desenhar_marca(imagem: Image.Image, texto: str) -> None:
    desenho = ImageDraw.Draw(imagem, "RGBA")
    tamanho = max(18, imagem.width // 38)
    fonte = _carregar_fonte(tamanho)
    margem = max(10, tamanho // 2)

    caixa = desenho.textbbox((0, 0), texto, font=fonte)
    largura_texto = caixa[2] - caixa[0]
    altura_texto = caixa[3] - caixa[1]

    x = imagem.width - largura_texto - margem * 2
    y = imagem.height - altura_texto - margem * 2

    desenho.rounded_rectangle(
        [x - margem, y - margem, x + largura_texto + margem, y + altura_texto + margem],
        radius=margem,
        fill=(15, 23, 42, 150),
    )
    desenho.text((x, y), texto, font=fonte, fill=(255, 255, 255, 235))


def foto_com_marca(data_url: str, marca: str) -> bytes | None:
    """Retorna os bytes JPEG da foto com a marca d'água aplicada.

    Resultados ficam em cache em memória (limite fixo) para não reprocessar
    a mesma imagem a cada visita. Retorna None se a foto for inválida.
    """
    chave = (hash(data_url), marca)
    em_cache = _cache.get(chave)
    if em_cache is not None:
        return em_cache[1]

    imagem = _decodificar(data_url)
    if imagem is None:
        return None

    if imagem.width > _LARGURA_MAXIMA:
        nova_altura = round(imagem.height * _LARGURA_MAXIMA / imagem.width)
        imagem = imagem.resize((_LARGURA_MAXIMA, nova_altura))

    _desenhar_marca(imagem, marca)

    buffer = io.BytesIO()
    imagem.save(buffer, "JPEG", quality=_QUALIDADE_JPEG, optimize=True)
    conteudo = buffer.getvalue()

    if len(_cache) >= _CACHE_LIMITE:
        _cache.pop(next(iter(_cache)))
    _cache[chave] = (marca, conteudo)
    return conteudo
