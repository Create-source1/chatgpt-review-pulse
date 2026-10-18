/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: false,
  outputFileTracingIncludes: {
    "/**/*": ["./data/**/*"],
  },
};

export default nextConfig;