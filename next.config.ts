import type { NextConfig } from "next";

const actionOrigins = [
  process.env.PRIMARY_DOMAIN,
  process.env.ALLOWED_ORIGINS,
]
  .filter(Boolean)
  .flatMap((value) => String(value).split(","))
  .map((value) => value.trim().replace(/^https?:\/\//, "").replace(/\/$/, ""))
  .filter(Boolean);

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg"],
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "*.easypanel.host",
        "**.easypanel.host",
        ...actionOrigins,
      ],
    },
  },
};

export default nextConfig;
