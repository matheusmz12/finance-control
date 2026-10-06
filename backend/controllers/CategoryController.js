import { Op } from "sequelize";
import Category from "../models/Category.js";
import Transaction from "../models/Transaction.js";

const TYPES = ["ENTRADA", "SAIDA"];

// Valida nome e tipo vindos do formulário. Retorna a mensagem de erro, ou null se estiver tudo certo.
function validate({ name, type }) {
  if (!name || name.trim() === "") return "O nome da categoria é obrigatório";
  if (name.trim().length > 40) return "O nome pode ter no máximo 40 caracteres";
  if (!TYPES.includes(type)) return "Escolha se a categoria é de receita ou despesa";
  return null;
}

// O dono da categoria sempre vem do token (req.user.id), nunca do corpo da requisição
class CategoryController {
  static async createCategory(req, res) {
    try {
      const { name, type } = req.body;
      const userId = req.user.id;

      const error = validate({ name, type });
      if (error) {
        return res.status(400).json({ message: error });
      }

      const category = await Category.create({
        name: name.trim(),
        type,
        userId,
      });

      return res.status(201).json(category);
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      return res.status(500).json({ message: "Erro ao criar categoria" });
    }
  }

  static async getAll(req, res) {
    try {
      const userId = req.user.id;

      const categories = await Category.findAll({
        where: {
          [Op.or]: [{ userId: userId }, { isDefault: true }],
        },
        order: [["name", "ASC"]],
      });

      return res.status(200).json(categories);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      return res.status(500).json({ message: "Erro ao buscar categorias" });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const category = await Category.findOne({
        where: {
          id,
          [Op.or]: [{ userId: userId }, { isDefault: true }],
        },
      });

      if (!category) {
        return res.status(404).json({
          message: "Categoria não encontrada",
        });
      }

      return res.status(200).json(category);
    } catch (error) {
      console.error("Erro ao buscar categoria:", error);
      return res.status(500).json({ message: "Erro ao buscar categoria" });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, type } = req.body;
      const userId = req.user.id;

      const error = validate({ name, type });
      if (error) {
        return res.status(400).json({ message: error });
      }

      const category = await Category.findOne({
        where: {
          id,
          userId,
          isDefault: false,
        },
      });

      if (!category) {
        return res.status(404).json({
          message: "Categoria não encontrada ou não pertence ao usuário",
        });
      }

      // Não deixa trocar o tipo se já houver transações usando a categoria
      if (type !== category.type) {
        const inUse = await Transaction.count({ where: { categoryId: category.id } });
        if (inUse > 0) {
          return res.status(400).json({
            message: "Essa categoria já tem transações; não é possível trocar o tipo",
          });
        }
      }

      await category.update({
        name: name.trim(),
        type,
      });

      return res.status(200).json(category);
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      return res.status(500).json({ message: "Erro ao atualizar categoria" });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const category = await Category.findOne({
        where: {
          id,
          userId,
          isDefault: false,
        },
      });

      if (!category) {
        return res.status(404).json({
          message: "Categoria não encontrada ou não pertence ao usuário",
        });
      }

      // Evita erro do banco: categoria em uso não pode ser apagada
      const inUse = await Transaction.count({ where: { categoryId: category.id } });
      if (inUse > 0) {
        return res.status(400).json({
          message: `Essa categoria está em ${inUse} transação(ões). Mude ou apague essas transações antes.`,
        });
      }

      await category.destroy();

      return res.status(200).json({ message: "Categoria excluída" });
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      return res.status(500).json({ message: "Erro ao excluir categoria" });
    }
  }
}

export default CategoryController;
