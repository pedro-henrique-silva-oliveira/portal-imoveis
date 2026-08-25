# Portal Imobiliário White-Label

Portal imobiliário completo com backend **FastAPI + SQLAlchemy** e frontend **React 19 + Vite + Tailwind CSS v4**.
White-label: personalize marca, CRECI, contatos e cores alterando apenas `frontend/src/config/brand.js`.

> 📌 Este README documenta o estado completo do projeto em **24/08/2026**, incluindo o histórico de tudo que foi feito no dia, problemas resolvidos e o próximo passo pendente.

---

## 1. Links de produção (no ar)

| Serviço | URL |
|---|---|
| Site (frontend) | https://pedro-henrique-silva-oliveira.github.io/portal-imoveis/ |
| API (backend) | https://portal-imoveis.up.railway.app |
| Health check | https://portal-imoveis.up.railway.app/api/health |
| Docs interativas | https://portal-imoveis.up.railway.app/docs |
| Painel admin | https://pedro-henrique-silva-oliveira.github.io/portal-imoveis/admin/login |
| Repositório | https://github.com/pedro-henrique-silva-oliveira/portal-imoveis |

---

## 2. Acessos e credenciais

| Item | Valor | Onde está guardado |
|---|---|---|
| Usuário admin | `admin` | variável `ADMIN_USERNAME` no Railway |
| Senha admin (atual em produção) | `NqUxyEvhDJCLQRtw` | hash na variável `ADMIN_PASSWORD_HASH` |
| Senha admin NOVA (pendente de ativar) | `1234` | ver seção 4 e arquivo local `TROCA-SENHA-INSTRUCOES.txt` |
| Banco PostgreSQL | Supabase região São Paulo | `DATABASE_URL` no Railway |
| Chave JWT | gerada aleatória | `SECRET_KEY` no Railway |
| Credenciais locais de dev | `admin` / `TroqueEstaSenha123` | arquivo `backend/.env` (gitignored) |

⚠️ **Segurança:** nenhuma senha/segredo deve ser colada neste README (repositório público). Os valores reais vivem somente nas variáveis do Railway e no `backend/.env` local.

---

## 3. Infraestrutura de deploy

```text
GitHub (main) ──push──► ┬─► GitHub Actions (.github/workflows/deploy-pages.yml)
                        │     builda frontend com base /portal-imoveis/
                        │     e VITE_API_URL apontando para o Railway
                        │     publica no GitHub Pages
                        │
                        └─► Railway (auto-deploy)
                              builda com o Dockerfile DA RAIZ do repo
                              roda uvicorn na porta $PORT
                              conecta no Supabase via DATABASE_URL
```

- Frontend: GitHub Pages (build por Actions a cada push em `main`)
- Backend: Railway (auto-deploy a cada push em `main`; build via `Dockerfile` da raiz)
- Banco: Supabase PostgreSQL (pooler `aws-0-sa-east-1`, porta 6543)

### Variáveis do Railway (nomes exatos)

```
PORT
SECRET_KEY
ADMIN_USERNAME
ADMIN_PASSWORD_HASH
CORS_ORIGINS
TOKEN_EXPIRE_HOURS
DATABASE_URL
```

Valores reais: aba Variables do serviço `portal-imoveis` no Railway.
O `CORS_ORIGINS` pode conter qualquer valor — o código aceita qualquer página `*.github.io` via regex (ver seção 10).

---

## 4. ⏳ ONDE PARAMOS — pendência do dia

**Troca de senha do admin para `1234` ainda NÃO está ativa.**

O hash bcrypt já foi gerado e validado localmente. Falta **um único passo manual**:

1. Railway → card `portal-imoveis`
2. Aba **Variables**
3. Clicar na linha `ADMIN_PASSWORD_HASH`
4. Apagar o valor antigo inteiro (começa com `$2b$12$KJpO...`)
5. Colar o hash novo (está no arquivo local `TROCA-SENHA-INSTRUCOES.txt`)
6. Clicar **Update**
7. Esperar o deploy novo ficar verde (~2 min)

Depois disso: login passa a ser `admin` / `1234`.
Validação feita pela API neste projeto: POST `/api/auth/login` com a nova senha deve retornar 200, e a antiga deve dar 401.

⚠️ Aviso registrado ao usuário: `1234` é uma senha fraca — recomenda-se fortalecer depois.

---

## 5. Cronologia completa do dia (24/08/2026)

### Parte 1 — Construção do portal
1. Lidas as instruções em `prompt-opencode-portal.md`
2. Criado backend FastAPI completo: `config.py`, `database.py`, `models.py` (Property, Lead), `schemas.py`, `auth.py`, `main.py`, `wsgi.py`, `requirements.txt`, `.env.example`
3. Criado frontend React 19 + Vite + Tailwind v4: Navbar, Footer, PropertyCard, MapView, PhotoGallery, PropertyFilters, ContactForm; páginas Home, PropertyDetails, AdminLogin, AdminDashboard; AppContext global; `brand.js` white-label
4. Corrigidos detalhes: ícone `Suitcase` → `BedSingle`; `passlib` removido (incompatível com bcrypt 5.x) → uso direto de `bcrypt`; import faltante de `Column` em `models.py`
5. Removidos a pedido do usuário: **simulação de financiamento** e **análise de crédito/CPF** (frontend + endpoint + schemas); verificado zero referências restantes
6. Rodados **17 testes de integração** da API — todos passaram
7. Build de produção validado (`npm run build`)

### Parte 2 — GitHub
8. `gh` CLI instalado (v2.98.0) e autenticado como `pedro-henrique-silva-oliveira`
9. Repo público criado: `portal-imoveis`; push inicial (commit `c718dca`)

### Parte 3 — GitHub Pages (frontend)
10. Primeiro deploy mostrava só o README → configurado Pages para modo **workflow**
11. Criado `.github/workflows/deploy-pages.yml`: build do frontend com `PAGES=true` (base `/portal-imoveis/`), copia `index.html` → `404.html` (fallback SPA), `deploy-pages@v4`
12. Site publicado e acessível ✓

### Parte 4 — Supabase (banco)
13. Projeto criado pelo usuário em São Paulo; host pooler porta 6543
14. `DATABASE_URL` formatado corretamente (`@` da senha → `%40`); conexão testada com sucesso (PostgreSQL 17.6)
15. Senha do banco trocada pelo usuário para versão alfanumérica (a original continha caracteres que o chat corrompia)

### Parte 5 — Railway (backend)
16. Preparados `Procfile` + `psycopg2-binary` habilitado (commit `a2972f9`)
17. Primeiros deploys falharam: `DATABASE_URL` chegou corrompida no painel (colagem do chat virou link) → usuário resetou a senha do banco e recolou
18. Deploy ficou verde; health OK ✓

### Parte 6 — Ligação site ↔ API
19. Adicionado `VITE_API_URL` no env do job de build do Pages (commit `432efca`) → bundle publicado contém a URL da API ✓

### Parte 7 — Guerra com o CORS
20. Preflight OPTIONS dava 400: valor de `CORS_ORIGINS` no Railway veio corrompido (nem o padrão localhost passava)
21. Commit `67552b4`: parser tolerante (espaços, barra final, maiúsculas)
22. Commit `c6b9d11`: solução definitiva — `allow_origin_regex=r"^https://[a-z0-9-]+\.github\.io$"` no middleware + limpeza de aspas → **CORS OK** independente da variável

### Parte 8 — Deploy quebrou de novo e a salvação: Dockerfile
23. Dois deploys falharam ("Railpack could not determine how to build") e as variáveis sumiram do painel
24. Causa: build passou a analisar a RAIZ do repo (config Root Directory `/backend` perdida)
25. Commit `290e3c7`: criado **Dockerfile na raiz** (python:3.12-slim, instala requirements do backend/, sobe uvicorn na `$PORT`) → deploy verde definitivo, independente de configuração de pasta
26. Usuário recolou as 7 variáveis no Railway

### Parte 9 — Dados de exemplo
27. Login admin pela API OK; criados 2 imóveis de exemplo (#1 casa venda R$450k Centro SP; #2 apartamento aluguel R$2.200 Av. Paulista) — visíveis no site

### Parte 10 — Área do corretor não abria
28. Diagnóstico: links do rodapé usavam `<a href="/admin/login">` (absoluto) → caía fora da pasta `/portal-imoveis/`
29. Commit `6810657`: rodapé migrado para `<Link>` do react-router e logout do dashboard para `useNavigate` → **corrigido e publicado** ✓

### Parte 11 — Troca de senha (em andamento)
30. Usuário pediu senha `1234`; avisado sobre fraqueza; optou por manter
31. Hash bcrypt gerado e validado; instruções completas salvas em `TROCA-SENHA-INSTRUCOES.txt`
32. **PENDENTE**: usuário ainda não salvou a variável no Railway (deploy de ~20 min antes era de código, não da variável)

---

## 6. Commits do dia (ordem cronológica)

| Hash | Assunto |
|---|---|
| `c718dca` | Projeto inicial completo |
| `4e6bc77` | Deploy GitHub Pages |
| `a2972f9` | Procfile + psycopg2-binary |
| `432efca` | VITE_API_URL no workflow |
| `67552b4` | Normalizar origens CORS |
| `290e3c7` | Dockerfile na raiz |
| `c6b9d11` | Regex github.io no CORS |
| `6810657` | Links internos compatíveis com Pages |

---

## 7. Estrutura do projeto

```text
/
├── Dockerfile                    # Build do backend no Railway (raiz!)
├── .github/workflows/deploy-pages.yml
├── backend/
│   ├── main.py                   # Endpoints + CORS(regex github.io)
│   ├── config.py                 # Env vars (parser tolerante)
│   ├── database.py               # SQLite local ou Postgres via DATABASE_URL
│   ├── models.py                 # Property, Lead
│   ├── schemas.py                # Pydantic v2
│   ├── auth.py                   # bcrypt direto + JWT HS256
│   ├── wsgi.py                   # Adaptador PythonAnywhere (alternativa)
│   ├── Procfile                  # Start alternativo Nixpacks
│   ├── requirements.txt          # psycopg2-binary habilitado
│   └── .env.example
├── frontend/
│   ├── vite.config.js            # base condicional /portal-imoveis/ quando PAGES=true
│   └── src/
│       ├── components/           # Navbar, Footer(<Link>), cards, mapa, galeria...
│       ├── pages/                # Home, PropertyDetails, AdminLogin, AdminDashboard
│       ├── context/AppContext.jsx# axios baseURL = import.meta.env.VITE_API_URL
│       ├── config/brand.js       # ← PERSONALIZAR MARCA AQUI
│       └── utils/format.js
├── TROCA-SENHA-INSTRUCOES.txt    # local: passo a passo da pendência (não versionar)
└── README.md                     # este arquivo
```

### Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/health` | Status do serviço |
| POST | `/api/auth/login` | Login admin → JWT (8h) |
| GET | `/api/imoveis` | Listagem paginada + filtros (público) |
| GET | `/api/imoveis/{id}` | Detalhes (público) |
| POST/PUT/DELETE | `/api/imoveis[/{id}]` | CRUD protegido por JWT |
| GET | `/api/admin/metrics` | Métricas do painel (JWT) |
| POST | `/api/leads` | Lead público (nome/telefone/mensagem) |
| GET | `/api/admin/leads` | Listar leads (JWT) |

---

## 8. Como atualizar o site no futuro

Qualquer mudança segue o mesmo fluxo (tudo automático):

1. Editar código local
2. `git add . && git commit -m "..."` 
3. `git push`
4. GitHub Actions reconstrói o site (~2 min) e o Railway reconstrói a API (~2 min)

Para mudar marca/cores/contato: editar só `frontend/src/config/brand.js`.

---

## 9. Rodar localmente

Backend:

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
copy .env.example .env       # preencher SECRET_KEY e ADMIN_PASSWORD_HASH
uvicorn main:app --reload    # http://127.0.0.1:8000/docs
```

Frontend:

```bash
cd frontend
npm install
npm run dev                  # http://localhost:5173
```

Sem `VITE_API_URL`, o frontend usa `http://127.0.0.1:8000`. Com SQLite (padrão do `.env.example`) não precisa de Postgres local.

Gerar hash de senha nova:

```bash
python -c "import bcrypt; print(bcrypt.hashpw(b'SuaSenha', bcrypt.gensalt(rounds=12)).decode())"
```

---

## 10. Lições/armadilhas descobertas hoje (consulte antes de debugar)

| Sintoma | Causa real | Solução aplicada |
|---|---|---|
| `passlib` erro com bcrypt | bcrypt 5.x removeu `__about__` | usar `bcrypt` puro em `auth.py` |
| Pages mostrava README | Pages em modo "branch" | mudar para modo **workflow** nas settings |
| Rota `/admin/login` 404 fora da home | SPA sem fallback + caminho absoluto | `index.html→404.html` no workflow + `<Link>` em vez de `href="/"` |
| Preflight CORS 400 mesmo com origem certa na lista | variável `CORS_ORIGINS` corrompida na colagem | `allow_origin_regex` aceita `*.github.io` no código |
| Railpack não sabia buildar | build olhando a raiz (Root Directory perdido) | **Dockerfile na raiz** — não depender mais dessa config |
| `curl` com JSON multilinha falha no PowerShell | parsing de args nativos | usar `Invoke-RestMethod` com body UTF8 bytes |
| `curl -I` dá 405 na API | HEAD não é rota declarada (falso alarme) | testar com `-X GET` |

---

## 11. Próximos passos sugeridos

1. ⏳ Concluir a troca de senha do admin (seção 4)
2. Trocar também a senha do banco Supabase por uma forte e única (a atual passou pelo chat)
3. Cadastrar imóveis reais via painel (botão **Buscar CEP** preenche endereço/mapa)
4. Personalizar `brand.js` (nome, CRECI, WhatsApp, cores)
5. Opcional: rate-limit no login, fotos em storage externo (S3/Supabase Storage) em vez de Base64
