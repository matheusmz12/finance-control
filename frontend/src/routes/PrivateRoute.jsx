import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";

// Só deixa entrar quem está logado
export function PrivateRoute({ children }) {
  const { isLogged } = useContext(AuthContext);

  if (!isLogged) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Login e cadastro: quem já está logado vai direto para o dashboard
export function PublicRoute({ children }) {
  const { isLogged } = useContext(AuthContext);

  if (isLogged) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default PrivateRoute;
