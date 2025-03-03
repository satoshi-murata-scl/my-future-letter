/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    trailingSlash: false, // ✅ API のデプロイを正しくするため false にする
    output: "standalone", // ✅ API ルートをデプロイするため standalone にする
  };
  
  export default nextConfig;
  