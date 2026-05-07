export interface FieldTour {
    status: boolean;
    message: string
    applicationMode: string;
    data: FieldTours[];
    pagination: {
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
    };
  
  }

export interface FieldTours {
    id: number;
    property_id: number;
    date: string;
    time: string;
    name: string;
    phone: string;
    email: string;
    message: string;
    is_termandable: boolean;
    remarks: string;
    status: number;
    created_at: string;
}