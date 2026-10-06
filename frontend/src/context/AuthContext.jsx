import { useState } from "react";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [isLogged, setIsLogged] = useState(!!localStorage.getItem("token"));

  function login(token) {
    localStorage.setItem("token", token);
    setIsLogged(true);
  }

  function logout() {
    localStorage.removeItem("token");
    setIsLogged(false);
  }

  return (
    <AuthContext.Provider value={{ isLogged, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
