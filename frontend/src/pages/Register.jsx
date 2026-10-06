import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import { apiErrorMessage } from "../utils/format";

import api from "../services/api.js";
import "../styles/auth.css";

function Register() {
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { login } = useContext(AuthContext);

  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    if (loading) return;

    setErro("");
    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
        confirmPassword,
      });

      login(response.data.token);
      navigate("/dashboard");
    } catch (error) {
      setErro(apiErrorMessage(error, "Erro no servidor."));
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Finance Control</h1>
          <p>Crie sua conta para começar</p>
        </div>

        <form className="auth-form" onSubmit={handleRegister}>
          {erro && (
            <p className="message message-error" role="alert">
              {erro}
            </p>
          )}

          <div className="form-group">
            <label htmlFor="name">Nome</label>

            <input
              id="name"
              type="text"
              value={name}
              placeholder="Digite seu nome"
              autoComplete="name"
              required
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              value={email}
              placeholder="Digite seu email"
              autoComplete="email"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>

            <input
              id="password"
              type="password"
              value={password}
              placeholder="Mínimo de 6 caracteres"
              autoComplete="new-password"
              minLength={6}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirme sua senha</label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              placeholder="Confirme sua senha"
              autoComplete="new-password"
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Criando conta…" : "Criar conta"}
          </button>

          <span>
            Já possui uma conta? <Link to="/">clique aqui</Link>
          </span>
        </form>
      </div>
    </div>
  );
}

export default Register;
