"use client";
import { useState, useEffect } from "react";
import Login from "./components/users/Login";
import Image from "next/image";

export default function Home() {
  const [countdown, setCountdown] = useState(10);
  const [showLogin, setShowLogin] = useState(false);
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowLogin(true);
    }
  }, [countdown]);

  if (showLogin) {
    return (
      <div className="">
        <div className="text-xl flex flex-col justify-center items-center">
          <Login />
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <div className="text-center">
        <div className="mb-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <h1 className="text-2xl font-semibold text-gray-700 mb-2">
            <span className="font-serif font-bold text-orange-700">
              Logiciel de système de gestion{" "}
            </span>
            en chargement...
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm mx-auto">
          <div className="flex justify-center items-center">
            <Image src="/logo12.png" width={200} height={200} alt="" />
          </div>
          <div className="text-6xl font-bold text-orange-500 mb-4">
            {countdown}
          </div>
          <p className="text-gray-600">
            Veillez-vous connectez dans {countdown} seconde
            {countdown !== 1 ? "s" : ""}
          </p>

          <div className="w-full bg-gray-200 rounded-full h-2 mt-6">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${((10 - countdown) / 10) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
