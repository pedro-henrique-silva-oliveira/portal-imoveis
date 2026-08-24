# Portal Imobiliário White-Label

Portal imobiliário completo (monorepo) com backend em **FastAPI + SQLAlchemy** e frontend em **React 19 + Vite + Tailwind CSS v4**. Totalmente genérico: personalize marca, CRECI, contatos e cores alterando **um único arquivo** (`frontend/src/config/brand.js`).

## Funcionalidades

- Catálogo de imóveis com busca avançada, filtros, ordenação e paginação
- Página de detalhes com galeria de fotos, ficha técnica, mapa Leaflet (OpenStreetMap) e botão flutuante de WhatsApp
- Painel administrativo protegido por JWT (expira em 8h): dashboard com métricas, CRUD de imóveis, upload de imagens em Base64, geocodificação automática por CEP (AwesomeAPI / BrasilAPI / Nominatim) e gestão de leads
- Favoritos persistidos em `localStorage` e estado global centralizado (AppContext)
- Banco intercambiável: SQLite local ou PostgreSQL na nuvem apenas trocando `DATABASE_URL`

## Estrutura

```text
/
├── backend/
│   ├── main.py          # Endpoints FastAPI + CORS + tratamento global de erros
│   ├── config.py        # Leitura centralizada das variáveis de ambiente
│   ├── database.py      # Engine/Session SQLAlchemy (SQLite ou PostgreSQL)
│   ├── models.py        # Modelos Property e Lead
│   ├── schemas.py       # Validações Pydantic v2
│   ├── auth.py          # JWT + bcrypt (passlib) + dependência de admin
│   ├── wsgi.py          # Adaptador A2WSGI para deploy no PythonAnywhere
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   └── src/
│       ├── components/  # Navbar, Footer, cards, mapa, galeria, formulários...
│       ├── pages/       # Home, Detalhes, AdminLogin, AdminDashboard
│       ├── context/     # AppContext (estado global)
│       ├── config/      # brand.js  ← PERSONALIZE AQUI
│       └── utils/
└── README.md
```

## Backend — instalação e execução

Requisitos: Python 3.12+

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt

copy .env.example .env    # Windows (Linux/Mac: cp .env.example .env)
```

Gere as credenciais seguras e preencha o `.env`:

```bash
# SECRET_KEY (chave aleatória)
python -c "import secrets; print(secrets.token_hex(32))"

# ADMIN_PASSWORD_HASH (troque SuaSenhaForte123 pela senha desejada)
python -c "import bcrypt; print(bcrypt.hashpw(b'SuaSenhaForte123', bcrypt.gensalt()).decode())"
```

Execute:

```bash
uvicorn main:app --reload
```

API disponível em `http://127.0.0.1:8000` · Documentação interativa: `/docs`

### Principais endpoints

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/login` | Login do admin (retorna JWT) |
| GET | `/api/imoveis` | Listagem paginada/filtrável |
| GET | `/api/imoveis/{id}` | Detalhes do imóvel |
| POST/PUT/DELETE | `/api/imoveis[/{id}]` | CRUD (protegido por JWT) |
| GET | `/api/admin/metrics` | Métricas do painel (JWT) |
| POST | `/api/leads` | Cadastro público de lead |
| GET | `/api/admin/leads` | Listagem de leads (JWT) |

### Usar PostgreSQL (Supabase, Neon etc.)

1. Descomente a linha `psycopg2-binary` em `backend/requirements.txt` e rode `pip install -r requirements.txt`.
2. No `.env`, troque a conexão:

```env
DATABASE_URL=postgresql://seu_usuario:sua_senha@seu_host:5432/seu_banco
```

## Frontend — instalação e execução

Requisitos: Node.js 18+

```bash
cd frontend
npm install
copy .env.example .env   # configure VITE_API_URL se necessário
npm run dev
```

Site em `http://localhost:5173` · Painel em `http://localhost:5173/admin/login`

Build de produção:

```bash
npm run build
```

## Personalização (White-Label)

Edite apenas `frontend/src/config/brand.js`:

- `BRAND_NAME`, `CRECI`, `WHATSAPP_NUMBER`, `EMAIL_CONTATO`, `TELEFONE_EXIBICAO`
- `DEFAULT_CITY`, `DEFAULT_STATE`
- `PRIMARY_COLOR`, `SECONDARY_COLOR` (aplicadas dinamicamente como variáveis CSS/Tailwind)

## Deploy no PythonAnywhere (backend)

1. Suba o projeto e instale as dependências no virtualenv do ambiente.
2. No arquivo WSGI da webapp, aponte para `backend/wsgi.py` (ele já carrega o `.env` relativo e expõe `application` via A2WSGI).
3. Configure `CORS_ORIGINS` no `.env` com o domínio real do frontend.

## Segurança implementada

- Nenhuma credencial hardcoded: tudo via `.env` (use os `.env.example`; nunca versione o `.env`)
- Senha do admin com hash bcrypt; token JWT HS256 com expiração de 8h
- CORS restrito aos domínios declarados em `CORS_ORIGINS`
- Validação estrita de inputs com Pydantic v2
- Handler global de exceções: nenhum traceback é exposto ao cliente

## Versionamento

```bash
git init
git add .
git commit -m "Initial commit - Portal Imobiliario White-Label"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git
git push -u origin main
```
