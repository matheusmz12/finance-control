import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/navbar.css";
import { AuthContext } from "../context/auth-context";

const LINKS = [
  { to: "/dashboard", icon: "bi-bar-chart-line", label: "Dashboard" },
  { to: "/transactions", icon: "bi-wallet2", label: "Transações" },
  { to: "/categories", icon: "bi-tags", label: "Categorias" },
  { to: "/profile", icon: "bi-person", label: "Perfil" },
];

/*
  Desktop: barra lateral completa.
  Tablet: barra lateral só com ícones.
  Celular: barra de abas fixa embaixo da tela.
*/
function NavBar() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="navBar" aria-label="Menu principal">
      <div className="navBar-logo">
        <h2>
          <i className="bi bi-currency-dollar"></i>
          <span className="navBar-logo-text">
            Finance <span>Control</span>
          </span>
        </h2>
      </div>

      <div className="navBar-links">
        {LINKS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={label}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <i className={`bi ${icon}`} aria-hidden="true"></i>
            <span className="nav-label">{label}</span>
          </NavLink>
        ))}

        <div className="btn-sair">
          <button onClick={handleLogout} title="Sair">
            <i className="bi bi-box-arrow-right" aria-hidden="true"></i>
            <span className="nav-label">Sair</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
