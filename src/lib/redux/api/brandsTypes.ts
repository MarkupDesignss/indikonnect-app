export interface Brand {
    id: number;
    title: string;
    status: number;
    discount_percentage: number;
    logo: string;
    banner: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface GetBrandsResponse {
    success: boolean;
    message: string;
    data: Brand[];
  }