import bcrypt from "bcryptjs";
import User from "../models/User.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 6;

// Campos que podem sair na resposta (a senha nunca sai)
const PUBLIC_FIELDS = ["id", "name", "email", "createdAt"];

// Todas as ações usam o id do token (req.user.id): cada pessoa só mexe na própria conta
class UserController {
  static async getMe(req, res) {
    try {
      const user = await User.findByPk(req.user.id, { attributes: PUBLIC_FIELDS });

      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      return res.status(500).json({ message: "Erro ao buscar usuário" });
    }
  }

  static async updateMe(req, res) {
    try {
      const { name, email } = req.body;

      if (!name || name.trim() === "" || !email || email.trim() === "") {
        return res.status(400).json({ message: "Nome e e-mail são obrigatórios" });
      }

      if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ message: "Digite um e-mail válido" });
      }

      const user = await User.findByPk(req.user.id);

      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      if (email !== user.email) {
        const emailInUse = await User.findOne({ where: { email } });
        if (emailInUse) {
          return res.status(400).json({ message: "Esse e-mail já está em uso" });
        }
      }

      await user.update({ name: name.trim(), email });

      return res.status(200).json({
        message: "Perfil atualizado",
        user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
      });
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      return res.status(500).json({ message: "Erro ao atualizar usuário" });
    }
  }

  static async updatePassword(req, res) {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: "Preencha todos os campos de senha" });
      }

      if (newPassword.length < MIN_PASSWORD) {
        return res.status(400).json({
          message: `A nova senha precisa ter pelo menos ${MIN_PASSWORD} caracteres`,
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "As senhas não conferem" });
      }

      const user = await User.findByPk(req.user.id);

      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const currentOk = await bcrypt.compare(currentPassword, user.password);
      if (!currentOk) {
        return res.status(400).json({ message: "Senha atual incorreta" });
      }

      // A senha é sempre salva criptografada
      await user.update({ password: await bcrypt.hash(newPassword, 10) });

      return res.status(200).json({ message: "Senha alterada" });
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      return res.status(500).json({ message: "Erro ao alterar senha" });
    }
  }
}

export default UserController;
