/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@supabase/ssr'],
}

module.exports = nextConfig 