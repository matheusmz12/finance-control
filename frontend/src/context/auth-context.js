import { createContext } from "react";

// Fica num arquivo separado do AuthProvider para o recarregamento rápido (Fast Refresh) funcionar
export const AuthContext = createContext();
