/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  distDir: "out", // This is the default for export
  // If you're using basePath
  // basePath: '/indikonnect-web',
};

module.exports = nextConfig;
