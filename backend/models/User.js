import { DataTypes, Model } from "sequelize";
import sequelize from "../config/conn.js";

class User extends Model {}

User.init(
  //1º parametro o que vai ter dentro das tabelas

  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  //2º parametro qual banco e o nome da tabela
  {
    sequelize,
    modelName: "User",
    //tableName: 'users' // Se você quiser especificar o nome da tabela no banco de dados
  },
);

export default User;
