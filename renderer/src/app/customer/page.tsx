"use client";
import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../components/navbar/Navbar";
import { customerDto } from "../types/type";
import { useAuth } from "../context/AuthContext";
import api from "../prisma/api";
import toast from "react-hot-toast";
import {
  Trash,
  Users,
  Mail,
  Phone,
  MapPin,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Types stricts pour l'API
interface PaginationResponse {
  data: customerDto[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface CustomerTableProps {
  customers: customerDto[];
  loading: boolean;
  deletingId: string | null;
  onDelete: (id: string, name: string) => Promise<void>;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  loading: boolean;
}

// Composant Table réutilisable
const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  loading,
  deletingId,
  onDelete,
}) => {
  const TableHeader: React.FC = () => (
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>Nom</span>
          </div>
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="flex items-center space-x-1">
            <Mail className="w-4 h-4" />
            <span>Email</span>
          </div>
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="flex items-center space-x-1">
            <Phone className="w-4 h-4" />
            <span>Téléphone</span>
          </div>
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>Adresse</span>
          </div>
        </th>
        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
  );

  const TableRow: React.FC<{ customer: customerDto }> = ({ customer }) => (
    <tr className="bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-orange-300 flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {customer.name}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{customer.email || "-"}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{customer.phone || "-"}</div>
      </td>
      <td className="px-6 py-4">
        <div
          className="text-sm text-gray-900 max-w-xs truncate"
          title={customer.address}
        >
          {customer.address || "-"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <button
          onClick={() => onDelete(customer.id, customer.name)}
          disabled={deletingId === customer.id}
          className="inline-flex items-center justify-center p-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          title="Supprimer le client"
        >
          {deletingId === customer.id ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash className="w-4 h-4" />
          )}
        </button>
      </td>
    </tr>
  );

  const EmptyState: React.FC = () => (
    <tr>
      <td colSpan={5} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun client trouvé
          </h3>
          <p className="text-gray-500">
            Aucun client n&apos;est enregistré dans votre base de données.
          </p>
        </div>
      </td>
    </tr>
  );

  const LoadingState: React.FC = () => (
    <tr>
      <td colSpan={5} className="px-6 py-12 text-center">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
          <span className="text-gray-600">Chargement des clients...</span>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader />
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <LoadingState />
            ) : customers.length === 0 ? (
              <EmptyState />
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id} customer={customer} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Composant Pagination réutilisable
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  loading,
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = (): number[] => {
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pages: number[] = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-lg">
      <div className="flex-1 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-700">
            Affichage de{" "}
            <span className="font-medium">
              {Math.min((currentPage - 1) * 10 + 1, totalItems)}
            </span>{" "}
            à{" "}
            <span className="font-medium">
              {Math.min(currentPage * 10, totalItems)}
            </span>{" "}
            sur <span className="font-medium">{totalItems}</span> résultats
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Précédent
          </button>

          <div className="hidden sm:flex space-x-1">
            {visiblePages.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                disabled={loading}
                className={`relative inline-flex items-center px-3 py-2 text-sm font-medium border rounded-md transition-colors duration-200 ${
                  page === currentPage
                    ? "z-10 bg-orange-600 border-orange-600 text-white"
                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                } disabled:opacity-50`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50
             disabled:cursor-not-allowed transition-colors duration-200"
          >
            Suivant
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant principal
const Customer: React.FC = () => {
  const [customers, setCustomers] = useState<customerDto[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const limit: number = 10;
  const { user } = useAuth();
  const tenantId: string | undefined = user?.tenantId;

  const fetchCustomers = useCallback(
    async (page: number = 1): Promise<void> => {
      if (!tenantId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await api.get<PaginationResponse>(
          `/customer/paginate/${tenantId}`,
          {
            params: {
              page,
              limit,
            },
          }
        );

        if (response.data && Array.isArray(response.data.data)) {
          setCustomers(response.data.data);
          setTotalPages(response.data.totalPages);
          setCurrentPage(response.data.currentPage || page);
          setTotalItems(response.data.totalItems || 0);
        } else {
          throw new Error("Format de réponse invalide");
        }
      } catch (error: unknown) {
        console.error("Erreur de chargement des clients:", error);
        toast.error("Erreur lors du chargement des clients");
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    },
    [tenantId, limit]
  );

  useEffect(() => {
    fetchCustomers(currentPage);
  }, [fetchCustomers, currentPage]);

  const handleDeleteCustomer = async (
    customerId: string,
    customerName: string
  ): Promise<void> => {
    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer le client "${customerName}" ?`
      )
    ) {
      return;
    }

    setDeletingId(customerId);
    try {
      await api.delete(`/customer/${customerId}`);
      toast.success(`Le client "${customerName}" a été supprimé avec succès!`);

      // Recharger la liste après suppression
      await fetchCustomers(currentPage);
    } catch (error: unknown) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression du client");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !loading) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Navigation Sidebar */}
      <div className="flex-shrink-0">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-orange-600" />
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Gestion des clients
                </h1>
                {!loading && (
                  <p className="text-gray-600 mt-1">
                    {totalItems} client{totalItems > 1 ? "s" : ""} au total
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Table */}
        <div className="space-y-0">
          <CustomerTable
            customers={customers}
            loading={loading}
            deletingId={deletingId}
            onDelete={handleDeleteCustomer}
          />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default Customer;
