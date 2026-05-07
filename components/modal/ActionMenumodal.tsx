import { ReactNode, useRef, useEffect } from "react";

interface ActionMenumodalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const ActionMenumodal = ({ isOpen, onClose, children }: ActionMenumodalProps) => {
  const modalRef = useRef<HTMLDivElement>(null); // Reference to the modal container

  useEffect(() => {
    // Close the modal if a click happens outside of it
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Attach the event listener when the modal is open
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup the event listener when the modal is closed or component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-6 right-5 z-50 bg-white border rounded-lg shadow-lg w-40">
      {/* Modal */}
      <div
        ref={modalRef} // Attach the ref to the modal
        className="relative p-4"
      >
        {children}
      </div>
    </div>
  );
};

export default ActionMenumodal;
