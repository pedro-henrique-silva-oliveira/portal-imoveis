# Instruções de Reconstrução do Portal Imobiliário Genérico (White-Label)

Este documento contém o prompt estruturado e as diretrizes completas para você copiar e colar no **OpenCode** (no VS Code) para reconstruir o seu portal imobiliário do absoluto zero, de forma profissional, segura e totalmente parametrizada (genérica).

---

## 🎯 Instruções para você dar ao OpenCode

Copie e cole todo o conteúdo abaixo no chat do seu **OpenCode** (recomenda-se usar com o modelo Gemini configurado ou o Big Pickle, conforme o que preferir para geração de código).

---

```markdown
Você é um Engenheiro de Software Sênior especialista em segurança e arquitetura Full-Stack.
Quero reconstruir meu portal imobiliário do absoluto zero. Perdi o código antigo e quero uma versão totalmente nova, seguindo as melhores práticas de desenvolvimento, padrões rígidos de segurança, com dados estruturados em banco de dados (intercambiável entre SQLite local e PostgreSQL na nuvem via SQLAlchemy) e de forma "White-Label" (totalmente genérica, sem nomes de corretores específicos fixados no código, usando um arquivo de configuração central para definir marca, CRECI, contatos e cores).

### 🛠️ STACK TECNOLÓGICA REQUERIDA
- **Monorepo**: Pasta `/backend` e pasta `/frontend` na raiz do projeto.
- **Backend**: Python 3.12+ utilizando FastAPI, SQLAlchemy (ORM), Uvicorn, Jose (para JWT), Pydantic v2 (validações) e Python-Dotenv.
- **Frontend**: React 19 + Vite, Tailwind CSS v4, React Router DOM v7, React-Leaflet (OpenStreetMap) e Lucide React para ícones.
- **Banco de Dados**: Configurado via SQLAlchemy de forma que mude facilmente entre SQLite local (`sqlite:///./imobiliaria.db`) e PostgreSQL na nuvem (`postgresql://...`) apenas mudando a string de conexão no `.env`.

---

### 🔒 NORMAS DE SEGURANÇA E BOAS PRÁTICAS (OBRIGATÓRIO)
1. **Configuração via Ambiente (.env)**: Nenhuma credencial, senha, chave JWT ou URL de API deve estar hardcoded. Crie arquivos `.env.example` para o backend e frontend.
2. **Autenticação Segura**: O login administrativo do painel deve ser feito via JWT (JSON Web Tokens). A senha deve ser criptografada de forma segura (usando bcrypt via passlib no backend) ou validada contra um hash forte definido de forma segura. O token JWT deve expirar em 8 horas.
3. **CORS Seguro**: Configure o middleware de CORS no FastAPI para aceitar apenas domínios explícitos declarados na variável `CORS_ORIGINS` do arquivo `.env`.
4. **Validação de Inputs**: Toda requisição ao backend deve passar por validação estrita com Pydantic Schemas (especialmente dados sensíveis de CPF na simulação e campos do formulário de leads).
5. **Tratamento de Exceções**: Implemente blocos try/except globais e middlewares de erro para que a aplicação nunca exponha tracebacks brutos para o cliente final e nunca trave de forma silenciosa.
6. **Deploy Inteligente**: Adicione suporte para A2WSGI no backend para facilitar o deploy no PythonAnywhere, prevendo o carregamento correto do banco e do arquivo `.env` de forma relativa.

---

### 🎨 REQUISITO "WHITE-LABEL" (SITE GENÉRICO)
Crie um arquivo de configuração central no frontend (ex: `/frontend/src/config/brand.js`) que exporte constantes globais para que o site possa ser personalizado para qualquer corretor mudando apenas esse arquivo:
- `BRAND_NAME`: Nome comercial da imobiliária/corretor.
- `CRECI`: Registro profissional (obrigatório por lei).
- `WHATSAPP_NUMBER`: Número de contato principal formatado com DDI/DDD para a API de redirecionamento.
- `DEFAULT_CITY` e `DEFAULT_STATE`: Para centrar as buscas padrão.
- `PRIMARY_COLOR`, `SECONDARY_COLOR`: Classes ou variáveis do Tailwind CSS para adaptar a paleta visual facilmente.

---

### 📋 MÓDULOS E FUNCIONALIDADES QUE DEVEM SER CRIADOS

#### 1. Módulo de Imóveis (Catálogo & Busca)
- **Modelagem de Dados (FastAPI/SQLAlchemy)**: Tabela `Property` com: id, titulo, descricao, preco, tipo (casa, apartamento, terreno, comercial), transacao (venda, aluguel), quartos, suites, banheiros, vagas, area (m²), CEP, endereco, bairro, cidade, latitude, longitude, fotos (lista de URLs ou strings base64), features (JSON contendo booleanos como piscina, churrasqueira, etc.) e data de criação.
- **API Endpoints**:
  - `GET /api/imoveis`: Listagem paginada e filtrável (por tipo, transação, preço mínimo/máximo, bairro, cidade, mínimo de quartos).
  - `GET /api/imoveis/{id}`: Detalhes de um imóvel específico.
- **Frontend SPA**:
  - **Home**: Grid responsivo mostrando os imóveis disponíveis com filtros avançados e ordenação de busca (mais recentes, preço crescente/decrescente, área).
  - **Página de Detalhes (/imovel/:id)**: Galeria de fotos responsiva, ficha técnica, descrição textual, mapa Leaflet usando coordenadas geocodificadas e botão fixo flutuante de WhatsApp.

#### 2. Calculadora de Financiamento & Análise de Crédito via CPF
- **Calculadora Price**: Slider de entrada (10-80%), taxa de juros anual (5-15%) e prazo (5-35 anos). Cálculos feitos via JavaScript local na página de detalhes.
- **Simulador de Crédito (POST /api/simular/credito)**:
  - Input com máscara de CPF no frontend.
  - O backend deve validar o CPF usando o algoritmo matemático real de dígitos verificadores.
  - Regra de Crédito: A parcela estimada não pode comprometer mais de 30% da renda informada do cliente. Exiba visualmente se o crédito foi aprovado (Verde) ou Reprovado (Vermelho), com links direcionando para o simulador oficial da Caixa.

#### 3. Painel Administrativo (/admin)
- **Autenticação**: Página de login limpa que consome `POST /api/auth/login` e armazena o token JWT de forma segura.
- **Dashboard**: Cards com métricas rápidas (Total de Imóveis, Imóveis para Venda, Imóveis para Locação).
- **CRUD Completo de Imóveis**: Formulário para cadastrar, editar e excluir imóveis com:
  - Upload de imagens convertidas para strings Base64 de forma limpa.
  - Botão de geocodificação automática: O usuário digita o CEP e a aplicação busca as coordenadas de Latitude/Longitude consumindo APIs gratuitas públicas (como AwesomeAPI ou Nominatim) preenchendo automaticamente para o mapa Leaflet.
- **Gestão de Leads**: Aba para visualizar mensagens de leads capturadas nos formulários do site (nome, e-mail, telefone, imóvel de interesse, data e mensagem).

#### 4. Gerenciador de Estado Global (React AppContext)
- Centralizar o estado do catálogo, carregamentos (loaders), dados do administrador autenticado, favoritos salvos no `localStorage` e submissão dos formulários de contatos (leads).

---

### 📂 ESTRUTURA DE PASTAS DESEJADA
Por favor, gere e organize a estrutura do projeto seguindo este modelo:
```text
/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── auth.py
│   ├── wsgi.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── config/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── .env.example
└── README.md
```

Por favor, comece criando os arquivos de configuração, o banco de dados e o modelo de autenticação do Backend. Em seguida, vamos avançar passo a passo!
```
---

## 🚀 Como usar este prompt no OpenCode

1. **Abra o VS Code** na pasta onde você deseja iniciar o seu projeto.
2. Ative o terminal do **OpenCode** apertando as teclas **`Ctrl + Esc`** (no Windows/Linux) ou **`Cmd + Esc`** (no Mac).
3. Se desejar, configure o modelo que vai usar (use `/models` para escolher o modelo desejado).
4. **Cole o prompt acima** inteirinho na barra de digitação do OpenCode e dê Enter.
5. O agente começará a gerar e estruturar a sua pasta `/backend` e `/frontend` do zero, criando os códigos de forma automática!

---

## 💾 Configurações recomendadas pós-geração

### 1. Conexão do Banco de Dados PostgreSQL (Ex: Supabase ou Neon)
Quando o OpenCode gerar o arquivo `/backend/.env`, mude a variável `DATABASE_URL` para o endereço do seu banco de dados na nuvem:
```env
DATABASE_URL=postgresql://seu_usuario:sua_senha@seu_host:5432/seu_banco
```
Se quiser testar localmente antes de enviar para a nuvem, mantenha apontando para o SQLite padrão:
```env
DATABASE_URL=sqlite:///./imobiliaria.db
```

### 2. Subindo para o GitHub
Após o OpenCode gerar todos os arquivos do seu projeto, abra o seu terminal local e configure o seu GitHub:
```bash
git init
git add .
git commit -m "Initial commit - Portal Imobiliario White-Label"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git
git push -u origin main
```
