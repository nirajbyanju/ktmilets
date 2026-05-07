export const calculateAge = (dateOfBirth: string | Date | null | undefined): number | 'N/A' => {
    if (!dateOfBirth) return 'N/A';
    const birthDate = new Date(dateOfBirth);
    if (isNaN(birthDate.getTime())) return 'N/A';
    
    const age = new Date().getFullYear() - birthDate.getFullYear();
    return new Date().getMonth() < birthDate.getMonth() || 
           (new Date().getMonth() === birthDate.getMonth() && 
            new Date().getDate() < birthDate.getDate())
      ? age - 1
      : age;
  };