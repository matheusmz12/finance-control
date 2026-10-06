import "dotenv/config";
import express from "express";
import cors from "cors";
import sequelize from "./config/conn.js";

import "./models/associations.js";

//import das rotas
import UserRoutes from "./routes/UserRoutes.js";
import CategoryRoutes from "./routes/CategoryRoutes.js";
import TransactionRoutes from "./routes/TransactionRoutes.js";
import AuthRoutes from "./routes/AuthRoutes.js";

const app = express();

//middlewares
// Em produção, CORS_ORIGIN limita quem pode chamar a API (ex.: o domínio do frontend)
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json());

//rotas

app.use("/users", UserRoutes);
app.use("/categories", CategoryRoutes);
app.use("/transactions", TransactionRoutes);
app.use("/auth", AuthRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Finance Control API funcionando!",
  });
});

const PORT = process.env.PORT || 3000;

sequelize
  .sync()
  // .sync({force:true})
  .then(() => {
    app.listen(PORT, () => {
      console.log(`App rodando na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Erro ao conectar com o banco:", error);
  });
