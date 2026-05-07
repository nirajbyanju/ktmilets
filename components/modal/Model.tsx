import { FC } from 'react';

interface ModalProps {
  closeModal: () => void;
}

const Modal: FC<ModalProps> = ({ closeModal }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg w-2/3 p-5">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Add Experience Data</h2>
          <button onClick={closeModal} className="text-red-500 text-sm font-medium">
            Close (X)
          </button>
        </div>
        <form className="mt-4">
          <div className="mb-4">
            <label className="block text-gray-700">Attachment Document</label>
            <div className="flex">
              <input 
                type="text" 
                placeholder="Enter URL here."
                className="border rounded-l-lg px-4 py-2 w-full"
              />
              <button 
                type="button"
                className="bg-blue-500 text-white rounded-r-lg px-4 py-2"
              >
                Upload
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700">Organization Name</label>
              <input 
                type="text" 
                placeholder="Placeholder"
                className="border rounded-lg px-4 py-2 w-full"
              />
            </div>
            <div>
              <label className="block text-gray-700">Position</label>
              <input 
                type="text" 
                placeholder="Placeholder"
                className="border rounded-lg px-4 py-2 w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700">Start Date</label>
              <input 
                type="date" 
                className="border rounded-lg px-4 py-2 w-full"
              />
            </div>
            <div>
              <label className="block text-gray-700">End Date</label>
              <input 
                type="date" 
                className="border rounded-lg px-4 py-2 w-full"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Description</label>
            <textarea 
              placeholder="Placeholder"
              className="border rounded-lg px-4 py-2 w-full h-32"
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button 
              type="button" 
              onClick={closeModal}
              className="bg-gray-500 text-white rounded-lg px-4 py-2 mr-2"
            >
              Cancel & Close
            </button>
            <button 
              type="submit"
              className="bg-green-500 text-white rounded-lg px-4 py-2"
            >
              Add Education
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;
