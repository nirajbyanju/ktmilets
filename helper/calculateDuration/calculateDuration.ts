// src/utils/dateUtils.ts

export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  
  // Define types for the parameters and return value
  export const calculateDuration = (startDate: any | Date, endDate: any | Date): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
  
    // Adjust if end month is before start month
    if (months < 0) {
      years -= 1;
      months += 12;
    }
  
    return `${years} years, ${months} months`;
  };
  