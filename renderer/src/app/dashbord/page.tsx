"use client";
export const dynamic = "force-dynamic";
import React from "react";
import Navbar from "../components/navbar/Navbar";
import Dashboard from "../components/dashbord/Dashbord";
import { CardUser } from "../components/forms/CardUser";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
export default function Page() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const handleLogout = () => {
    logout();
    router.push("/");
  };
  return (
    <div className="flex">
      <div className="nav">
        <Navbar />
      </div>
      <div className="flex-1/2">
        <CardUser
          className="bg-gray-900"
          title={`Bienvenue chez ${user?.tenantName}`}
          name={user?.name ?? null}
          onLogout={handleLogout}
        />
        <Dashboard />
      </div>
    </div>
  );
}
