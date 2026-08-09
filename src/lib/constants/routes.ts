// lib/constants/routes.ts

export const ROUTES = {
    // Auth Routes
    auth: {
        customer: {
            login: '/auth/customer/login',
            verifyOTP: '/auth/customer/verify-otp',
            register: '/auth/customer/register',
        },
        distributor: {
            login: '/auth/distributor/login',
            verifyOTP: '/auth/distributor/verify-otp',
            register: '/auth/distributor/register',
        },
    },

    // Customer Routes
    customer: {
        dashboard: '/customer/dashboard',
        profile: '/customer/profile',
        orders: '/customer/orders',
        wishlist: '/customer/wishlist',
        cart: '/customer/cart',
        checkout: '/customer/checkout',
    },

    // Distributor Routes
    distributor: {
        dashboard: '/distributor/dashboard',
        profile: '/distributor/profile',
        network: '/distributor/network',
        commission: '/distributor/commission',
        ledger: '/distributor/ledger',
        orders: '/distributor/orders',
        team: '/distributor/team',
        products: '/distributor/products',
    },

    // Common Routes
    common: {
        home: '/',
        shop: '/shop',
        collections: '/collections',
        opportunity: '/opportunity',
        journal: '/products',
        contact: '/contact',
        support: '/support',
        terms: '/terms',
        privacy: '/privacy',
        faq: '/faq',
        about: '/about',
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