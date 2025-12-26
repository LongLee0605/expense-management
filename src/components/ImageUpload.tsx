import { useRef, useState } from 'react';
import { useToast } from '../contexts/ToastContext';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  preview?: string | null;
  disabled?: boolean;
}

const ImageUpload = ({ onImageSelect, preview, disabled }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const { showError } = useToast();

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
    } else {
      showError('Vui lòng chọn file ảnh hợp lệ');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        dragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />

      {preview ? (
        <div className="space-y-4">
          <img
            src={preview}
            alt="Bill preview"
            className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
          />
          <p className="text-sm text-gray-600">
            Click để chọn ảnh khác
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-6xl">📄</div>
          <div>
            <p className="text-lg font-medium text-gray-700">
              Kéo thả ảnh bill vào đây
            </p>
            <p className="text-sm text-gray-500 mt-2">
              hoặc click để chọn file
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Hỗ trợ: JPG, PNG, GIF
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

