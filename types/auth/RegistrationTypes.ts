export interface Registration {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    phoneNumber: string;
    password: string;
    cPassword: string;
    general?: string;
    token?: string; 
}
export interface RegistrationResponse {
  success: boolean;
  error?: {
    message?: string;
    error?: {
      validationErrors?: { [key: string]: string[] };
    };
  };
}


