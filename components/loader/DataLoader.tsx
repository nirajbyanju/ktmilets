import React from "react";

interface DataLoaderProps {
  size?: number;
  color?: string;
}

const DataLoader: React.FC<DataLoaderProps> = () => {
 

  return (
    <div className="flex justify-center p-4">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-opsh-primary" />
    </div>
  );
};

export default DataLoader;