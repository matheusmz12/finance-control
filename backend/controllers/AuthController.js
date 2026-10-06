import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 6;

// Token com validade: depois de 1 dia o usuário precisa entrar de novo
function createToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
}

class Authcontroller {
  static async register(req, res) {
    try {
      const { name, email, password, confirmPassword } = req.body;

      //validar os campos
      if (
        !name ||
        name.trim() === "" ||
        !email ||
        email.trim() === "" ||
        !password ||
        password.trim() === "" ||
        !confirmPassword ||
        confirmPassword.trim() === ""
      ) {
        return res.status(400).json({
          message: "Todos os campos são obrigatórios",
        });
      }

      if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ message: "Digite um e-mail válido" });
      }

      if (password.length < MIN_PASSWORD) {
        return res.status(400).json({
          message: `A senha precisa ter pelo menos ${MIN_PASSWORD} caracteres`,
        });
      }

      //validar as senhas
      if (password !== confirmPassword) {
        return res.status(400).json({
          message: "As senhas não conferem",
        });
      }

      //verificar se o usuario ja exite

      const userExist = await User.findOne({
        where: {
          email,
        },
      });

      if (userExist) {
        return res.status(400).json({
          message: "O email ja esta em uso",
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await User.create({
        name: name.trim(),
        email,
        password: passwordHash,
      });

      return res.status(201).json({
        message: "Usuário registrado com sucesso",
        token: createToken(user.id),
      });
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
      return res.status(500).json({ message: "Erro ao registrar usuário" });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      //validar os campos
      if (!email || email.trim() === "" || !password || password.trim() === "") {
        return res.status(400).json({
          message: "Todos os campos são obrigatórios",
        });
      }

      //verificar se o usuário existe e se a senha confere
      const user = await User.findOne({
        where: {
          email,
        },
      });

      const passwordOk = user && (await bcrypt.compare(password, user.password));

      // Mesma mensagem nos dois casos, para não revelar quais e-mails estão cadastrados
      if (!passwordOk) {
        return res.status(400).json({ message: "E-mail ou senha inválidos" });
      }

      return res.status(200).json({
        message: "Login realizado com sucesso",
        token: createToken(user.id),
      });
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return res.status(500).json({ message: "Erro ao fazer login" });
    }
  }
}

export default Authcontroller;
