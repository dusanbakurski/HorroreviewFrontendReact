import { useRef, useState } from 'react';
import { uploadFile } from '../api';

interface Props {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label = 'Image' }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadFile(file);
      onChange(res.data.url);
    } catch {
      alert('Upload failed. Make sure the backend is running.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-sm text-zinc-400 mb-1">{label}</label>
      {value && (
        <img src={value} alt="" className="w-24 h-24 object-cover rounded mb-2 border border-zinc-700" />
      )}
      <div className="flex gap-2 items-center">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 text-sm rounded transition-colors disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : 'Upload Image'}
        </button>
        {value && (
          <span className="text-zinc-500 text-xs truncate max-w-48">{value}</span>
        )}
      </div>
    </div>
  );
}
