'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaRegUser, FaUsers, FaSignOutAlt } from "react-icons/fa";
import { RiCustomerService2Fill } from "react-icons/ri";
import ProfileAvatar from "@/components/profileAvatar/profileAvatar";
import useAuthStore from "@/stores/auth/AuthStore";
import { RefObject, useState } from "react";
import { toast } from 'react-toastify';

interface UserDetail {
  profilePicture?: string;
}

interface Profile {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  userdetail?: UserDetail;
}

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
}

interface ProfileDropdownProps {
  isOpen: boolean;
  dropdownRef: RefObject<HTMLDivElement | null>;
  profile?: Profile;
  userData: UserData;
  onClose?: () => void;
}

type LogoutError = {
  message?: string;
};

const ProfileDropdown = ({ 
  isOpen, 
  dropdownRef, 
  profile, 
  userData,
  onClose,
}: ProfileDropdownProps) => {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isOpen) return null;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error: unknown) {
      console.error('Logout failed:', error);
      const logoutError = error as LogoutError;
      toast.info(logoutError.message || 'Session ended');
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
      onClose?.();
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full z-50 mt-2 w-[280px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-opsh-lg border border-opsh-grey bg-white shadow-opsh-lgabsolute right-0 mt-10 z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-64"
    >
      <div className="px-2 py-3 border-b border-gray-100">
        <div className="flex gap-3 items-center">
          <div className="relative inline-block">
            <div className="group relative inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-opsh-primary overflow-hidden bg-gray-100 transition-all duration-200 hover:border-opsh-primary-dark hover:shadow-sm">
              <ProfileAvatar
                firstName={profile?.first_name || ""}
                lastName={profile?.last_name || ""}
                imageUrl={profile?.userdetail?.profilePicture || null}
                size="sm"
                className="absolute inset-0 w-full h-full text-sm font-medium text-gray-600 group-hover:text-opsh-primary-dark"
              />
            </div>
            <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
          </div>
          <div>
            <span className="text-base font-medium text-gray-900 block">
              {userData?.firstName} {userData?.lastName}
            </span>
            <span className="text-sm text-gray-500 overflow-hidden">
              {userData?.email}
            </span>
          </div>
        </div>
      </div>

      <div className="py-2">
        <Link
          href="/admin/settings/profile"
          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition ease-in-out duration-150"
          onClick={onClose}
        >
          <FaRegUser className="mr-3 text-gray-500" />
          My Profile
        </Link>

        <Link
          href="/admin/user-management"
          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition ease-in-out duration-150"
          onClick={onClose}
        >
          <FaUsers className="mr-3 text-gray-500" />
          User Management
        </Link>

        <Link
          href="/help-support"
          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition ease-in-out duration-150"
          onClick={onClose}
        >
          <RiCustomerService2Fill className="mr-3 text-gray-500" />
          Help & Support
        </Link>

        <button
          type="button"
          className="flex items-center px-4 py-3 text-sm text-opsh-danger hover:bg-gray-100 transition ease-in-out duration-150 w-full text-left"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <FaSignOutAlt className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;
