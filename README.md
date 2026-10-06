# 💰 Finance Control

Aplicação full stack para controle financeiro pessoal: registre receitas e despesas, acompanhe o saldo do mês e veja para onde vai o seu dinheiro em cada categoria.

## Funcionalidades

- **Cadastro e login** com senha criptografada (bcrypt) e autenticação por token JWT com validade de 1 dia
- **Dashboard** com saldo, receitas e despesas do mês e as últimas transações
- **Transações**: criar, editar e excluir, agrupadas por mês com o resumo de cada mês
- **Categorias**: gastos e receitas por categoria com porcentagem, navegação entre meses e criação das suas próprias categorias
- **Perfil**: editar nome e e-mail e trocar a senha
- Cada usuário só acessa os próprios dados (o dono é sempre identificado pelo token)

## Tecnologias

| Frontend | Backend |
|---|---|
| React 19 + Vite | Node.js + Express 5 |
| React Router | Sequelize + MySQL |
| Axios | JWT + bcryptjs |
| Bootstrap Icons | dotenv, cors |

## Como rodar

Pré-requisitos: **Node.js 20+** e **MySQL** rodando.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # preencha com os dados do seu MySQL e um JWT_SECRET
```

Crie o banco (o nome definido em `DB_NAME`) e rode:

```bash
npm run dev                  # cria as tabelas e sobe a API em http://localhost:3000
node seeds/categorySeed.js   # categorias padrão (Salário, Alimentação, Moradia…)
node seeds/demoSeed.js       # opcional: conta demo com 3 meses de transações
```

Conta demo: `demo@financecontrol.dev` / `demo123456`

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # opcional: VITE_API_URL, se a API não estiver em localhost:3000
npm run dev            # http://localhost:5173
```

## Estrutura

```
backend/
  config/        conexão com o MySQL (Sequelize)
  controllers/   regras de negócio (auth, usuários, categorias, transações)
  middlewares/   validação do token JWT
  models/        User, Category, Transaction e relacionamentos
  routes/        rotas da API
  seeds/         categorias padrão e conta demo
  scripts/       migrações pontuais
frontend/
  src/pages/     Login, Cadastro, Dashboard, Transações, Categorias, Perfil
  src/context/   sessão do usuário
  src/services/  cliente da API (axios)
  src/utils/     formatação de moeda e datas
```

## Rotas da API

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/register` | Cria a conta e devolve o token |
| POST | `/auth/login` | Faz login e devolve o token |
| GET / PUT | `/users/me` | Ver e editar o próprio perfil |
| PUT | `/users/me/password` | Trocar a senha |
| GET / POST | `/categories` | Listar (padrão + suas) e criar |
| PUT / DELETE | `/categories/:id` | Editar e excluir as suas categorias |
| GET / POST | `/transactions` | Listar e criar transações |
| GET / PUT / DELETE | `/transactions/:id` | Ver, editar e excluir uma transação |

Todas as rotas, exceto `/auth`, exigem o cabeçalho `Authorization: Bearer <token>`.

---

Feito por **Matheus Muniz** · [LinkedIn](https://www.linkedin.com/in/matheus-muniz-920036429) · [GitHub](https://github.com/matheusmz12)
