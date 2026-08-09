// lib/constants/routes.ts

// Get base path from environment or default
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

// Helper to add base path to routes
const withBasePath = (path: string): string => {
    if (!BASE_PATH) return path;
    // Remove trailing slash from base path if exists
    const cleanBasePath = BASE_PATH.replace(/\/$/, '');
    return `${cleanBasePath}${path}`;
};

export const ROUTES = {
    // Auth Routes
    auth: {
        customer: {
            login: withBasePath('/auth/customer/login'),
            verifyOTP: withBasePath('/auth/customer/verify-otp'),
            register: withBasePath('/auth/customer/register'),
        },
        distributor: {
            login: withBasePath('/auth/distributor/login'),
            verifyOTP: withBasePath('/auth/distributor/verify-otp'),
            register: withBasePath('/auth/distributor/register'),
        },
    },

    // Customer Routes
    customer: {
        dashboard: withBasePath('/customer/dashboard'),
        profile: withBasePath('/customer/profile'),
        orders: withBasePath('/customer/orders'),
        wishlist: withBasePath('/customer/wishlist'),
        cart: withBasePath('/customer/cart'),
        checkout: withBasePath('/customer/checkout'),
    },

    // Distributor Routes
    distributor: {
        dashboard: withBasePath('/distributor/dashboard'),
        profile: withBasePath('/distributor/profile'),
        network: withBasePath('/distributor/network'),
        commission: withBasePath('/distributor/commission'),
        ledger: withBasePath('/distributor/ledger'),
        orders: withBasePath('/distributor/orders'),
        team: withBasePath('/distributor/team'),
        products: withBasePath('/distributor/products'),
    },

    // Common Routes
    common: {
        home: withBasePath('/'),
        shop: withBasePath('/shop'),
        collections: withBasePath('/collections'),
        opportunity: withBasePath('/opportunity'),
        journal: withBasePath('/products'),
        contact: withBasePath('/contact'),
        support: withBasePath('/support'),
        terms: withBasePath('/terms'),
        privacy: withBasePath('/privacy'),
        faq: withBasePath('/faq'),
        about: withBasePath('/about'),
    },
} as const;

export type RouteKey = keyof typeof ROUTES;
export type CustomerRoute = keyof typeof ROUTES.customer;
export type DistributorRoute = keyof typeof ROUTES.distributor;

// Helper to get route with params
export const getRoute = (route: string, params?: Record<string, string | number>): string => {
    if (!params) return route;
    const queryString = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
        }, {} as Record<string, string>)
    ).toString();
    return `${route}?${queryString}`;
};

// Helper to check if route is active
export const isActiveRoute = (pathname: string, route: string): boolean => {
    if (route === '/') {
        return pathname === route;
    }
    return pathname.startsWith(route);
};

// Helper to get full URL with base path
export const getFullUrl = (route: string, params?: Record<string, string | number>): string => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    const cleanBasePath = basePath.replace(/\/$/, '');
    const fullPath = `${cleanBasePath}${route}`;
    return getRoute(fullPath, params);
};

// Helper to remove base path from URL (for matching)
export const removeBasePath = (pathname: string): string => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    if (!basePath) return pathname;
    return pathname.replace(new RegExp(`^${basePath}`), '') || '/';
};

// Export base path for use in other files
export const getBasePath = (): string => {
    return process.env.NEXT_PUBLIC_BASE_PATH || '';
};