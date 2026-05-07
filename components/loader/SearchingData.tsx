import React from "react";

// Individual skeleton elements with different shapes and pulse option
const SkeletonElement: React.FC<{
  width?: string;
  height?: string;
  shape?: "rect" | "circle" | "pill";
  className?: string;
  pulse?: boolean;
}> = ({ width = "w-full", height = "h-4", shape = "rect", className = "", pulse = false }) => {
  const shapeClass = shape === "circle"
    ? "rounded-full"
    : shape === "pill"
      ? "rounded-full"
      : "rounded";

  const pulseClass = pulse ? "animate-pulse" : "";

  return (
    <div className={`${width} ${height} ${shapeClass} bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer ${pulseClass} ${className}`} />
  );
};

// Generate column widths based on column index
const getColumnWidth = (index: number, totalColumns: number): string => {
  const widths = [
    "w-36", // name column
    "w-48", // email column  
    "w-32", // role column
    "w-28", // department column
    "w-24", // location column
    "w-28", // status column
    "w-16", // score column
    "w-32", // actions column
  ];

  // Use predefined widths or calculate based on index
  if (index < widths.length) {
    return widths[index];
  }

  // For extra columns, use responsive widths
  const sizes = ["w-24", "w-32", "w-28", "w-36", "w-40"];
  return sizes[index % sizes.length];
};

// Get column shape based on index
const getColumnShape = (index: number, totalColumns: number): "rect" | "circle" | "pill" => {
  // Make some columns pills (like status badges)
  if (index === 4 || index === 5 || (index > 5 && index % 3 === 0)) {
    return "pill";
  }
  // Make first column sometimes have avatar circle
  if (index === 0) {
    return "rect";
  }
  return "rect";
};

// Get text alignment based on column index
const getTextAlign = (index: number): "left" | "center" | "right" => {
  // Right align numeric columns like score
  if (index === 6) {
    return "right";
  }
  // Center align status badges
  if (index === 5 || index === 4) {
    return "center";
  }
  return "left";
};

// Enhanced skeleton row with staggered animation and pulse effects
const SkeletonRow: React.FC<{
  index: number;
  enablePulse?: boolean;
  columnsCount: number;
}> = ({
  index,
  enablePulse = false,
  columnsCount
}) => {
    // Stagger delay based on row index (0ms to 300ms)
    const staggerDelay = `${index * 50}ms`;

    // Pulse intensity based on row index for variety
    const shouldPulse = enablePulse && index % 2 === 0;
    const pulseIntensity = shouldPulse ? "animate-pulse" : "";

    // Generate columns dynamically
    const renderColumns = () => {
      const columns = [];

      for (let i = 0; i < columnsCount; i++) {
        const width = getColumnWidth(i, columnsCount);
        const shape = getColumnShape(i, columnsCount);
        const textAlign = getTextAlign(i);
        const pulse = shouldPulse && i % 2 === 0;

        // Special handling for first column to include avatar simulation
        if (i === 0 && columnsCount > 0) {
          columns.push(
            <td key={`col-${i}`} className="px-3 py-3 whitespace-nowrap">
              <div className="flex items-center space-x-3">
                <SkeletonElement
                  width="w-9"
                  height="h-9"
                  shape="circle"
                  pulse={pulse}
                />
                <SkeletonElement
                  width={width}
                  height="h-6"
                  shape={shape}
                  pulse={pulse}
                />
              </div>
            </td>
          );
        } else {
          columns.push(
            <td
              key={`col-${i}`}
              className={`px-3 py-3 whitespace-nowrap ${textAlign === "center" ? "text-center" : textAlign === "right" ? "text-right" : "text-left"}`}
            >
              <SkeletonElement
                width={width}
                height="h-6"
                shape={shape}
                className={textAlign === "center" ? "mx-auto" : textAlign === "right" ? "ml-auto" : ""}
                pulse={pulse}
              />
            </td>
          );
        }
      }

      return columns;
    };

    return (
      <tr
        className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-300 ${pulseIntensity}`}
        style={{
          animation: `fadeSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${staggerDelay} forwards`,
          opacity: 0,
          transform: 'translateY(-10px)'
        }}
      >
        {renderColumns()}
      </tr>
    );
  };

// Enhanced loading spinner with pulse effects
const LoadingSpinner: React.FC<{ enablePulse?: boolean }> = ({ enablePulse = true }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="relative">
        {/* Outer ring with pulse */}
        <div className={`w-12 h-12 rounded-full border-4 border-gray-200 ${enablePulse ? 'animate-pulse' : ''}`} />
        {/* Inner spinning ring */}
        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
        {/* Pulsing ring effect */}
        <div className="absolute inset-0 rounded-full animate-pulse-ring opacity-0" />
      </div>
      <p className={`text-gray-500 text-sm ${enablePulse ? 'animate-pulse' : ''}`}>
        Loading data...
      </p>
    </div>
  );
};

// Generate header labels based on column count

// Get header alignment
const getHeaderAlign = (index: number): string => {
  if (index === 6) return "text-right";
  if (index === 5 || index === 4) return "text-center";
  return "text-left";
};

// Enhanced main component with progressive loading and pulse options
const SearchingData: React.FC<{
  rows?: number;
  columns?: number;
  showSpinner?: boolean;
  enablePulse?: boolean;
  showHeader?: boolean;
  pulseIntensity?: "light" | "medium" | "heavy";
  customLoadingComponent?: React.ReactNode;
  className?: string;
}> = ({
  rows = 10,
  columns = 4,
  showSpinner = false,
  enablePulse = true,
  showHeader = true,
  customLoadingComponent,
  className = "",
}) => {
    const [visibleRows, setVisibleRows] = React.useState(showSpinner ? 0 : rows);
    const [isLoading, setIsLoading] = React.useState(showSpinner);

    React.useEffect(() => {
      if (showSpinner) {
        // Simulate progressive loading
        const timer = setTimeout(() => {
          setVisibleRows(rows);
          setIsLoading(false);
        }, 800);
        return () => clearTimeout(timer);
      }
    }, [rows, showSpinner]);

    if (isLoading && visibleRows === 0) {
      if (customLoadingComponent) {
        return <>{customLoadingComponent}</>;
      }
      return <LoadingSpinner enablePulse={enablePulse} />;
    }



    return (
      <>
        {[...Array(visibleRows)].map((_, index) => (
          <SkeletonRow
            key={index}
            index={index}
            enablePulse={enablePulse}
            columnsCount={columns}
          />
        ))}
      </>
    );
  };

// Add enhanced keyframes to your global CSS or use styled-components
const styles = `
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@keyframes fadeSlideIn {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulseRing {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-shimmer {
  animation: shimmer 1.5s ease-in-out infinite;
}

.animate-pulse-ring {
  animation: pulseRing 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Enhanced pulse variations */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Hover effects */
.hover\\:bg-gray-50\\/50:hover {
  background-color: rgba(249, 250, 251, 0.5);
}

.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
`;

// Inject styles if not already present
if (typeof document !== 'undefined') {
  const styleId = 'skeleton-loading-styles';
  if (!document.getElementById(styleId)) {
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }
}

export default SearchingData;