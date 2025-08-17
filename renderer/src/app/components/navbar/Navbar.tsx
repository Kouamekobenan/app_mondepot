"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  FileText,
  House,
  Milk,
  Truck,
  UserPlus,
  UserRound,
  UsersRound,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Phone,
  Package,
  Grid3X3,
  ShoppingCart,
  ShoppingCartIcon,
  CreditCard,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
// Types
interface User {
  role: "MANAGER" | "CASHIER" | "ADMIN" | string;
}
interface SubmenuItem {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}
interface NavigationItem {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  hasSubmenu?: boolean;
  submenu?: SubmenuItem[];
}
interface AuthContextType {
  user: User | null;
}
export default function Navbar() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeItem, setActiveItem] = useState<string>("/dashbord");
  const [isProductsOpen, setIsProductsOpen] = useState<boolean>(false);
  const [isDirectSaleOpen, setIsDirectSaleOpen] = useState<boolean>(false);
  const { user } = useAuth() as AuthContextType;

  const toggleSidebar = (): void => setIsOpen((prev) => !prev);
  const toggleProducts = (): void => setIsProductsOpen((prev) => !prev);
  const toggleDirectSale = (): void => setIsDirectSaleOpen((prev) => !prev);

  const navigationItems: NavigationItem[] = [
    {
      href: "/dashbord", // Corrigé le typo "dashbord"
      icon: House,
      label: "Accueil",
    },
    {
      href: "/products",
      icon: Milk,
      label: "Produits",
      hasSubmenu: true,
      submenu: [
        { href: "/products", icon: Package, label: "Liste des produits" },
        { href: "/pages/categories", icon: Grid3X3, label: "Catégories" },
        { href: "/order", icon: ShoppingCart, label: "Commandes" },
      ],
    },
    {
      href: "/directeSale",
      icon: ShoppingCartIcon,
      label: "Ventes directe",
      hasSubmenu: true,
      submenu: [
        {
          href: "/directeSale/sale",
          icon: BarChart3,
          label: "Dashboard Caissier(e)",
        },
        {
          href: "/directeSale/creditPayment",
          icon: CreditCard,
          label: "Gestion crédit",
        },
      ],
    },
    {
      href: "/deliveries",
      icon: Truck,
      label: "Livraisons",
    },
    {
      href: "/rapport",
      icon: FileText,
      label: "Rapports des livraisons",
    },
  ];
  const actorItems: NavigationItem[] = [
    { href: "/users", icon: UserRound, label: "Utilisateurs" },
    { href: "/fourniseurs", icon: UsersRound, label: "Fournisseurs" },
    { href: "/deliveryPerson", icon: UserPlus, label: "Livreurs" },
    { href: "/customer", icon: UserRound, label: "Clients" },
    { href: "/admin", icon: UserRound, label: "Administrateur" },
  ];
  const handleItemClick = (item: NavigationItem): void => {
    if (item.hasSubmenu) {
      if (item.href === "/products") {
        toggleProducts();
      } else if (item.href === "/directeSale") {
        toggleDirectSale();
      }
    } else {
      setActiveItem(item.href);
      // Fermer le sidebar sur mobile après sélection
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    }
  };

  const handleSubItemClick = (href: string): void => {
    setActiveItem(href);
    // Fermer le sidebar sur mobile après sélection
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };
  const isItemActive = (item: NavigationItem): boolean => {
    if (item.hasSubmenu && item.submenu) {
      return item.submenu.some((subItem) => activeItem === subItem.href);
    }
    return activeItem === item.href;
  };
  const isSubmenuOpen = (item: NavigationItem): boolean => {
    if (item.href === "/products") return isProductsOpen;
    if (item.href === "/directeSale") return isDirectSaleOpen;
    return false;
  };
  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Bouton menu burger pour mobile */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="text-white bg-gradient-to-r from-gray-800 to-gray-900 p-3 rounded-lg shadow-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 border border-gray-700"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 
          shadow-2xl border-r border-gray-700 z-40 transform transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:flex md:flex-col
        `}
      >
        {/* Header avec logo */}
        <div className="px-6 py-8 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Image
                src="/logo.png"
                width={48}
                height={48}
                alt="Logo DrinkFlow"
                className="rounded-xl border-2 border-orange-500 shadow-lg"
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold leading-none">
                12
                <span className="text-orange-500 font-serif">Depôt</span>
              </h1>
              <p className="text-gray-400 text-xs mt-1">Système de gestion</p>
            </div>
          </div>
        </div>
        {/* Navigation principale */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <section className="mb-8">
            <h2 className="text-orange-400 font-semibold text-sm uppercase tracking-wider mb-4 px-2">
              Navigation Principale
            </h2>
            <ul className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(item);
                const isSubmenuVisible = isSubmenuOpen(item);
                return (
                  <li key={item.href}>
                    {/* Item principal */}
                    {item.hasSubmenu ? (
                      <button
                        onClick={() => handleItemClick(item)}
                        className={`
                          group flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 w-full text-left
                          ${
                            isActive || isSubmenuVisible
                              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                              : "text-gray-300 hover:bg-gray-800 hover:text-white"
                          }
                        `}
                      >
                        <Icon
                          size={20}
                          className={`${
                            isActive || isSubmenuVisible
                              ? "text-white"
                              : "text-gray-400 group-hover:text-orange-400"
                          } transition-colors`}
                        />
                        <span className="font-medium flex-1">{item.label}</span>
                        {isSubmenuVisible ? (
                          <ChevronDown size={16} className="text-white" />
                        ) : (
                          <ChevronRight
                            size={16}
                            className={`${
                              isActive
                                ? "text-white"
                                : "text-gray-400 group-hover:text-orange-400"
                            }`}
                          />
                        )}
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => handleSubItemClick(item.href)}
                        className={`
                          group flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                          ${
                            isActive
                              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                              : "text-gray-300 hover:bg-gray-800 hover:text-white"
                          }
                        `}
                      >
                        <Icon
                          size={20}
                          className={`${
                            isActive
                              ? "text-white"
                              : "text-gray-400 group-hover:text-orange-400"
                          } transition-colors`}
                        />
                        <span className="font-medium">{item.label}</span>
                        {isActive && (
                          <ChevronRight
                            size={16}
                            className="ml-auto text-white"
                          />
                        )}
                      </Link>
                    )}

                    {/* Sous-menu */}
                    {item.hasSubmenu && item.submenu && isSubmenuVisible && (
                      <ul className="ml-4 mt-2 space-y-1 border-l-2 border-orange-500/30 pl-4">
                        {item.submenu.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const isSubActive = activeItem === subItem.href;

                          return (
                            <li key={subItem.href}>
                              <Link
                                href={subItem.href}
                                onClick={() => handleSubItemClick(subItem.href)}
                                className={`
                                  group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                                  ${
                                    isSubActive
                                      ? "bg-orange-500/20 text-orange-300 border border-orange-500/50"
                                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                  }
                                `}
                              >
                                <SubIcon
                                  size={16}
                                  className={`${
                                    isSubActive
                                      ? "text-orange-400"
                                      : "text-gray-500 group-hover:text-orange-400"
                                  } transition-colors`}
                                />
                                <span className="font-medium text-sm">
                                  {subItem.label}
                                </span>
                                {isSubActive && (
                                  <div className="ml-auto w-2 h-2 bg-orange-400 rounded-full"></div>
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
          {/* Section Acteurs */}
          {user?.role === "MANAGER" && (
            <section className="mb-8">
              <h2 className="text-orange-400 font-semibold text-sm uppercase tracking-wider mb-4 px-2">
                Gestion des Acteurs
              </h2>
              <ul className="space-y-1">
                {actorItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeItem === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => handleSubItemClick(item.href)}
                        className={`
                          group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                          ${
                            isActive
                              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                              : "text-gray-300 hover:bg-gray-800 hover:text-white"
                          }
                        `}
                      >
                        <Icon
                          size={18}
                          className={`${
                            isActive
                              ? "text-white"
                              : "text-gray-400 group-hover:text-orange-400"
                          } transition-colors`}
                        />
                        <span className="font-medium text-sm">
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </nav>
        {/* Contact Admin - Footer */}
        <div className="px-4 py-6 border-t border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
          <h3 className="text-orange-400 font-semibold text-sm uppercase tracking-wider mb-3">
            Support Admin
          </h3>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Phone size={16} className="text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Assistance 24/7</p>
                <a
                  href="tel:+22505068326778"
                  className="text-white font-mono text-sm hover:text-orange-400 transition-colors"
                >
                  +225 05 06 83 26 78
                </a>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
