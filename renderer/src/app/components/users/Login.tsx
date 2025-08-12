"use client";
import React, { useState } from "react";
import { Button } from "../forms/Button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

// Interface pour typer les données du formulaire
interface FormData {
  email: string;
  password: string;
}

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert("Veuillez remplir tous les champs");
      return;
    }
    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      router.push("/dashbord");
    } catch (err: unknown) {
      console.error("Erreur de connexion:", err);
      const errorMessage = "Erreur inconnue";
      alert(`Erreur de connexion : ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex flex-col justify-center top-10 items-center p-4 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full max-w-md p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg border dark:border-gray-700"
      >
        <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-400 text-center mb-6">
          Connectez-vous
        </h1>
        <div className="flex flex-col gap-4 mb-6">
          <div>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="votre@email.com"
              required
              disabled={isLoading}
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Entrez votre mot de passe"
              className="w-full p-2 pr-10 border rounded-md dark:bg-gray-700 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        <Button
          label={isLoading ? "Connexion en cours ..." : "Se connecter"}
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 w-full text-white"
        />
      </form>
    </div>
  );
}
