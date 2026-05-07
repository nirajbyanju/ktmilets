import { User } from "@/types/auth/UserTypes";
export interface OptionsManager {
    status: boolean;
    message: string;
    data: Permissions[];
    pagination: {
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
    };
  }
  

export interface OptionsManagers {
  id: number; 
  label: string;
  slug: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isStatus: number;
  photo?: string;
  creator: User;
  name: string;
  parentId: number | null;
  children?: OptionsManagers[];
}

export interface OptionsManagerResponse {
    data: OptionsManagers[];
    pagination: {
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
    };
  }

// types/setting/optionsManager/optionsManager.ts

// Base option interface
export interface BaseOption {
    id: number;
    name?: string;
    label?: string;
    slug?: string;
    code?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

// Main OptionsAll interface
export interface OptionsAll {
    province: BaseOption[];
    district: BaseOption[];
    municipality: BaseOption[];
    ward: BaseOption[];
    roadtype: BaseOption[];
    unit: BaseOption[];
    propertytype: BaseOption[];
    propertystatus: BaseOption[];
    listingtype: BaseOption[];
    housetype: BaseOption[];
    housedetail: BaseOption[];
    rooftype: BaseOption[];
    constructionstatus: BaseOption[];
    watersource: BaseOption[];
    sewagetype: BaseOption[];
    propertyface: BaseOption[];
    contructionstatus: BaseOption[];
}

// Response wrapper type
export interface OptionsAllResponse {
    success: boolean;
    data: OptionsAll;
    message?: string;
}
