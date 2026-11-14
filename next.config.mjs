/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dev only: let phones on the local network (e.g. http://192.168.1.6:3000) load the dev JS,
  // otherwise the page never hydrates and nothing interactive works.
  allowedDevOrigins: ["192.168.*.*"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default nextConfig;
