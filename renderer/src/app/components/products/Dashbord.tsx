"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Banknote,
  HandCoins,
  Layers,
  Package,
  Plus,
  TrendingUp,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import api from "@/app/prisma/api";
import { productItems } from "@/app/types/type";
import Loader from "../loader/Loder";
import { useAuth } from "@/app/context/AuthContext";
// Types pour les statistiques
interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  totalSalesValue: number;
  totalProfit: number;
  lowStockCount: number;
}
// Configuration des constantes
const CURRENCY = "FCFA";
const LOW_STOCK_THRESHOLD = 10;

// Hook personnalisé pour les statistiques
const useProductStats = (products: productItems[]): DashboardStats => {
  return useMemo(() => {
    if (!products.length) {
      return {
        totalProducts: 0,
        totalStock: 0,
        totalSalesValue: 0,
        totalProfit: 0,
        lowStockCount: 0,
      };
    }

    return products.reduce(
      (stats, product) => {
        const salesPrice = Number(product.price) || 0;
        const purchasePrice = Number(product.purchasePrice) || 0;
        const stock = product.stock || 0;

        return {
          totalProducts: stats.totalProducts + 1,
          totalStock: stats.totalStock + stock,
          totalSalesValue: stats.totalSalesValue + salesPrice,
          totalProfit: stats.totalProfit + (salesPrice - purchasePrice),
          lowStockCount:
            stats.lowStockCount + (stock < LOW_STOCK_THRESHOLD ? 1 : 0),
        };
      },
      {
        totalProducts: 0,
        totalStock: 0,
        totalSalesValue: 0,
        totalProfit: 0,
        lowStockCount: 0,
      }
    );
  }, [products]);
};
// Composant pour une carte de statistique
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconBgColor: string;
  iconTextColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  warning?: boolean;
}
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  iconBgColor,
  iconTextColor,
  trend,
  warning = false,
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 relative overflow-hidden">
    {/* Gradient de fond subtil */}
    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50/30" />

    <div className="relative z-10 flex flex-col h-full">
      {/* En-tête avec icône */}
      <div className="flex items-center justify-between ">
        <div className={`p-1 rounded-lg ${iconBgColor}`}>
          <Icon size={24} className={iconTextColor} />
        </div>
        {warning && <AlertTriangle size={20} className="text-orange-500" />}
        {trend && (
          <div
            className={`flex items-center text-sm ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            <TrendingUp
              size={16}
              className={trend.isPositive ? "" : "rotate-180"}
            />
            <span className="ml-1 font-medium">{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      {/* Valeur principale */}
      <div className="flex-1 flex flex-col justify-end">
        <p className="text-md font-bold text-gray-900 mb-1">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="text-sm text-gray-600 font-medium">{title}</p>
      </div>
    </div>
  </div>
);
// Composant pour le bouton d'ajout de produit
const AddProductCard: React.FC = () => (
  <Link href="/products/add" className="group block h-full">
    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-dashed border-orange-300 p-6 h-full flex flex-col items-center justify-center hover:from-orange-100 hover:to-orange-200 hover:border-orange-400 transition-all duration-200 group-hover:shadow-md">
      <div className="bg-orange-600 p-3 rounded-full mb-4 group-hover:scale-110 transition-transform duration-200">
        <Plus size={24} className="text-white" />
      </div>

      <p className="text-sm text-orange-600 text-center">
        Cliquez pour créer un nouveau produit
      </p>
    </div>
  </Link>
);
// Composant de gestion d'erreur
const ErrorDisplay: React.FC<{
  error: string;
  onRetry: () => void;
}> = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-xl border border-red-200">
    <AlertTriangle size={48} className="text-red-500 mb-4" />
    <h3 className="text-lg font-semibold text-red-800 mb-2">
      Erreur de chargement
    </h3>
    <p className="text-red-600 text-center mb-4">{error}</p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
    >
      Réessayer
    </button>
  </div>
);
// Composant principal du Dashboard
export default function Dashboard() {
  // États
  const [products, setProducts] = useState<productItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const tenantId = user?.tenantId;
  // Fonction pour récupérer les produits
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!tenantId) {
        setError("Aucun tenant trouvé");
        setIsLoading(false);
        return;
      }
      const response = await api.get(`/product/tenant/${tenantId}`);
      const data = response.data;

      if (!Array.isArray(data)) {
        throw new Error("Format de données invalide reçu du serveur");
      }

      setProducts(data);
    } catch (err: unknown) {
      console.error("Erreur lors de la récupération des produits:", err);

      let errorMessage = "Erreur lors de la récupération des produits";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "object" && err !== null && "message" in err) {
        errorMessage = String(err.message);
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  // Effet pour charger les données au montage
  useEffect(() => {
    if (tenantId) {
      fetchProducts();
    }
  }, [tenantId, fetchProducts]);
  // Calcul des statistiques avec le hook personnalisé
  const stats = useProductStats(products);

  // Fonction pour formater les prix
  const formatCurrency = useCallback((amount: number): string => {
    return `${amount.toLocaleString()} ${CURRENCY}`;
  }, []);

  // Gestion des états de chargement et d'erreur
  if (isLoading) {
    return (
      <div className="p-6">
        <Loader message="Chargement du tableau de bord..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-1">
        <ErrorDisplay error={error} onRetry={fetchProducts} />
      </div>
    );
  }
  // Configuration des cartes de statistiques
  const statCards = [
    {
      title: "Total des produits",
      value: stats.totalProducts,
      icon: Package,
      iconBgColor: "bg-orange-300",
      iconTextColor: "text-white",
      warning: stats.totalProducts === 0,
    },
    {
      title: "Stock total",
      value: stats.totalStock,
      icon: Layers,
      iconBgColor: "bg-orange-300",
      iconTextColor: "text-white",
      warning: stats.lowStockCount > 0,
    },
    {
      title: "Valeur des ventes",
      value: formatCurrency(stats.totalSalesValue),
      icon: Banknote,
      iconBgColor: "bg-orange-300",
      iconTextColor: "text-white",
    },
    {
      title: "Bénéfices estimés",
      value: formatCurrency(stats.totalProfit),
      icon: HandCoins,
      iconBgColor: "bg-orange-300",
      iconTextColor: "text-white",
      trend:
        stats.totalProfit > 0
          ? {
              value: 12, // Vous pouvez calculer le trend réel
              isPositive: true,
            }
          : undefined,
    },
  ];
  return (
    <div className="p-6 space-y-6">
      {/* En-tête du dashboard */}
      <div className="mb-8 w-full flex justify-between">
        <div className="">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tableau de bord
          </h1>
          <p className="text-gray-600">
            Vue d&apos;ensemble de vos produits et statistiques
          </p>
        </div>
        <div className="">
          <Link href="/dashbord">
            <button className="bg-gray-700 hover:bg-gray-500 text-white p-2 rounded-md">
              <ArrowLeft />
            </button>
          </Link>
        </div>
      </div>
      {/* Alerte pour les stocks faibles */}
      {stats.lowStockCount > 0 && (
        <div className="bg-orange-50 flex justify-between border border-orange-200 rounded-xl p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="text-orange-500 mr-3" size={20} />
            <div>
              <h3 className="font-semibold text-orange-800">
                Attention - Stock faible
              </h3>
              <p className="text-orange-700 text-sm">
                {stats.lowStockCount} produit
                {stats.lowStockCount > 1 ? "s ont" : " a"} un stock inférieur à{" "}
                {LOW_STOCK_THRESHOLD} unités
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <Link
              href="/stockfaible"
              className="bg-orange-200 p-3 rounded-2xl border border-orange-400 font-serif hover:bg-orange-100"
            >
              voir les stocks faible
            </Link>
          </div>
        </div>
      )}
      {/* Grille des cartes statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
        {/* Carte d'ajout de produit */}
        <div className="sm:col-span-1">
          <AddProductCard />
        </div>
      </div>
    </div>
  );
}
