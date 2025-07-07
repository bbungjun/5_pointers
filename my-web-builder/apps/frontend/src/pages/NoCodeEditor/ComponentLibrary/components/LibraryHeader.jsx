import React from 'react';
import { XIcon } from 'lucide-react';

function LibraryHeader({ roomId, onToggle }) {
  return (
    <div className="flex items-center justify-end mb-4">
      <button
        onClick={onToggle}
        className="p-1 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-800"
        aria-label="Close component library"
      >
        <XIcon size={20} />
      </button>
    </div>
  );
}

export default LibraryHeader;
