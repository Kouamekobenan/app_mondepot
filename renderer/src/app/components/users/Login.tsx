"use client";
import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Button from "../buttonConnecte/ButtonCont";

// Interface pour typer les données du formulaire
interface FormData {
  email: string;
  password: string;
}

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!formData.email) {
      newErrors.email = "L'email est requis";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 6 caractères";
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const loggedUser = await login(formData.email, formData.password);
      switch (loggedUser.role) {
        case "MANAGER":
          router.push("/admin");
          break;
        case "DELIVERY_PERSON":
          router.push("/super_admin");
          break;
        default:
          router.push("/dashbord");
      }
    } catch (err) {
      console.error("Erreur de connexion:", err);
      alert("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      {/* Formes décoratives en arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 dark:bg-orange-900 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 dark:bg-orange-800 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Carte principale */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20 dark:border-gray-700/50 p-8">
          {/* En-tête */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mb-2">
              Bienvenue
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Connectez-vous à votre compte
            </p>
          </div>

          {/* Formulaire */}
          <div className="space-y-6" onKeyPress={handleKeyPress}>
            {/* Champ Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                    errors.email
                      ? "border-red-300 dark:border-red-600"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  } dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-serif`}
                  placeholder="exemple@email.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Champ Mot de passe */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3 border rounded-xl font-serif bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                    errors.password
                      ? "border-red-300 dark:border-red-600"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  } dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                  placeholder="Votre mot de passe"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Options supplémentaires */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-gray-600 dark:text-gray-400">
                  Se souvenir de moi
                </span>
              </label>
              <button
                type="button"
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Bouton de connexion */}
            <Button
              label={
                isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Se connecter
                  </>
                )
              }
              type="button"
              disabled={isLoading}
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            />
          </div>
          {/* Séparateur */}
          {/* <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
            <span className="px-3 text-sm text-gray-500 dark:text-gray-400">
              ou
            </span>
            <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
          </div> */}
          {/* Boutons de connexion sociale */}
          {/* <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-200">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Continuer avec Google
              </span>
            </button>
          </div> */}

          {/* Pied de page */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              besoin d&apos;aide?{" "}
              <button
                type="button"
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium transition-colors"
              >
                Contactez votre administrateur
              </button>
            </p>
          </div>
        </div>

        {/* Indicateurs de sécurité */}
        {/* <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            Connexion sécurisée SSL
          </p>
        </div> */}
      </div>
    </div>
  );
}
