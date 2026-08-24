// types/headerTypes.ts
export interface LogoData {
    id: number;
    type: string;
    logo: string;
    favicon: string;
  }
  
  export interface MenuItem {
    id: number;
    title: string;
    slug: string;
    sort_order: number;
    status: boolean;
  }
  
  export interface HeaderData {
    logo: LogoData;
    menus: MenuItem[];
  }
  
  export interface HeaderResponse {
    success: boolean;
    data: HeaderData;
  }
  export interface DistributorStats {
    user_id: number;
    full_name: string;
    email: string;
    phone: string;
    total_orders: number;
    total_amount_mrp: number;
    total_savings: number;
    total_coins_earned: number;
    account_type: string;
    joined_at: string;
  }
  
  export interface DistributorStatsResponse {
    success: boolean;
    data: DistributorStats;
    message: string;
  }