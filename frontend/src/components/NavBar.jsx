import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/navbar.css";
import { AuthContext } from "../context/auth-context";

function NavBar() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="navBar">
      <div className="navBar-logo">
        <h2>
          <i className="bi bi-currency-dollar"></i> Finance <span> Control</span>
        </h2>
      </div>

      <div className="navBar-links">
        <NavLink
          to={"/dashboard"}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <i className="bi bi-bar-chart-line"></i> Dashboard
        </NavLink>

        <NavLink
          to={"/transactions"}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <i className="bi bi-wallet2"></i> Transações
        </NavLink>

        <NavLink
          to={"/categories"}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <i className="bi bi-tags"></i> Categorias
        </NavLink>

        <NavLink
          to={"/profile"}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <i className="bi bi-person"></i> Perfil
        </NavLink>

        <div className="btn-sair">
          <button onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i>
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
