"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar/Navbar";
import { productItems } from "../types/type";
import api from "../prisma/api";
import { useAuth } from "../context/AuthContext";

// Interface pour les données de pagination
interface PaginationData {
  data: productItems[];
  total: number;
  totalPage: number;
  page: number;
 
}

export default function LowStockProductsPage() {
  const [products, setProducts] = useState<productItems[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const {user} = useAuth()
  const tenantId= user?.tenantId

  const limit = 10;
  const stockThreshold = 10;

  // Fonction pour récupérer les produits avec stock faible
  const fetchLowStockProducts = async (page: number = 1) => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/product/lower/${tenantId}`, {
        params: {
          limit,
          page,
        },
      });

      const productData: PaginationData = response.data;

      if (Array.isArray(productData.data)) {
        setProducts(productData.data);
        setTotalPages(productData.totalPage || 1);
        setPage(productData.page || page);
        setTotal(productData.total || 0);
      } else {
        throw new Error("Format de données invalide");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des produits";

      console.error(
        "Échec de récupération des produits avec stock critique:",
        error
      );
      setError(`Impossible de charger les produits: ${errorMessage}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    fetchLowStockProducts(1);
  }, [tenantId]);
  // Fonction pour changer de page
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== page) {
      fetchLowStockProducts(page);
    }
  };

  // Fonction pour déterminer le niveau d'alerte du stock
  const getStockAlertLevel = (stock: number) => {
    if (stock === 0) return "critical";
    if (stock <= 3) return "high";
    if (stock <= 6) return "medium";
    return "low";
  };
  // Fonction pour formatter le prix
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };
  // Composant d'alerte de stock
  const StockAlert = ({ stock }: { stock: number }) => {
    const alertLevel = getStockAlertLevel(stock);
    const alertConfig = {
      critical: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: "⚠️",
        text: "Rupture de stock",
      },
      high: {
        color: "bg-orange-100 text-orange-800 border-orange-200",
        icon: "🔴",
        text: "Stock critique",
      },
      medium: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: "🟡",
        text: "Stock faible",
      },
      low: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: "🔵",
        text: "Stock limité",
      },
    };

    const config = alertConfig[alertLevel];

    return (
      <div
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        <span className="mr-1">{config.icon}</span>
        {stock === 0 ? config.text : `${stock} unités - ${config.text}`}
      </div>
    );
  };

  // Composant de pagination
  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-8 px-6 py-4 bg-gray-50 border-t">
        <div className="text-sm text-gray-600">
          Affichage de {Math.min((page - 1) * limit + 1, total)} à{" "}
          {Math.min(page * limit, total)} sur {total} produits
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || loading}
            className="px-3 py-1 text-sm border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                disabled={loading}
                className={`px-3 py-1 text-sm border rounded-md ${
                  page === page
                    ? "bg-blue-500 text-white border-blue-500"
                    : "hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || loading}
            className="px-3 py-1 text-sm border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="fixed left-0 top-0 h-full z-10">
          <Navbar />
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64">
          {" "}
          {/* Ajustez ml-64 selon la largeur de votre navbar */}
          {/* Header Section */}
          <div className="bg-white shadow-sm border-b">
            <div className="px-6 py-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl px-3 font-bold text-gray-900">
                    📦 Gestion des Stocks Critiques
                  </h1>
                  <p className="mt-2 px-3 text-gray-600">
                    Produits avec un stock inférieur à {stockThreshold} unités
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                    <div className="text-red-800 font-semibold text-lg">
                      {total}
                    </div>
                    <div className="text-red-600 text-sm">
                      Produits en alerte
                    </div>
                  </div>

                  <button
                    onClick={() => fetchLowStockProducts(page)}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <span>{loading ? "🔄" : "🔄"}</span>
                    <span>{loading ? "Actualisation..." : "Actualiser"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Content Section */}
          <div className="p-6">
            {/* Error State */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-red-500 text-xl mr-3">⚠️</span>
                  <div>
                    <h3 className="text-red-800 font-medium">
                      Erreur de chargement
                    </h3>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && !error && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Chargement des produits...</p>
              </div>
            )}
            {/* Products Grid */}
            {!loading && !error && (
              <>
                {products.length > 0 ? (
                  <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b">
                      <div className="grid grid-cols-6 gap-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                        <div>Produit</div>
                        <div>Description</div>
                        <div>Stock</div>
                        <div>Prix d&apos;achat</div>
                        <div>Prix de vente</div>
                        <div>Marge</div>
                      </div>
                    </div>

                    {/* Products List */}
                    <div className="divide-y divide-gray-200">
                      {products.map((product, index) => {
                        const margin = product.price - product.purchasePrice;
                        const marginPercentage =
                          product.purchasePrice > 0
                            ? ((margin / product.purchasePrice) * 100).toFixed(
                                1
                              )
                            : "0";

                        return (
                          <div
                            key={product.id}
                            className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-25"
                            }`}
                          >
                            <div className="grid grid-cols-6 gap-4 items-center">
                              {/* Nom du produit */}
                              <div className="font-medium text-gray-900">
                                {product.name}
                              </div>

                              {/* Description */}
                              <div className="text-gray-600 text-sm">
                                {product.description ? (
                                  <span className="line-clamp-2">
                                    {product.description}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 italic">
                                    Aucune description
                                  </span>
                                )}
                              </div>

                              {/* Stock avec alerte */}
                              <div>
                                <StockAlert stock={product.stock} />
                              </div>

                              {/* Prix d'achat */}
                              <div className="text-gray-700 font-mono">
                                {formatPrice(product.purchasePrice)}
                              </div>

                              {/* Prix de vente */}
                              <div className="text-gray-900 font-mono font-semibold">
                                {formatPrice(product.price)}
                              </div>

                              {/* Marge */}
                              <div className="text-right">
                                <div
                                  className={`font-mono font-semibold ${
                                    margin >= 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {formatPrice(margin)}
                                </div>
                                <div
                                  className={`text-xs ${
                                    parseFloat(marginPercentage) >= 0
                                      ? "text-green-500"
                                      : "text-red-500"
                                  }`}
                                >
                                  {marginPercentage}%
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination */}
                    <Pagination />
                  </div>
                ) : (
                  // Empty State
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Aucun produit en stock critique
                    </h3>
                    <p className="text-gray-600">
                      Tous vos produits ont un stock supérieur à{" "}
                      {stockThreshold} unités.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
