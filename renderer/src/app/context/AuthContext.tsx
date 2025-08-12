"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../prisma/api";
import { User } from "../types/type";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); 
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await window.electronAPI?.getToken();
        console.log("Token récupéré :", token);

        if (!token) {
          setLoading(false);
          return;
        }

        const res = await api.get<User>("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data);
        setIsAuthenticated(true);
      } catch (error: unknown) {
        console.error("Erreur lors de l'authentification :", error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const token = response.data?.token?.access_token;
      if (!token) {
        throw new Error("Token non trouvé dans la réponse");
      }

      await window.electronAPI?.setToken(token);
      setIsAuthenticated(true);

      const userProfile = await api.get<User>("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(userProfile.data);

      window.electronAPI?.notifyLoginSuccess(
        "Connexion réussie",
        `Bienvenue ${userProfile.data.name} !`
      );
    } catch (error) {
      console.error("Échec de la connexion :", error);
      setUser(null);
      setIsAuthenticated(false);
      console.error("Échec de la connexion :", error);
      setUser(null);
      setIsAuthenticated(false);
      const message =
        error?.response?.data?.message || "Identifiants incorrects";
      throw new Error(message);
    }
  };

  const logout = async () => {
    await window.electronAPI?.deleteToken();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;
