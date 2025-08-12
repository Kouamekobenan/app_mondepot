"use client";
import Navbar from "@/app/components/navbar/Navbar";
import api from "@/app/prisma/api";
import { OrderDto } from "@/app/types/type";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  ShoppingCart,
  User,
  Clock,
  CreditCard,
  Package,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function DetailOrder() {
  const params = useParams();
  const [orders, setOrders] = useState<OrderDto>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const orderId = params.id as string;
  const totalQuantity =
    orders?.orderItems?.reduce((sum, item) => sum + Number(item.quantity), 0) ||
    0;
  useEffect(() => {
    const fetchOrders = async (orderId: string) => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/order/${orderId}`);
        console.log("data to order:", res.data);
        setOrders(res.data);
      } catch (error: unknown) {
        console.log("Erreur Api", error);
        setError("Erreur lors du chargement de la commande");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders(orderId);
  }, [orderId]);

  const validateOrder = async (id: string) => {
    try {
      await api.patch(`/order/completed/${id}`);
      toast.success("La commande à été validé avec succès!");
    } catch (error: unknown) {
      console.log("erreur api", error);
      toast.error("Erreur lors de la validation de la commande");
    }
  };
  const canceledOrder = async (id: string) => {
    try {
      await api.patch(`/order/${id}`);
      toast.success("La commande à été validé avec succès!");
    } catch (error: unknown) {
      console.log("erreur api", error);
      toast.error("Erreur lors de l'annulation de la commande");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF", // ou 'EUR' selon votre devise
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex gap-4 min-h-screen bg-gray-50">
        <div className="flex-shrink-0">
          <Navbar />
        </div>
        <div className="flex-1 p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex gap-4 min-h-screen bg-gray-50">
        <div className="flex-shrink-0">
          <Navbar />
        </div>
        <div className="flex-1 p-6">
          <div className="flex flex-col items-center justify-center h-64">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-600 text-lg font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <div className="flex-shrink-0">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link href="/order" className="cursor-pointer">
              <button className="mr-4 p-2 bg-gray-200  hover:bg-gray-300 rounded-lg transition-colors cursor-pointer">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Détails de la commande
              </h1>
              <p className="text-gray-600 mt-1">Commande #{orderId}</p>
            </div>
            {orders?.status === "PENDING" && (
              <div className="ml-auto space-x-2">
                <button
                  onClick={() => validateOrder(orders.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer"
                >
                  Valider la commande
                </button>
                <button
                  onClick={() => canceledOrder(orders.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg cursor-pointer"
                >
                  Annuler la commande
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Summary Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Informations de la commande
                </h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Caissier(ère)</p>
                        <p className="font-semibold text-gray-900">
                          @{orders?.userName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Statut</p>
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                            orders?.status || ""
                          )}`}
                        >
                          {orders?.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">
                          Total de la commande
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatPrice(orders?.totalPrice || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Quick Stats */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Articles</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orders?.orderItems?.length || 0}
                  </p>
                </div>
                <Package className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Quantité totale</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalQuantity}
                  </p>
                </div>
                <ShoppingCart className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>
        {/* Products Section */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Produits commandés
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix unitaire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders?.orderItems?.map((prod, index) => (
                    <tr
                      key={prod.productId}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <Package className="h-5 w-5 text-orange-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {prod.productName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(prod.unitPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {prod.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatPrice(prod.unitPrice * prod.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">
                  Total de la commande
                </span>
                <span className="text-2xl font-bold text-green-600">
                  {formatPrice(orders?.totalPrice || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
