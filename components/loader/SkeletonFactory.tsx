// components/Loader/SkeletonFactory.tsx
import React from 'react';

type SkeletonType = 'text' | 'image' | 'button' | 'avatar' | 'card' | 'circle' | 'input';

interface SkeletonProps {
  type: SkeletonType;
  width?: string;
  height?: string;
  rounded?: string;
  className?: string;
  count?: number;
  gap?: string;
  direction?: 'row' | 'column';
}

const SkeletonFactory: React.FC<SkeletonProps> = ({
  type,
  width = '100%',
  height = '1rem',
  rounded = '0.25rem',
  className = '',
  count = 1,
  gap = '0.5rem',
  direction = 'column',
}) => {
  const baseClasses = 'animate-pulse bg-gray-300';
  
  const typeClasses: Record<SkeletonType, string> = {
    text: `h-4 ${baseClasses}`,
    image: `${baseClasses}`,
    button: `h-10 ${baseClasses}`,
    avatar: `rounded-full ${baseClasses}`,
    card: `rounded-lg ${baseClasses}`,
    circle: `rounded-full ${baseClasses}`,
    input: `h-10 ${baseClasses} rounded-md`,
  };

  const skeletons = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={`${typeClasses[type]} ${className}`}
      style={{
        width,
        height,
        borderRadius: rounded,
      }}
    />
  ));

  if (count === 1) {
    return <>{skeletons}</>;
  }

  return (
    <div 
      className={`flex ${direction === 'column' ? 'flex-col' : 'flex-row'} flex-wrap`}
      style={{ gap }}
    >
      {skeletons}
    </div>
  );
};

// Skeleton Builder Component
interface SkeletonBuilderProps {
  layout: Array<{
    type: SkeletonType;
    width?: string;
    height?: string;
    className?: string;
  }>;
  gap?: string;
}

export const SkeletonBuilder: React.FC<SkeletonBuilderProps> = ({ layout, gap = '0.5rem' }) => {
  return (
    <div className="space-y-3" style={{ gap }}>
      {layout.map((item, index) => (
        <SkeletonFactory
          key={index}
          type={item.type}
          width={item.width}
          height={item.height}
          className={item.className}
        />
      ))}
    </div>
  );
};

export default SkeletonFactory;