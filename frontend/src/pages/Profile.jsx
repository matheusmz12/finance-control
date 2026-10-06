import "../styles/transactions.css";
import "../styles/categories.css";
import "../styles/profile.css";
import NavBar from "../components/NavBar";
import { useEffect, useState } from "react";

import api from "../services/api";
import { formatCurrency, apiErrorMessage } from "../utils/format";

const EMPTY_PASSWORD = { currentPassword: "", newPassword: "", confirmPassword: "" };

function Profile() {
  const [profile, setProfile] = useState({ name: "", email: "", createdAt: null });
  const [stats, setStats] = useState({ count: 0, receitas: 0, despesas: 0 });
  const [dadosMsg, setDadosMsg] = useState({ text: "", error: false });

  const [passwords, setPasswords] = useState(EMPTY_PASSWORD);
  const [senhaMsg, setSenhaMsg] = useState({ text: "", error: false });

  useEffect(() => {
    api.get("/users/me").then((response) => setProfile(response.data));

    api.get("/transactions").then((response) => {
      const totals = response.data.reduce(
        (acc, transaction) => {
          const valor = Number(transaction.amount);
          if (transaction.type === "ENTRADA") acc.receitas += valor;
          else acc.despesas += valor;
          return acc;
        },
        { count: response.data.length, receitas: 0, despesas: 0 },
      );
      setStats(totals);
    });
  }, []);

  async function handleSaveProfile(e) {
    e.preventDefault();
    try {
      const response = await api.put("/users/me", { name: profile.name, email: profile.email });
      setProfile(response.data.user);
      setDadosMsg({ text: "Dados atualizados.", error: false });
    } catch (error) {
      setDadosMsg({ text: apiErrorMessage(error, "Não foi possível salvar."), error: true });
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    try {
      await api.put("/users/me/password", passwords);
      setPasswords(EMPTY_PASSWORD);
      setSenhaMsg({ text: "Senha alterada.", error: false });
    } catch (error) {
      setSenhaMsg({ text: apiErrorMessage(error, "Não foi possível alterar a senha."), error: true });
    }
  }

  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    : "";

  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  return (
    <div className="transactions-container">
      <NavBar />

      <main className="transactions-content">
        <div className="transactions-header">
          <div className="titulo">
            <h1>Perfil</h1>
            <p>Seus dados e a segurança da conta</p>
          </div>
        </div>

        <section className="profile-hero category-panel">
          <div className="profile-avatar" aria-hidden="true">
            {initials || <i className="bi bi-person"></i>}
          </div>
          <div>
            <h2>{profile.name}</h2>
            <p>{profile.email}</p>
            {memberSince && <small>Membro desde {memberSince}</small>}
          </div>

          <dl className="profile-stats">
            <div>
              <dt>Transações</dt>
              <dd>{stats.count}</dd>
            </div>
            <div>
              <dt>Total recebido</dt>
              <dd className="valorEntrada">{formatCurrency(stats.receitas)}</dd>
            </div>
            <div>
              <dt>Total gasto</dt>
              <dd className="valorSaida">{formatCurrency(stats.despesas)}</dd>
            </div>
          </dl>
        </section>

        <div className="category-panels">
          <form className="category-panel profile-form" onSubmit={handleSaveProfile}>
            <h2>Dados da conta</h2>

            <div className="form-group">
              <label htmlFor="profile-name">Nome</label>
              <input
                id="profile-name"
                type="text"
                value={profile.name}
                autoComplete="name"
                required
                onChange={(e) => {
                  setProfile({ ...profile, name: e.target.value });
                  setDadosMsg({ text: "" });
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-email">E-mail</label>
              <input
                id="profile-email"
                type="email"
                value={profile.email}
                autoComplete="email"
                required
                onChange={(e) => {
                  setProfile({ ...profile, email: e.target.value });
                  setDadosMsg({ text: "" });
                }}
              />
            </div>

            {dadosMsg.text && (
              <p className={dadosMsg.error ? "form-error" : "form-success"} role="status">
                {dadosMsg.text}
              </p>
            )}

            <button type="submit" className="add-transaction-button">
              Salvar dados
            </button>
          </form>

          <form className="category-panel profile-form" onSubmit={handleChangePassword}>
            <h2>Alterar senha</h2>

            {[
              ["currentPassword", "Senha atual", "current-password"],
              ["newPassword", "Nova senha", "new-password"],
              ["confirmPassword", "Confirme a nova senha", "new-password"],
            ].map(([field, label, autoComplete]) => (
              <div className="form-group" key={field}>
                <label htmlFor={field}>{label}</label>
                <input
                  id={field}
                  type="password"
                  value={passwords[field]}
                  autoComplete={autoComplete}
                  minLength={field === "currentPassword" ? undefined : 6}
                  required
                  onChange={(e) => {
                    setPasswords({ ...passwords, [field]: e.target.value });
                    setSenhaMsg({ text: "" });
                  }}
                />
              </div>
            ))}

            {senhaMsg.text && (
              <p className={senhaMsg.error ? "form-error" : "form-success"} role="status">
                {senhaMsg.text}
              </p>
            )}

            <button type="submit" className="add-transaction-button">
              Alterar senha
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Profile;
