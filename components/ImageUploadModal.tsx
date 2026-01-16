"use client";

import { useState } from "react";
import { ShimmerButton } from "@/components/ui/shimmer-button";

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => Promise<void>;
  title: string;
}

export default function ImageUploadModal({
  isOpen,
  onClose,
  onUpload,
  title,
}: ImageUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      await onUpload(selectedFiles);
      setSelectedFiles([]);
      onClose();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("เกิดข้อผิดพลาดในการอัพโหลด");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setSelectedFiles([]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-gray-600">เลือกรูปภาพที่ต้องการเพิ่ม</p>
        </div>

        {/* File Input */}
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="modal-image-input"
            disabled={uploading}
          />
          <label
            htmlFor="modal-image-input"
            className={`flex items-center justify-center w-full px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 cursor-pointer transition-colors bg-gray-50 hover:bg-blue-50 ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <span className="text-gray-600">📷 เลือกรูปภาพ</span>
          </label>
        </div>

        {/* Image Preview */}
        {selectedFiles.length > 0 && (
          <div className="mb-4 space-y-2 max-h-48 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
              >
                <span className="text-sm text-gray-700 truncate flex-1">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="ml-2 text-red-500 hover:text-red-700 font-medium"
                  disabled={uploading}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl py-3 font-medium transition-colors"
            disabled={uploading}
          >
            ยกเลิก
          </button>
          {selectedFiles.length > 0 && (
            <ShimmerButton
              onClick={handleSubmit}
              className="flex-1"
              background="rgb(37, 99, 235)"
              shimmerColor="#ffffff"
              disabled={uploading}
            >
              {uploading
                ? "⏳ กำลังอัพโหลด..."
                : `✅ เพิ่ม (${selectedFiles.length} รูป)`}
            </ShimmerButton>
          )}
        </div>
      </div>
    </div>
  );
}
