# Portal Imobiliário White-Label

Portal imobiliário completo e pronto para personalização, construído como projeto de portfólio full-stack. Backend em **FastAPI + SQLAlchemy**, frontend em **React 19 + Vite + Tailwind CSS v4**.

A marca, contatos e dados exibidos no site podem ser alterados **sem tocar no código** — diretamente pelo painel administrativo ou por um único arquivo de configuração.

![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)

## Demonstração

| Serviço | URL |
|---|---|
| Site | https://pedro-henrique-silva-oliveira.github.io/portal-imoveis/ |
| API (health check) | https://portal-imoveis.up.railway.app/api/health |
| Documentação interativa da API | https://portal-imoveis.up.railway.app/docs |
| Painel administrativo | https://pedro-henrique-silva-oliveira.github.io/portal-imoveis/admin/login |

## Funcionalidades

**Site público**

- Catálogo de imóveis com busca avançada, filtros (tipo, transação, cidade, bairro, faixa de preço, quartos), ordenação e paginação
- Página de detalhes com galeria de fotos, ficha técnica, mapa interativo (Leaflet/OpenStreetMap) e botão flutuante de WhatsApp com mensagem pré-preenchida
- Formulário de interesse que gera leads vinculados ao imóvel
- **Demanda passiva**: seção "Não achou o que procura?" onde o visitante cadastra o perfil do imóvel desejado (bairro, faixa de preço, dormitórios) e é contactado pela equipe
- Favoritos persistidos em `localStorage`
- Banner hero responsivo com call-to-action e integração direta com WhatsApp

**Painel administrativo (JWT)**

- Dashboard com métricas (imóveis, vendas, locações, leads e demandas de busca)
- CRUD completo de imóveis com upload de imagens em Base64 (até 25 fotos)
- Geocodificação automática por CEP (AwesomeAPI → BrasilAPI → Nominatim, com fallback)
- **CRM de leads em Kanban**: funil visual com 6 estágios (Novo → Em contato → Visita agendada → Proposta → Fechado/Perdido), arrastar-e-soltar dos cards e link direto para o WhatsApp do cliente
- Gestão de demandas de busca com marcação de "atendida"
- **Marca d'água automática nas fotos**: todas as imagens públicas são reprocessadas pelo servidor (Pillow) com o nome da imobiliária + CRECI, redimensionadas para até 1600px e otimizadas — as originais permanecem intactas no banco
- **Feeds XML para portais** (padrão VivaReal/ZAP/OLX): `/api/feed/vivareal.xml`, `/api/feed/zap.xml` e `/api/feed/olx.xml` publicam o estoque automaticamente nos portais
- **Configurações editáveis em tempo real**: nome do site, CRECI, WhatsApp, telefone e e-mail — aplicados instantaneamente no site inteiro, sem redeploy
- **Alteração de senha pelo próprio painel**: o hash bcrypt é gerado automaticamente pelo sistema e persistido no banco — nenhuma variável de ambiente precisa ser alterada

## Stack tecnológica

| Camada | Tecnologias |
|---|---|
| Backend | FastAPI, Pydantic v2, SQLAlchemy 2, python-jose (JWT HS256), bcrypt |
| Frontend | React 19, Vite 6, Tailwind CSS v4, React Router 7, Axios, Leaflet, lucide-react |
| Banco de dados | PostgreSQL (produção) ou SQLite (desenvolvimento) — intercambiáveis via `DATABASE_URL` |
| Infraestrutura | Docker (backend), GitHub Actions + GitHub Pages (frontend), auto-deploy no push |

## Arquitetura de deploy

```text
push para main ──┬─► GitHub Actions ──► build do frontend ──► GitHub Pages
                 │                      (base path configurável,
                 │                       VITE_API_URL injetado no build)
                 │
                 └─► Railway ──► build via Dockerfile ──► FastAPI/Uvicorn
                                        (porta dinâmica $PORT)
                                             │
                                             ▼
                                        PostgreSQL (Supabase)
```

O frontend consome exclusivamente a API REST — não há estado compartilhado entre as camadas. O CORS é restrito às origens declaradas, com suporte a padrões por regex.

## Estrutura do projeto

```text
/
├── Dockerfile                        # Build do backend (usado pelo Railway)
├── .github/workflows/deploy-pages.yml
├── backend/
│   ├── main.py                       # Endpoints, CORS e handlers globais
│   ├── auth.py                       # JWT + bcrypt + troca de senha
│   ├── config.py                     # Variáveis de ambiente centralizadas
│   ├── database.py                   # Engine/Session (SQLite ou PostgreSQL)
│   ├── models.py                     # Models: Property, Lead, Configuracao
│   ├── schemas.py                    # Validações Pydantic v2
│   ├── wsgi.py                       # Adaptador ASGI->WSGI (PythonAnywhere)
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── components/               # Navbar, Footer, cards, mapa, galeria...
│       ├── pages/                    # Home, PropertyDetails, Admin*, Configuracoes
│       ├── context/AppContext.jsx    # Estado global + cliente HTTP + config dinâmica
│       ├── config/brand.js           # ← Valores padrão do white-label
│       └── utils/format.js           # Formatação BRL/data/máscaras
└── README.md
```

## Rodando localmente

**Backend** (Python 3.12+):

```bash
cd backend
python -m venv venv
venv\Scripts\activate              # Windows | source venv/bin/activate (Linux/Mac)
pip install -r requirements.txt
copy .env.example .env             # Linux/Mac: cp .env.example .env
uvicorn main:app --reload
```

A API sobe em `http://127.0.0.1:8000` (Swagger em `/docs`). Sem `DATABASE_URL`, um banco SQLite é criado automaticamente.

Gere as credenciais iniciais para o `.env`:

```bash
# SECRET_KEY
python -c "import secrets; print(secrets.token_hex(32))"

# ADMIN_PASSWORD_HASH (troque SuaSenhaForte pela senha desejada)
python -c "import bcrypt; print(bcrypt.hashpw(b'SuaSenhaForte', bcrypt.gensalt(rounds=12)).decode())"
```

> Alternativa sem hash: defina apenas `ADMIN_PASSWORD` no `.env`. Após o primeiro login, a senha pode ser trocada pelo painel (o hash passa a ser salvo no banco automaticamente).

**Frontend** (Node.js 18+):

```bash
cd frontend
npm install
npm run dev
```

Site em `http://localhost:5173` · Painel em `/admin/login`. Sem `VITE_API_URL`, o frontend aponta para `http://127.0.0.1:8000`.

## Variáveis de ambiente (backend)

| Variável | Exemplo | Descrição |
|---|---|---|
| `SECRET_KEY` | `token aleatório hex` | Chave de assinatura dos JWTs (**obrigatória**) |
| `ADMIN_USERNAME` | `admin` | Usuário do painel |
| `ADMIN_PASSWORD_HASH` | `$2b$12$...` | Hash bcrypt da senha (recomendado) |
| `ADMIN_PASSWORD` | `senha-em-texto` | Alternativa simples ao hash (uso em dev) |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | Conexão SQL (padrão: SQLite local) |
| `CORS_ORIGINS` | `https://meusite.com` | Origens permitidas, separadas por vírgula |
| `TOKEN_EXPIRE_HOURS` | `8` | Validade do token JWT |

Variáveis de ambiente (frontend, tempo de build):

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL base da API em produção |
| `PAGES` | Quando `true`, aplica base path `/portal-imoveis/` (GitHub Pages) |

## Referência da API

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| GET | `/api/health` | pública | Status do serviço |
| GET | `/api/config` | pública | Dados de marca/contato usados pelo site |
| POST | `/api/auth/login` | pública | Login do admin, retorna JWT |
| PUT | `/api/admin/senha` | JWT | Altera a própria senha (exige senha atual) |
| GET | `/api/imoveis` | pública | Listagem paginada com filtros e ordenação |
| GET | `/api/imoveis/{id}` | pública | Detalhes do imóvel |
| POST / PUT / DELETE | `/api/imoveis[/{id}]` | JWT | CRUD de imóveis |
| GET | `/api/admin/metrics` | JWT | Métricas do dashboard |
| POST | `/api/leads` | pública | Cadastro de lead de interesse |
| GET / DELETE | `/api/admin/leads[/{id}]` | JWT | Gestão de leads |
| PUT | `/api/admin/leads/{id}/status` | JWT | Move lead no funil do CRM (Kanban) |
| POST | `/api/demandas` | pública | Cadastro de demanda passiva ("não achou o que procura?") |
| GET / PUT / DELETE | `/api/admin/demandas[/{id}]` | JWT | Gestão das demandas de busca |
| GET | `/api/imoveis/{id}/fotos/{indice}` | pública | Foto com marca d'água (nome + CRECI) |
| GET | `/api/feed/{portal}.xml` | pública | Feed XML (`vivareal`, `zap` ou `olx`) para portais |
| GET / PUT | `/api/admin/configuracoes` | JWT* | Leitura* e edição das configurações do site |

\* A leitura usa a rota pública `/api/config`; chaves sensíveis (como hashes de senha) nunca são expostas.

## Personalização (white-label)

Dois níveis, ambos sem deploy:

1. **Pelo painel** (aba Configurações): nome do site, CRECI, WhatsApp, telefone exibido e e-mail — salvos no banco e aplicados no site imediatamente.
2. **Valores padrão e tema**: `frontend/src/config/brand.js` define os valores iniciais, cidade/estado padrão, cores primária/secundária (aplicadas como variáveis CSS/Tailwind), tipos de imóvel e comodidades disponíveis.

## Deploy em produção

**Banco (Supabase ou similar)** — crie o projeto, copie a connection string (pooler, porta 6543) e use como `DATABASE_URL`. As tabelas são criadas automaticamente na primeira inicialização.

**Backend (Railway)** — crie o serviço apontando para este repositório. O `Dockerfile` na raiz é detectado automaticamente: instala as dependências do `backend/`, expõe a aplicação na porta `$PORT` e roda as migrations (`create_all`) no start. Configure as variáveis de ambiente listadas acima.

**Frontend (GitHub Pages)** — o workflow `.github/workflows/deploy-pages.yml` builda o frontend a cada push em `main` (com `VITE_API_URL` da sua API) e publica via `actions/deploy-pages`. O `index.html` é duplicado como `404.html` para funcionar como SPA em rotas diretas.

## Segurança

- Nenhuma credencial versionada: tudo via variáveis de ambiente (`.env.example` como referência)
- Senhas com hash bcrypt (cost 12); comparação em tempo constante para o usuário
- JWT HS256 com expiração configurável; rotas de escrita protegidas por dependência FastAPI
- Troca de senha exige a senha atual e gera novo hash no banco
- Validação estrita de inputs com Pydantic v2 (limites de tamanho, enums, sanitização)
- Handler global de exceções: nenhum traceback exposto ao cliente
- CORS restrito às origens declaradas; endpoint público de configuração filtra chaves sensíveis

---

Desenvolvido por [pedro-henrique-silva-oliveira](https://github.com/pedro-henrique-silva-oliveira).
