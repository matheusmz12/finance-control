/*
  Cria (ou recria) uma conta de demonstração com transações dos últimos 3 meses.
  Útil para testar o app e tirar prints sem usar dados pessoais.

  Uso:  node seeds/demoSeed.js
  Login: demo@financecontrol.dev  /  senha em DEMO_PASSWORD (padrão: demo123456)

  Rodar de novo apaga só os dados da conta demo e cria tudo outra vez.
  Precisa das categorias padrão (node seeds/categorySeed.js).
*/
import bcrypt from "bcryptjs";
import sequelize from "../config/conn.js";
import { User, Category, Transaction } from "../models/associations.js";

const DEMO_EMAIL = "demo@financecontrol.dev";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "demo123456";

// [mesesAtrás, dia, descrição, categoria, tipo, valor]
const ENTRIES = [
  [0, 5, "Salário", "Salário", "ENTRADA", 4800],
  [0, 3, "Landing page para cliente", "Freelance", "ENTRADA", 950],
  [0, 5, "Aluguel", "Moradia", "SAIDA", 1400],
  [0, 4, "Supermercado", "Alimentação", "SAIDA", 386.4],
  [0, 2, "Uber para a faculdade", "Transporte", "SAIDA", 42.9],
  [0, 1, "Conta de luz", "Contas", "SAIDA", 189.75],
  [0, 3, "Streaming", "Lazer", "SAIDA", 55.9],
  [0, 6, "Curso de React", "Educação", "SAIDA", 79.9],
  [0, 2, "Mensalidade da academia", "Academia", "SAIDA", 99.9],

  [1, 5, "Salário", "Salário", "ENTRADA", 4800],
  [1, 18, "Rendimento CDB", "Investimentos", "ENTRADA", 120.35],
  [1, 5, "Aluguel", "Moradia", "SAIDA", 1400],
  [1, 9, "Supermercado", "Alimentação", "SAIDA", 412.8],
  [1, 21, "Restaurante", "Alimentação", "SAIDA", 132],
  [1, 12, "Combustível", "Transporte", "SAIDA", 210],
  [1, 10, "Internet", "Contas", "SAIDA", 109.9],
  [1, 15, "Farmácia", "Saúde", "SAIDA", 64.3],
  [1, 26, "Cinema", "Lazer", "SAIDA", 48],
  [1, 2, "Mensalidade da academia", "Academia", "SAIDA", 99.9],

  [2, 5, "Salário", "Salário", "ENTRADA", 4800],
  [2, 14, "Site institucional", "Freelance", "ENTRADA", 1500],
  [2, 5, "Aluguel", "Moradia", "SAIDA", 1400],
  [2, 8, "Supermercado", "Alimentação", "SAIDA", 398.15],
  [2, 19, "Conta de água", "Contas", "SAIDA", 78.4],
  [2, 23, "Livro de JavaScript", "Educação", "SAIDA", 89.9],
  [2, 27, "Show", "Lazer", "SAIDA", 180],
  [2, 2, "Mensalidade da academia", "Academia", "SAIDA", 99.9],
];

// Data "AAAA-MM-DD" N meses atrás; no mês atual, nunca depois de hoje
function dateFor(monthsAgo, day) {
  const today = new Date();
  const base = new Date(today.getFullYear(), today.getMonth() - monthsAgo, 1);
  const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const safeDay = Math.min(day, lastDay, monthsAgo === 0 ? today.getDate() : lastDay);
  const month = String(base.getMonth() + 1).padStart(2, "0");
  return `${base.getFullYear()}-${month}-${String(safeDay).padStart(2, "0")}`;
}

async function seedDemo() {
  const [user] = await User.findOrCreate({
    where: { email: DEMO_EMAIL },
    defaults: { name: "Conta Demo", password: await bcrypt.hash(DEMO_PASSWORD, 10) },
  });

  // Recomeça do zero só os dados da conta demo
  await Transaction.destroy({ where: { userId: user.id } });
  await Category.destroy({ where: { userId: user.id } });

  const academia = await Category.create({ name: "Academia", type: "SAIDA", userId: user.id });

  const defaults = await Category.findAll({ where: { isDefault: true } });
  const byName = Object.fromEntries(defaults.map((category) => [category.name, category]));
  byName.Academia = academia;

  let created = 0;
  for (const [monthsAgo, day, description, categoryName, type, amount] of ENTRIES) {
    const category = byName[categoryName];
    if (!category) {
      console.warn(`Categoria "${categoryName}" não encontrada (rode node seeds/categorySeed.js).`);
      continue;
    }
    await Transaction.create({
      description,
      amount,
      type,
      date: dateFor(monthsAgo, day),
      userId: user.id,
      categoryId: category.id,
    });
    created++;
  }

  console.log(`Conta demo pronta: ${DEMO_EMAIL} (${created} transações).`);
  await sequelize.close();
}

seedDemo();
