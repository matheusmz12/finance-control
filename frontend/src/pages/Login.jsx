import api from "../services/api";
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";

import { AuthContext } from "../context/auth-context";
import { apiErrorMessage } from "../utils/format";

import "../styles/auth.css";

function Login() {
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useContext(AuthContext);

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    if (loading) return;

    setErro("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
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
          <p>Entre na sua conta para continuar</p>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          {erro && (
            <p className="message message-error" role="alert">
              {erro}
            </p>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>

            <input
              type="email"
              id="email"
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
              type="password"
              id="password"
              value={password}
              placeholder="Digite sua senha"
              autoComplete="current-password"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </button>

          <span>
            Não possui uma conta? <Link to="/register">clique aqui</Link>
          </span>
        </form>
      </div>
    </div>
  );
}

export default Login;
