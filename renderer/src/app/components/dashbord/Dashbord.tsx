"use client";
import { useAuth } from "@/app/context/AuthContext";
import api from "@/app/prisma/api";
import { deliveryDto, productItems } from "@/app/types/type";
import {
  Activity,
  Blocks,
  ChartColumnIncreasing,
  ChartLine,
  Check,
  Codesandbox,
  HandCoins,
  Package,
  ShoppingCart,
  Siren,
  Truck,
  User,
  Watch,
} from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  TooltipProps,
} from "recharts";
import SaleDashbord from "../saleDashbord/SaleDashbord";

// Interface pour les données du graphique des produits
interface ChartData {
  name: string;
  stock: number;
}

// Interface pour les données du graphique des livraisons
interface DeliveryChartData {
  name: string;
  amount: number;
  count: number;
  status: "completed" | "pending" | "cancelled";
}

// Interface pour les statistiques de livraison
interface DeliveryStats {
  totalDeliveries: number;
  totalAmount: number;
  totalDeliveryPersons: number;
  averageDeliveryAmount: number;
  completedDeliveries: number;
  pendingDeliveries: number;
}

// Interface pour les props du tooltip personnalisé
interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: ChartData | DeliveryChartData;
  }>;
  label?: string;
}

// Interface pour les erreurs d'API
interface ApiError {
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
  request?: unknown;
  message?: string;
}

// Interface pour les produits du dashboard
interface DashboardProps {
  refreshInterval?: number;
  lowStockThreshold?: number;
  autoRefresh?: boolean;
  title?: string;
}

export default function Dashboard({
  refreshInterval = 30000, // 30 secondes par défaut
  lowStockThreshold = 10,
  autoRefresh = true,
}: DashboardProps) {
  // États du composant
  const [product, setProduct] = useState<productItems[]>([]);
  const [deliveryData, setDeliveryData] = useState<deliveryDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<"stock" | "delivery" | "sale">(
    "stock"
  );
  const { user } = useAuth();
  const tenantId = user?.tenantId;
  // Fonction pour récupérer les produits
  const fetchProducts = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get(`/product/tenant/${tenantId}`);
      // console.log("produits", response.data);
      // Validation des données
      if (!Array.isArray(response.data)) {
        throw new Error("Format de données invalide");
      }

      setProduct(response.data);
    } catch (error: unknown) {
      console.error("Erreur lors de la récupération des produits:", error);
      throw error;
    }
  }, [tenantId]);

  // Fonction pour récupérer les données de livraison
  const fetchDeliveryData = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get(`/delivery/day/${tenantId}`);
      console.log("les données de la livraison:", response.data);
      setDeliveryData(response.data);
      setLastUpdated(new Date());
    } catch (error: unknown) {
      console.error("Erreur lors de la récupération des livraisons:", error);
      throw error;
    }
  }, [tenantId]);

  // Fonction pour récupérer toutes les données
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchProducts(), fetchDeliveryData()]);
    } catch (error: unknown) {
      let errorMessage = "Erreur lors du chargement des données";

      // Type guard pour vérifier si c'est une erreur d'API
      const apiError = error as ApiError;

      if (apiError.response) {
        errorMessage = `Erreur serveur: ${apiError.response.status}`;
        if (apiError.response.data?.message) {
          errorMessage += ` - ${apiError.response.data.message}`;
        }
      } else if (apiError.request) {
        errorMessage =
          "Erreur de connexion - Vérifiez votre connexion internet";
      } else if (apiError.message) {
        errorMessage = apiError.message;
      }

      setError(errorMessage);
      console.error("Erreur lors de la récupération des données:", error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchProducts, fetchDeliveryData]);

  // Chargement initial
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Rafraîchissement automatique
  useEffect(() => {
    if (!autoRefresh || !refreshInterval) return;

    const interval = setInterval(fetchAllData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchAllData, refreshInterval, autoRefresh]);

  // Transformation des données pour le graphique des stocks
  const chartData: ChartData[] = product.map((item) => ({
    name: item.name,
    stock: item.stock,
  }));

  // Transformation des données pour le graphique des livraisons
  const deliveryChartData: DeliveryChartData[] = deliveryData.map(
    (delivery) => {
      const totalAmount = delivery.deliveryProducts.reduce((sum, dp) => {
        const price = Number(dp.product.price);
        const quantity = Number(dp.quantity);
        return sum + price * quantity;
      }, 0);

      const status: "completed" | "pending" | "cancelled" =
        delivery.status === "IN_PROGRESS"
          ? "pending"
          : delivery.status === "COMPLETED"
          ? "completed"
          : "cancelled";

      return {
        name: delivery.deliveryPerson.name.split(" ")[0], // prénom
        amount: totalAmount,
        count: delivery.deliveryProducts.length,
        status,
      };
    }
  );

  // Fonction pour déterminer la couleur des barres de stock
  const getBarColor = (stock: number): string => {
    if (stock === 0) return "#dc2626"; // Rouge foncé - rupture
    if (stock < lowStockThreshold) return "#ea580c"; // Orange - stock faible
    if (stock < lowStockThreshold * 2) return "#ca8a04"; // Jaune - stock moyen
    return "#16a34a"; // Vert - stock suffisant
  };

  // Fonction pour déterminer la couleur des barres de livraison
  const getDeliveryBarColor = (status: string): string => {
    switch (status) {
      case "completed":
        return "#16a34a"; // Vert
      case "pending":
        return "#ea580c"; // Orange
      case "cancelled":
        return "#dc2626"; // Rouge
      default:
        return "#6b7280"; // Gris
    }
  };

  // Tooltip personnalisé pour les stocks
  const CustomStockTooltip = ({
    active,
    payload,
    label,
  }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const stock = payload[0].value;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg border-gray-200">
          <p className="font-medium text-gray-800">{label}</p>
          <p className="text-sm text-gray-600">
            Stock: <span className="font-semibold">{stock}</span> unité
            {stock > 1 ? "s" : ""}
          </p>
          {stock === 0 && (
            <p className="text-xs text-red-600 font-medium mt-1 flex items-center">
              🚨 Rupture de stock
            </p>
          )}
          {stock > 0 && stock < lowStockThreshold && (
            <p className="text-xs text-orange-600 font-medium mt-1 flex items-center">
              ⚠️ Stock faible
            </p>
          )}
        </div>
      );
    }
    return null;
  };
  // Tooltip personnalisé pour les livraisons
  const CustomDeliveryTooltip = ({
    active,
    payload,
    label,
  }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as DeliveryChartData;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg border-gray-200">
          <p className="font-medium text-gray-800">{label}</p>
          <p className="text-sm text-gray-600">
            Montant:{" "}
            <span className="font-semibold">
              {data.amount.toLocaleString()} FCFA
            </span>
          </p>
          <p className="text-sm text-gray-600">
            Livraisons: <span className="font-semibold">{data.count}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1 capitalize">
            Statut:{" "}
            {data.status === "completed"
              ? "Terminé"
              : data.status === "pending"
              ? "En cours"
              : "Annulé"}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calcul des statistiques de stock
  const stockStats = {
    totalProducts: product.length,
    totalStock: product.reduce((sum, p) => sum + p.stock, 0),
    lowStock: product.filter((p) => p.stock > 0 && p.stock < lowStockThreshold)
      .length,
    outOfStock: product.filter((p) => p.stock === 0).length,
    averageStock:
      product.length > 0
        ? Math.round(
            product.reduce((sum, p) => sum + p.stock, 0) / product.length
          )
        : 0,
  };
  // Calcul des statistiques de livraison
  const deliveryStats: DeliveryStats = {
    totalDeliveries: deliveryData.length,
    totalAmount: deliveryData.reduce((sum, d) => {
      const total = d.deliveryProducts.reduce((acc, dp) => {
        const price = Number(dp.product.price);
        const quantity = Number(dp.quantity);
        return acc + price * quantity;
      }, 0);
      return sum + total;
    }, 0),
    totalDeliveryPersons: deliveryData.length,
    averageDeliveryAmount:
      deliveryData.length > 0
        ? Math.round(
            deliveryData.reduce((sum, d) => {
              const total = d.deliveryProducts.reduce((acc, dp) => {
                const price = Number(dp.product.price);
                const quantity = Number(dp.quantity);
                return acc + price * quantity;
              }, 0);
              return sum + total;
            }, 0) / deliveryData.length
          )
        : 0,

    completedDeliveries: deliveryData
      .filter((d) => d.status === "COMPLETED")
      .reduce((sum, d) => sum + d.deliveryProducts.length, 0),
    pendingDeliveries: deliveryData
      .filter((d) => d.status === "IN_PROGRESS")
      .reduce((sum, d) => sum + d.deliveryProducts.length, 0),
  };
  // Rendu pour l'état de chargement
  if (isLoading) {
    return (
      <div className="w-full p-6">
        <div className="w-full h-[500px] bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
              <p className="text-gray-600 font-medium">
                Chargement des données...
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Connexion à l&apos;API en cours
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // Rendu pour l'état d'erreur
  if (error) {
    return (
      <div className="w-full p-6">
        <div className="w-full h-[500px] bg-white p-6 rounded-xl shadow-md border border-red-200">
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Erreur de chargement
              </h3>
              <p className="text-gray-600 mb-4 text-sm">{error}</p>
              <button
                onClick={fetchAllData}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 font-medium"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rendu principal
  return (
    <div className="w-full p-6 space-y-6 bg-gray-900 min-h-screen">
      {/* En-tête avec onglets */}
      <div className="bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            {lastUpdated && (
              <p className="text-sm text-gray-300 mt-1 font-medium">
                Dernière mise à jour : {lastUpdated.toLocaleString("fr-FR")}
              </p>
            )}
          </div>
          <button
            onClick={fetchAllData}
            disabled={isLoading}
            className="flex items-center gap-3 px-6 py-3 text-sm bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4 sm:mt-0 border border-gray-600 font-medium shadow-sm"
          >
            <span className={`text-lg ${isLoading ? "animate-spin" : ""}`}>
              ⟳
            </span>
            {isLoading ? "Actualisation..." : "Actualiser les données"}
          </button>
        </div>
        <div className="flex space-x-2 bg-gray-800 p-4 rounded-lg border border-gray-700">
          <button
            onClick={() => setActiveTab("stock")}
            className={`px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === "stock"
                ? "bg-orange-600 text-white shadow-md border-2 border-orange-500"
                : "text-gray-300 hover:text-white hover:bg-gray-700 border-2 border-transparent"
            }`}
          >
            <span className="mr-2 flex gap-1">
              <small className="flex flex-col justify-center">
                {" "}
                <Blocks className="" />{" "}
              </small>
              <small className="text-lg">Gestion des Stocks</small>
            </span>
          </button>
          <button
            onClick={() => setActiveTab("delivery")}
            className={`px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === "delivery"
                ? "bg-orange-600 text-white shadow-md border-2 border-orange-500"
                : "text-gray-300 hover:text-white hover:bg-gray-700 border-2 border-transparent"
            }`}
          >
            <span className="mr-2 flex gap-1">
              <small className="flex flex-col justify-center">
                <Truck />
              </small>
              <small className="text-lg">Suivi des Livraisons</small>
            </span>
          </button>
          <button
            onClick={() => setActiveTab("sale")}
            className={`px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === "sale"
                ? "bg-orange-600 text-white shadow-md border-2 border-orange-500"
                : "text-gray-300 hover:text-white hover:bg-gray-700 border-2 border-transparent"
            }`}
          >
            <span className="mr-2 flex gap-1">
              <small className="flex flex-col justify-center">
                <ShoppingCart />
              </small>{" "}
              <small className="text-lg">Gestion des ventes</small>
            </span>
          </button>
        </div>
      </div>
      {/* Contenu selon l'onglet actif */}
      {activeTab === "stock" && (
        <>
          {/* Cartes de statistiques de stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                    Total Produits
                  </p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {stockStats.totalProducts}
                  </p>
                </div>
                <div className="p-1 bg-orange-300 bg-opacity-20 rounded-xl border border-orange-300 border-opacity-30">
                  <span className="text-orange-400 text-2xl">
                    {" "}
                    <Package className="text-white" />
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                    Stock Total
                  </p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {stockStats.totalStock}
                  </p>
                </div>
                <div className="p-1 bg-orange-300 bg-opacity-20 rounded-xl border border-orange-300 border-opacity-30">
                  <span className="text-2xl">
                    <ChartColumnIncreasing className="text-white" />
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                    Stock Moyen
                  </p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {stockStats.averageStock}
                  </p>
                </div>
                <div className="p-1 bg-orange-300 bg-opacity-20 rounded-xl border border-orange-300 border-opacity-30">
                  <span className=" text-2xl">
                    <ChartLine className="text-white" />
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                    Stock Faible
                  </p>
                  <p className="text-3xl font-bold text-orange-400 mt-2">
                    {stockStats.lowStock}
                  </p>
                </div>
                <div className="p-1 bg-orange-300 bg-opacity-20 rounded-xl border border-orange-300 border-opacity-30">
                  <span className="text-orange-400 text-2xl">
                    {" "}
                    <Activity className="text-white" />
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                    Ruptures
                  </p>
                  <p className="text-3xl font-bold text-red-400 mt-2">
                    {stockStats.outOfStock}
                  </p>
                </div>
                <div className="p-1 bg-orange-300 bg-opacity-20 rounded-xl border-0 border-opacity-30">
                  <span className="text-2xl">
                    {" "}
                    <Siren className="text-white" />
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Graphique des stocks */}
          <div className="w-full bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">
                Analyse du Stock par Produit
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                <span className="font-medium">Données en temps réel</span>
              </div>
            </div>
            {chartData.length === 0 ? (
              <div className="h-[400px] flex items-center justify-center text-gray-400 bg-gray-900 rounded-xl border border-gray-700">
                <div className="text-center">
                  <div className="mb-6">
                    <span className="text-8xl mb-4 block opacity-40">📊</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-300 mb-3">
                    Aucune donnée disponible
                  </h3>
                  <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                    Les statistiques de stock apparaîtront automatiquement dès
                    que les données seront chargées depuis votre système de
                    gestion
                  </p>
                  <div className="mt-8 flex justify-center">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                      <div
                        className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-3 h-3 bg-orange-300 rounded-full animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[400px] bg-gray-900 rounded-xl border border-gray-700 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#374151"
                      strokeOpacity={0.3}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "#D1D5DB" }}
                      axisLine={{ stroke: "#4B5563" }}
                      tickLine={{ stroke: "#4B5563" }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#D1D5DB" }}
                      axisLine={{ stroke: "#4B5563" }}
                      tickLine={{ stroke: "#4B5563" }}
                    />
                    <Tooltip content={<CustomStockTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="stock"
                      name="Stock disponible"
                      radius={[6, 6, 0, 0]}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getBarColor(entry.stock)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {/* Légende des couleurs pour les stocks */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-gray-600">
                    Stock suffisant (≥{lowStockThreshold * 2})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-gray-600">
                    Stock moyen ({lowStockThreshold}-{lowStockThreshold * 2 - 1}
                    )
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span className="text-gray-600">
                    Stock faible (1-{lowStockThreshold - 1})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-600 rounded"></div>
                  <span className="text-gray-600">Rupture de stock (0)</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {activeTab === "delivery" && (
        <>
          {/* Cartes de statistiques de livraison */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                    Livreurs Actifs
                  </p>
                  <p className="text-xl font-bold text-white mt-2">
                    {deliveryStats.totalDeliveryPersons}
                  </p>
                </div>
                <div className="p-1 bg-orange-300 bg-opacity-20 rounded-xl border border-orange-300 border-opacity-30">
                  <span className="text-orange-400 text-2xl">
                    {" "}
                    <User className="text-white" />
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                    Total Livraisons
                  </p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {deliveryStats.totalDeliveries}
                  </p>
                </div>
                <div className="p-1 bg-orange-300 bg-opacity-20 rounded-xl border border-orange-300 border-opacity-30">
                  <span className="text-2xl">
                    {" "}
                    <Codesandbox className="text-white" />
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-300 uppercase tracking-wide flex items-center gap-2">
                    Montant Total
                  </p>
                  <p className="text-xl font-bold text-white mt-2">
                    {deliveryStats.totalAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 font-medium mt-1">FCFA</p>
                </div>
                <div className="p-1 bg-orange-300 bg-opacity-20 rounded-xl border border-orange-300 border-opacity-30">
                  <span className=" text-2xl">
                    <HandCoins className="text-white" />
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                    Terminées
                  </p>
                  <p className="text-xl font-bold text-green-400 mt-2">
                    {deliveryStats.completedDeliveries}
                  </p>
                </div>
                <div className="p-1 bg-orange-300 bg-opacity-20 rounded-xl border border-orange-300 border-opacity-30">
                  <span className="text-2xl">
                    <Check className="text-white font-bold " />
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                    En Cours
                  </p>
                  <p className="text-3xl font-bold text-orange-400 mt-2">
                    {deliveryStats.pendingDeliveries}
                  </p>
                </div>
                <div className="p-1 bg-orange-300 bg-opacity-20 rounded-xl border border-orange-300 border-opacity-30">
                  <span className="text-orange-400 text-2xl">
                    {" "}
                    <Watch className="text-white" />
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Graphique des livraisons par livreur */}
          <div className="w-full bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 mt-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">
                Performance des Livreurs - Aujourd&apos;hui
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="font-medium">Suivi en temps réel</span>
                </div>
                <div className="text-sm text-gray-400 bg-gray-900 px-3 py-1 rounded-lg border border-gray-700">
                  {new Date().toLocaleDateString("fr-FR")}
                </div>
              </div>
            </div>
            {deliveryChartData.length === 0 ? (
              <div className="h-[400px] flex items-center justify-center text-gray-400 bg-gray-900 rounded-xl border border-gray-700">
                <div className="text-center">
                  <div className="mb-6">
                    <span className="text-8xl mb-4 block opacity-40">🚚</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-300 mb-3">
                    Aucune livraison aujourd&apos;hui
                  </h3>
                  <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                    Les performances de livraison s&apos;afficheront
                    automatiquement dès que les livreurs commenceront leurs
                    tournées
                  </p>
                  <div className="mt-8 flex justify-center">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                      <div
                        className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-3 h-3 bg-orange-300 rounded-full animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[400px] bg-gray-900 rounded-xl border border-gray-700 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={deliveryChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#374151"
                      strokeOpacity={0.3}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "#D1D5DB" }}
                      axisLine={{ stroke: "#4B5563" }}
                      tickLine={{ stroke: "#4B5563" }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#D1D5DB" }}
                      axisLine={{ stroke: "#4B5563" }}
                      tickLine={{ stroke: "#4B5563" }}
                    />
                    <Tooltip content={<CustomDeliveryTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="amount"
                      name="Montant (FCFA)"
                      radius={[6, 6, 0, 0]}
                    >
                      {deliveryChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getDeliveryBarColor(entry.status)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {/* Légende des couleurs pour les livraisons */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-300 mb-2">
                  Statuts des Livraisons
                </h3>
                <p className="text-sm text-gray-500">
                  Classification des livraisons par état d&pos;avancement
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg border border-gray-700">
                  <div className="w-5 h-5 bg-green-500 rounded-full shadow-sm"></div>
                  <div className="flex-1">
                    <span className="text-gray-300 font-semibold">
                      Livraisons Terminées
                    </span>
                    <p className="text-gray-500 text-xs mt-1">
                      Commandes livrées avec succès
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg border border-gray-700">
                  <div className="w-5 h-5 bg-orange-500 rounded-full shadow-sm"></div>
                  <div className="flex-1">
                    <span className="text-gray-300 font-semibold">
                      Livraisons en Cours
                    </span>
                    <p className="text-gray-500 text-xs mt-1">
                      Commandes en cours de livraison
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg border border-gray-700">
                  <div className="w-5 h-5 bg-red-500 rounded-full shadow-sm"></div>
                  <div className="flex-1">
                    <span className="text-gray-300 font-semibold">
                      Livraisons Annulées
                    </span>
                    <p className="text-gray-500 text-xs mt-1">
                      Commandes annulées ou échouées
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {activeTab === "sale" && <><SaleDashbord/></>}
    </div>
  );
}
