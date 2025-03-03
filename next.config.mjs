/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
      appDir: true,
    },
    output: "export", // これを必ず追加！
  };
  
  export default nextConfig;
  