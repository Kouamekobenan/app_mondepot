"use client";
import React, { useEffect, useState } from "react";
import {
  Package,
  Truck,
  TrendingUp,
  CheckCircle,
  BarChart3,
  Search,
  Loader2,
  Sheet,
  SwissFranc,
} from "lucide-react";
import Navbar from "../components/navbar/Navbar";
import { useAuth } from "../context/AuthContext";
import { dashbordItems, deliveryProducts } from "../types/type";
import api from "../prisma/api";
import Link from "next/link";

const Admin = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  const [dataDashboard, setDashboard] = useState<dashbordItems>();
  const [startDate, setStartDate] = useState("2025-07-01");
  const [endDate, setEndDate] = useState("2025-07-22");
  const [amountTotal, setAmountTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [deliveries, setDeliveries] = useState<deliveryProducts[]>([]);
  const totalLivraison = deliveries.reduce(
    (sum, delivery) => sum + Number(delivery.totalPrice),
    0
  );

  // Charger les stats globales
  useEffect(() => {
    if (!tenantId) return;
    const fetchDashboard = async () => {
      setDashboardLoading(true);
      try {
        const res = await api.get(`/dashbord/${tenantId}`);
        setDashboard(res.data);
      } catch (error) {
        console.error("Erreur lors du chargement du dashboard:", error);
      } finally {
        setDashboardLoading(false);
      }
    };
    fetchDashboard();
  }, [tenantId]);

  // Charger les ventes sur période
  const fetchSaleDay = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const resp = await api.get(`/dashbord/day-sale/${tenantId}`, {
        params: { startDate, endDate },
      });
      setAmountTotal(resp.data?.total ?? 0);
    } catch (error) {
      console.error("Erreur lors du chargement des ventes par jour:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaleDay();
  }, [tenantId, startDate, endDate]);
  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const res = await api.get(`/delivery/tenant/${tenantId}`);
        console.log(res.data);
        setDeliveries(res.data);
      } catch (error: unknown) {
        console.log("Erreur lors du chargement", error);
      }
    };
    fetchDeliveries();
  }, [tenantId]);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    iconColor,
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: string;
    iconColor: string;
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 ${iconColor} rounded-lg shadow-sm`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend && (
          <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
  const LoadingSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-8 bg-gray-200 rounded w-24"></div>
    </div>
  );
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Navbar />
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg">
                    <Sheet className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Tableau de bord
                    </h1>
                    <p className="text-gray-600">
                      Page administrateur de:{" "}
                      <span className="font-semibold text-green-600">
                        {user?.tenantName}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Link href="/history-sale">
                    <button className="inline-flex cursor-pointer items-center px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      Historique des ventes
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
            {dashboardLoading ? (
              Array(5)
                .fill(0)
                .map((_, i) => <LoadingSkeleton key={i} />)
            ) : (
              <>
                <StatCard
                  title="Chiffre d'affaire vente en (FCFA)"
                  value={`${dataDashboard?.totalRevenue?.toLocaleString()}`}
                  icon={SwissFranc}
                  iconColor="bg-orange-300 from-green-500"
                  trend="+12%"
                />
                <StatCard
                  title="Chiffre d'affaire livraison en (FCFA)"
                  value={totalLivraison || 0}
                  icon={SwissFranc}
                  iconColor="bg-orange-300 from-green-500"
                  trend="+12%"
                />
                <StatCard
                  title="Total produits vendus"
                  value={dataDashboard?.totalSales || 0}
                  icon={Package}
                  iconColor="bg-orange-300 from-blue-500 to-blue-600"
                />
                <StatCard
                  title="Total livraisons"
                  value={dataDashboard?.totalDeliveries || 0}
                  icon={Truck}
                  iconColor="bg-orange-300 from-orange-500 to-orange-600"
                />
                <StatCard
                  title="Ventes aujourd'hui"
                  value={dataDashboard?.salesToday || 0}
                  icon={TrendingUp}
                  iconColor="bg-orange-300 from-purple-500 to-purple-600"
                />
                <StatCard
                  title="Livraisons aujourd'hui"
                  value={dataDashboard?.deliveriesToday || 0}
                  icon={CheckCircle}
                  iconColor="bg-orange-300 from-emerald-500 to-emerald-600"
                />
              </>
            )}
          </div>
          {/* Period Analysis */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg mr-4">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Analyse par période
                </h2>
                <p className="text-gray-600">
                  Consultez les ventes sur une période personnalisée
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Date de début
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <button
                  onClick={fetchSaleDay}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Chargement...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      <span>Analyser</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border-l-4 border-green-500">
                <p className="text-sm font-medium text-green-700 mb-1">
                  Montant total
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {amountTotal.toLocaleString()} FCFA
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
