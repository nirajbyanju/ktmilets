// components/Loader/ShimmerLoader.tsx
import { CSSProperties, FC } from 'react';

interface ShimmerLoaderProps {
  width?: string;
  height?: string;
  rounded?: string;
  className?: string;
  shimmerWidth?: string;
  shimmerColor?: string;
}

const ShimmerLoader: FC<ShimmerLoaderProps> = ({
  width = '100%',
  height = '100px',
  rounded = '0.5rem',
  className = '',
  shimmerWidth = '50%',
  shimmerColor = 'rgba(255, 255, 255, 0.2)',
}) => {
  const containerStyle: CSSProperties = {
    width,
    height,
    borderRadius: rounded,
    backgroundColor: '#f3f4f6',
    position: 'relative',
    overflow: 'hidden',
  };

  const shimmerStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: shimmerWidth,
    height: '100%',
    background: `linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      ${shimmerColor} 50%,
      rgba(255, 255, 255, 0) 100%
    )`,
    animation: 'shimmer 2s infinite',
  };

  return (
    <div 
      style={containerStyle} 
      className={`shimmer-wrapper ${className}`}
    >
      <div style={shimmerStyle} />
    </div>
  );
};

export default ShimmerLoader;