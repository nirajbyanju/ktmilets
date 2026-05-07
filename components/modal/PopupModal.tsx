import React, { useEffect, useRef } from 'react';

type PopupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
  onReset?: () => void;
  onCreateAndContinue?: () => void;
  showSaveButton?: boolean;
  showEditButton?: boolean;
  title?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'esm' | 'emd' | 'elg' | 'exlg' | 'full';
  isLoading?: boolean;
};

const PopupModal: React.FC<PopupModalProps> = ({
  isOpen,
  onClose,
  title = 'Modal Title',
  children,
  size = 'md',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);



  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    esm: 'max-w-3xl',
    emd: 'max-w-4xl',
    elg: 'max-w-5xl',
    exlg: 'max-w-7xl',
    full: 'max-w-full'
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div
        ref={modalRef}
        className={`bg-white w-full ${sizeClasses[size]} px-5 py-3 rounded-lg   overflow-y-auto custom-scrollbar`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-1">
          <h4 className="text-xl font-semibold text-opsh-secondary">{title}</h4>
          <button
            onClick={onClose}
            className="bg-opsh-danger font-medium text-white text-sm py-1 px-3 rounded-md border-2 border-white hover:bg-white hover:text-opsh-danger hover:border-opsh-danger"
            aria-label="Close modal"
          >
            Close (x)
          </button>
        </div>

        {/* Body */}
        <div className="">{children}</div>
      </div>
    </div>
  );
};

export default PopupModal;