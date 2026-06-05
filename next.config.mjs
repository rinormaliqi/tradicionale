/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep native / server-only packages out of the bundle.
  experimental: {
    serverComponentsExternalPackages: ["@libsql/client", "sharp", "pdfkit"],
  },
};

export default nextConfig;
