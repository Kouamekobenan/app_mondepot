/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: false, // Changez ça pour attraper les erreurs
  },
  typescript: {
    ignoreBuildErrors: true, // Assurez-vous que TypeScript vérifie tout
  },
  generateEtags: false,
  output: "standalone",

  // Ajouts utiles pour desktop/Electron :
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },

  // Si vous utilisez des variables d'environnement :
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig;
