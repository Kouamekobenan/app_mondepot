"use client";
import React, { useEffect, useState, useCallback } from "react";
import { OrderDto } from "../types/type";
import api, { formatDate } from "../prisma/api";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  DollarSign,
  ShoppingBag,
  Loader2,
  AlertCircle,
  RefreshCw,
  Printer,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function Order() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  const limit = 10;

  // Configuration des statuts avec des couleurs plus douces
  const getStatusConfig = (status: string) => {
    const statusConfigs = {
      PENDING: {
        icon: Clock,
        color: "text-amber-800 bg-amber-50 border-amber-200",
        label: "En attente",
        bgColor: "bg-amber-50",
      },
      COMPLETED: {
        icon: CheckCircle,
        color: "text-emerald-800 bg-emerald-50 border-emerald-200",
        label: "Confirmée",
        bgColor: "bg-emerald-50",
      },
      SHIPPED: {
        icon: Truck,
        color: "text-blue-800 bg-blue-50 border-blue-200",
        label: "Expédiée",
        bgColor: "bg-blue-50",
      },
      PAID: {
        icon: CheckCircle,
        color: "text-green-800 bg-green-50 border-green-200",
        label: "Livrée",
        bgColor: "bg-green-50",
      },
      DELIVERED: {
        icon: CheckCircle,
        color: "text-green-800 bg-green-50 border-green-200",
        label: "Livrée",
        bgColor: "bg-green-50",
      },
      CANCELED: {
        icon: XCircle,
        color: "text-red-800 bg-red-50 border-red-200",
        label: "Annulée",
        bgColor: "bg-red-50",
      },
    };
    return (
      statusConfigs[status as keyof typeof statusConfigs] ||
      statusConfigs.PENDING
    );
  };

  const fetchOrders = useCallback(
    async (page: number = 1, search: string = "", status: string = "ALL") => {
      setLoading(true);
      setError(null);

      try {
        const params: any = {
          page,
          limit,
        };
        // Ajout du paramètre de recherche seulement s'il n'est pas vide
        if (search.trim()) {
          params.search = search.trim();
        }
        // Ajout du paramètre de statut seulement s'il n'est pas "ALL"
        if (status !== "ALL") {
          params.status = status;
        }
        console.log("Paramètres de recherche:", params); // Debug
        const response = await api.get(`/order/paginate/${tenantId}`, {
          params,
        });
        if (response.data && Array.isArray(response.data.data)) {
          setOrders(response.data.data);
          setTotalPages(response.data.totalPage);
          setTotalOrders(response.data.total || 0);
          setCurrentPage(page);
        } else {
          throw new Error("Format de réponse invalide");
        }
      } catch (error: any) {
        console.error("Erreur lors de la récupération des commandes:", error);
        setError(
          error.response?.data?.message ||
            "Erreur lors du chargement des commandes"
        );
        setOrders([]);
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );
  // Déclencher la recherche automatiquement avec un délai
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchOrders(1, searchTerm, statusFilter);
    }, 300); // Délai de 300ms

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, statusFilter, fetchOrders]);

  // Charger les commandes au montage du composant
  useEffect(() => {
    fetchOrders(currentPage, searchTerm, statusFilter);
  }, [currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders(1, searchTerm, statusFilter);
  };
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
    // La recherche sera déclenchée automatiquement par useEffect
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRefresh = () => {
    fetchOrders(currentPage, searchTerm, statusFilter);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF", // Code ISO pour le franc CFA
      minimumFractionDigits: 0, // pas de centimes pour le FCFA
    }).format(price);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config = getStatusConfig(status);
    const IconComponent = config.icon;
    return (
      <span
        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${config.color} shadow-sm`}
      >
        <IconComponent className="w-3 h-3 mr-1.5" />
        {config.label}
      </span>
    );
  };

  const OrderDetailsModal = () => {
    if (!selectedOrder) return null;
    return (
      <div className="fixed inset-0 mx-6 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Détails de la commande
              </h2>
              <button
                onClick={() => setShowOrderDetails(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-sm font-medium text-gray-500">
                    ID Commande
                  </p>
                  <p className="text-sm font-mono text-gray-900 mt-1">
                    {selectedOrder.id}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Statut
                  </p>
                  <StatusBadge status={selectedOrder.status} />
                </div>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                <p className="text-sm font-medium text-orange-800">
                  Prix Total
                </p>
                <p className="text-2xl font-bold text-orange-900 mt-1">
                  {formatPrice(selectedOrder.totalPrice)}
                </p>
              </div>
              {selectedOrder.createdAt && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-sm font-medium text-gray-500">
                    Date de création
                  </p>
                  <p className="text-sm text-gray-900 mt-1">
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      <span className="ml-2 text-gray-600">Chargement des commandes...</span>
    </div>
  );

  const ErrorMessage = () => (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm border border-orange-300"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Réessayer
        </button>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-12">
      <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Aucune commande trouvée
      </h3>
      <p className="text-gray-600">
        {searchTerm || statusFilter !== "ALL"
          ? "Aucune commande ne correspond aux critères de recherche"
          : "Aucune commande n'a été passée pour le moment"}
      </p>
    </div>
  );
  return (
    <div className="flex gap-6 min-h-screen bg-gray-50">
      <div className="flex-1 p-6">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex gap-3">
                <Link href="/dashbord">
                  <button className="bg-gray-500 cursor-pointer text-white hover:bg-gray-600 px-2 py-0.5 rounded-md transition-colors shadow-sm border border-gray-300">
                    <ArrowLeft />
                  </button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Gestion des Commandes
                </h1>
              </div>
              <div className="flex text-center items-center">
                <p className="text-gray-600">
                  {totalOrders > 0
                    ? `${totalOrders} commande${
                        totalOrders > 1 ? "s" : ""
                      } au total`
                    : ""}
                </p>
              </div>
            </div>
            <Link href="/commandes">
              <button className="inline-flex font-bold items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm border border-green-300">
                Passer une commande
              </button>
            </Link>
          </div>
        </div>
        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-orange-300 rounded-xl border-0">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Commandes
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-orange-300 rounded-xl border-0">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">En Attente</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter((o) => o.status === "PENDING").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-orange-300 rounded-xl border-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Confirmées</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter((o) => o.status === "COMPLETED").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-orange-300 rounded-xl border-0">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Annulées</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter((o) => o.status === "CANCELED").length}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Filtres et recherche */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher par ID de commande..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
              </div>
            </form>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="PENDING">En attente</option>
                <option value="COMPLETED">Confirmées</option>
                <option value="SHIPPED">Expédiées</option>
                <option value="DELIVERED">Livrées</option>
                <option value="CANCELED">Annulées</option>
              </select>
            </div>
          </div>
        </div>
        {/* Liste des commandes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Liste des Commandes
              {orders.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({orders.length} sur {totalOrders})
                </span>
              )}
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorMessage />
            ) : orders.length === 0 ? (
              <EmptyState />
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4 mb-3">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          #{order.id.slice(-8)}...
                        </p>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1 text-orange-500" />
                          <span className="font-medium text-gray-900">
                            {formatPrice(order.totalPrice)}
                          </span>
                        </div>
                        {order.createdAt && (
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-blue-500" />
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                        )}
                        {order.orderItems && (
                          <div className="flex items-center">
                            <Package className="w-4 h-4 mr-1 text-green-500" />
                            <span>
                              {order.orderItems.length} article
                              {order.orderItems.length > 1 ? "s" : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {order.status === "PENDING" && (
                        <Link
                          href={`/detailOrder/${order.id}`}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-500 border border-green-300 rounded-lg hover:bg-green-600 transition-colors shadow-sm"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Suivi
                        </Link>
                      )}
                      <Link
                        href={`/detailOrder/${order.id}`}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Détails
                      </Link>
                      <Link
                        href={`/pdf/${order.id}`}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        Imprimer
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {currentPage} sur {totalPages}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Précédent
                  </button>

                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm ${
                            page === currentPage
                              ? "bg-orange-500 text-white border border-orange-300"
                              : "text-gray-500 bg-white border border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    Suivant
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal des détails */}
      {showOrderDetails && <OrderDetailsModal />}
    </div>
  );
}
