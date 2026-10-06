import Transaction from "../models/Transaction.js";
import Category from "../models/Category.js";

const TYPES = ["ENTRADA", "SAIDA"];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/*
  Valida os dados de uma transação (usado no criar e no editar).
  Retorna { status, message } se algo estiver errado, ou null se estiver tudo certo.
*/
async function validateTransaction({ description, amount, type, date, categoryId }, userId) {
  if (!description || description.trim() === "" || !amount || !date || !type || !categoryId) {
    return { status: 400, message: "Todos os campos são obrigatórios" };
  }

  if (!TYPES.includes(type)) {
    return { status: 400, message: "Tipo de transação inválido" };
  }

  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) {
    return { status: 400, message: "O valor precisa ser maior que zero" };
  }

  if (!DATE_REGEX.test(date) || Number.isNaN(Date.parse(date))) {
    return { status: 400, message: "Data inválida" };
  }

  // A categoria precisa existir...
  const category = await Category.findByPk(categoryId);
  if (!category) {
    return { status: 404, message: "Categoria não encontrada" };
  }

  // ...ser padrão ou do próprio usuário...
  if (category.userId !== null && category.userId !== Number(userId)) {
    return { status: 403, message: "Você não pode usar essa categoria" };
  }

  // ...e ter o mesmo tipo da transação
  if (category.type !== type) {
    return { status: 400, message: "O tipo da transação não corresponde ao tipo da categoria" };
  }

  return null;
}

class TransactionController {
  static async create(req, res) {
    try {
      const { description, amount, type, date, categoryId } = req.body;
      const userId = req.user.id;

      const error = await validateTransaction(req.body, userId);
      if (error) {
        return res.status(error.status).json({ message: error.message });
      }

      const transaction = await Transaction.create({
        description: description.trim(),
        amount,
        type,
        date,
        userId,
        categoryId,
      });

      return res.status(201).json(transaction);
    } catch (error) {
      console.error("Erro ao criar transação:", error);
      return res.status(500).json({ message: "Erro ao criar transação" });
    }
  }

  static async getAll(req, res) {
    try {
      const userId = req.user.id;

      const transactions = await Transaction.findAll({
        where: {
          userId,
        },
        include: [
          {
            model: Category,
          },
        ],
        order: [["date", "DESC"]],
      });

      return res.status(200).json(transactions);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
      return res.status(500).json({ message: "Erro ao buscar transações" });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const transaction = await Transaction.findOne({
        where: {
          id,
          userId,
        },
        include: [
          {
            model: Category,
          },
        ],
      });

      if (!transaction) {
        return res.status(404).json({
          message: "Transação não encontrada",
        });
      }

      return res.status(200).json(transaction);
    } catch (error) {
      console.error("Erro ao buscar transação:", error);
      return res.status(500).json({ message: "Erro ao buscar transação" });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { description, amount, type, date, categoryId } = req.body;
      const userId = req.user.id;

      //procurar a transação
      const transaction = await Transaction.findOne({
        where: {
          id,
          userId,
        },
      });

      if (!transaction) {
        return res.status(404).json({
          message: "Transação não encontrada",
        });
      }

      const error = await validateTransaction(req.body, userId);
      if (error) {
        return res.status(error.status).json({ message: error.message });
      }

      //atualizar
      await transaction.update({
        description: description.trim(),
        amount,
        type,
        date,
        categoryId,
      });

      return res.status(200).json(transaction);
    } catch (error) {
      console.error("Erro ao atualizar transação:", error);
      return res.status(500).json({ message: "Erro ao atualizar transação" });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const transaction = await Transaction.findOne({
        where: {
          id,
          userId,
        },
      });

      if (!transaction) {
        return res.status(404).json({
          message: "Transação não encontrada ou não pertence ao usuário",
        });
      }

      await transaction.destroy();
      return res.status(200).json({
        message: "Transação deletada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao deletar transação:", error);
      return res.status(500).json({ message: "Erro ao deletar transação" });
    }
  }
}

export default TransactionController;
