"""Geração de feeds XML para integração com portais imobiliários.

- vivareal/zap: layout compatível com o schema ListingDataFeed (VivaReal/ZAP)
- olx: layout simplificado no formato de anúncios aceito pelo importador OLX
"""

import datetime
from xml.etree import ElementTree as ET

_TIPO_LISTING = {
    "casa": "Home",
    "apartamento": "Apartment",
    "terreno": "Lot",
    "comercial": "Business",
}


def _txt(pai, tag, valor):
    if valor is None:
        return None
    elemento = ET.SubElement(pai, tag)
    elemento.text = str(valor)
    return elemento


def gerar_feed_portais(imoveis, base_url: str, config: dict, portal: str = "vivareal") -> str:
    """Gera o XML completo. `portal` aceita 'vivareal', 'zap' ou 'olx'."""
    raiz = ET.Element("Listings")
    raiz.set("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance")

    cabecalho = ET.SubElement(raiz, "Header")
    _txt(cabecalho, "Provider", config.get("brand_name", ""))
    _txt(cabecalho, "GeneratedAt", datetime.datetime.now(datetime.timezone.utc).isoformat())

    for imovel in imoveis:
        listing = ET.SubElement(raiz, "Listing")
        _txt(listing, "ListingID", imovel.id)
        _txt(listing, "Title", imovel.titulo)

        transacao = ET.SubElement(listing, "TransactionType")
        transacao.text = "Sale" if imovel.transacao == "venda" else "Rental"

        tipo = ET.SubElement(listing, "ListingType")
        tipo.text = _TIPO_LISTING.get(imovel.tipo, "Home")

        detalhes = ET.SubElement(listing, "Details")
        preco = _txt(detalhes, "Price" if imovel.transacao == "venda" else "RentalPrice",
                     round(float(imovel.preco), 2))
        if preco is not None:
            preco.set("currency", "BRL")
            if imovel.transacao == "aluguel":
                preco.set("periodicity", "MONTHLY")
        _txt(detalhes, "Description", imovel.descricao or "")

        location = ET.SubElement(listing, "Location")
        _txt(location, "Country", "BR")
        if imovel.cidade:
            _txt(location, "City", imovel.cidade)
        if imovel.bairro:
            _txt(location, "Neighborhood", imovel.bairro)
        if imovel.endereco:
            _txt(location, "StreetAddress", imovel.endereco)
        if imovel.latitude is not None and imovel.longitude is not None:
            geo = ET.SubElement(location, "GeoLocation")
            _txt(geo, "Latitude", f"{imovel.latitude:.6f}")
            _txt(geo, "Longitude", f"{imovel.longitude:.6f}")

        contato = ET.SubElement(listing, "ContactInfo")
        _txt(contato, "Name", config.get("brand_name", ""))
        _txt(contato, "Telephone", config.get("telefone_exibicao", ""))
        _txt(contato, "Email", config.get("email_contato", ""))

        imagens = ET.SubElement(listing, "Images")
        for i in range(len(imovel.fotos or [])):
            item = ET.SubElement(imagens, "Item")
            item.set("sequence", str(i + 1))
            url = _txt(item, "MediaURL", f"{base_url}api/imoveis/{imovel.id}/fotos/{i}")
            if url is not None:
                url.set("medium", "image")

        if portal == "olx":
            _txt(listing, "CodigoImovel", imovel.id)
            categoria = ET.SubElement(listing, "CategoriaResidencial")
            categoria.text = _TIPO_LISTING.get(imovel.tipo, "Home")

    ET.indent(raiz)
    xml = ET.tostring(raiz, encoding="unicode")
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + xml
