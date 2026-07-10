/** @type {import('next').NextConfig} */
const nextConfig = {
  // node:sqlite is a built-in core module (Node >= 22.5), no externalization needed.
  // bcryptjs kept external for safety (pure-JS, but to avoid bundling).
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs'],
  },
};

module.exports = nextConfig;
