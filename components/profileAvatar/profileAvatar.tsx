import React, { useMemo } from 'react';

interface ProfileAvatarProps {
  firstName: string;
  lastName: string;
  imageUrl?: string | null; // Added null as possible type
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  firstName,
  lastName,
  imageUrl,
  size = 'md',
  className = '',
}) => {
  // Generate initials from first and last name
  const initials = useMemo(() => {
    const firstInitial = firstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = lastName?.charAt(0)?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  }, [firstName, lastName]);

  // Generate a consistent but unique color based on the name
  const bgColor = useMemo(() => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];
    
    const nameHash = (firstName + lastName).split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(nameHash) % colors.length];
  }, [firstName, lastName]);

  // Size classes
  const sizeClasses = useMemo(() => {
    switch (size) {
      case 'sm':
        return 'w-10 h-10 text-xs';
      case 'md':
        return 'w-12 h-12 text-base';
      case 'lg':
        return 'w-16 h-16 text-lg';
      case 'xl':
        return 'w-24 h-24 text-xl';
      default:
        return 'w-12 h-12 text-base';
    }
  }, [size]);

  // Determine if we should show the image or initials
  const showImage = imageUrl && imageUrl.trim() !== '';

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-semibold select-none ${sizeClasses} ${bgColor} ${className} relative`}
    >
      {showImage ? (
        <>
          <img
            src={imageUrl}
            alt={`${firstName} ${lastName}`}
            className="w-full h-full rounded-full object-cover absolute inset-0"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          {/* Fallback initials in case image fails to load */}
          <span className={`${sizeClasses} flex items-center justify-center`}>
            {initials}
          </span>
        </>
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

export default ProfileAvatar;