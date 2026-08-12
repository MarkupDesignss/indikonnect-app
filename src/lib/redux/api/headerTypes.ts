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