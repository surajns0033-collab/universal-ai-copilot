/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    // Emit a self-contained server bundle for container/DigitalOcean deploys.
    output: 'standalone',
    // Enforce safe defaults for model-generated content rendering.
    experimental: {
        // Kept intentionally empty; minimal surface area for a hackathon release.
    },
    async headers() {
        return [
            {
                // Baseline security headers applied to all routes.
                source: '/(.*)',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
