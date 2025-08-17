import { CircleUser, EllipsisVertical } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";

interface Items {
  title: string;
  name: string | null;
  className?: string;
  onLogout: () => void;
}

export const CardUser: React.FC<Items> = ({
  title,
  name,
  className = "",
  onLogout,
}) => {
  const [showLogout, setShowLogout] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fermer menu logout au clic en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showLogout &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowLogout(false);
      }
    };

    // Fermer au ESC
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowLogout(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showLogout]);

  return (
    <section
      ref={containerRef}
      className="w-full flex justify-between items-center gap-4 border border-gray-700
     bg-gray-900 p-4 shadow-sm"
      aria-label="User account info"
    >
      <h2 className="text-2xl font-bold text-green-600 font-serif flex-[2]">{title}</h2>

      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center gap-2 bg-gray-700 rounded-md px-3 py-2 text-white select-none">
          <CircleUser size={28} />
          <span className="font-semibold truncate max-w-xs">
            {name ?? "Utilisateur"}
          </span>

          <button
            aria-label="Afficher les options"
            aria-expanded={showLogout}
            onClick={() => setShowLogout((prev) => !prev)}
            className="ml-2 rounded p-1 hover:bg-gray-500 focus:outline-none focus:ring-2 cursor-pointer focus:ring-gray-400"
            title="Options utilisateur"
          >
            <EllipsisVertical size={24} />
          </button>
        </div>

        {showLogout && (
          <button
            onClick={onLogout}
            className="ml-4 cursor-pointer rounded bg-gray-600 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-500 transition-colors"
          >
            Déconnexion
          </button>
        )}
      </div>
    </section>
  );
};
