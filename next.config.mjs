import withPWAInit from "@ducanh2912/next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com', 'res.cloudinary.com'],
  },
};

const withPWA = withPWAInit({
  dest: "public",
});

export default withPWA(nextConfig);