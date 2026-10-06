// Migração única: muda a coluna Transactions.date de DATETIME para DATE (só a data).
// As datas foram salvas como meia-noite UTC, então a parte da data continua a mesma.
// Uso: node scripts/migrate-date-only.js
import sequelize from "../config/conn.js";

const [[column]] = await sequelize.query("SHOW COLUMNS FROM Transactions WHERE Field = 'date'");

if (column.Type.toLowerCase() === "date") {
  console.log("A coluna date já é DATE. Nada a fazer.");
} else {
  await sequelize.query("ALTER TABLE Transactions MODIFY COLUMN date DATE NOT NULL");
  console.log(`Coluna date convertida de ${column.Type} para DATE.`);
}

await sequelize.close();
