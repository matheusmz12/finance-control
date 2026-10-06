import { DataTypes, Model } from "sequelize";
import sequelize from "../config/conn.js";

class Transaction extends Model {}

Transaction.init(
  {
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM("ENTRADA", "SAIDA"),
      allowNull: false,
    },

    // Só a data (AAAA-MM-DD), sem hora: evita a transação "voltar um dia" por causa do fuso horário
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Transaction",
  },
);

export default Transaction;
