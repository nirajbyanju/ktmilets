import { FC } from "react";
import Logoonly from "@/assets/auth/Logoonly.png";

interface LoaderProps {}

const Loader: FC<LoaderProps> = ({}) => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="relative flex justify-center items-center">
        {/* Spinner with z-index to stay in the background */}
        <div className="absolute animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-opsh-primary border-opacity-50 z-10"></div>
        
        {/* Logo on top of the spinner */}
        <img src={Logoonly} alt="Logo" className="rounded-full h-28 w-28 z-20" />
      </div>
    </div>
  );
};

export default Loader;

