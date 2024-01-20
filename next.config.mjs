/** @type {import('next').NextConfig} */
const nextConfig = {
    productionBrowserSourceMaps: true,
    images: {
        domains: [
            'res.cloudinary.com',
            "cla.flexrentalsolutions.com",
            "img.clerk.com"
        ]
    }
}

export default nextConfig;
