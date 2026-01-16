"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import SearchableSelect from "@/components/SearchableSelect";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { BlurFade } from "@/components/ui/blur-fade";
import { bangkokDistricts } from "@/lib/districts";
import { calculateBorrowedBooks } from "@/lib/utils";
import { saveRecordToAPI } from "@/lib/api";
import { BorrowFormData, OrganizationType } from "@/lib/types";

export default function BorrowPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<BorrowFormData>({
    organizationType: "มูลนิธิ",
    district: "",
    startNumber: "",
    endNumber: "",
    missingNumbers: "",
    duplicateNumbers: "",
  });

  const [preview, setPreview] = useState<{
    books: string[];
    total: number;
  } | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCalculate = () => {
    // Validate
    const newErrors: Record<string, string> = {};

    if (!formData.district) newErrors.district = "กรุณาเลือกเขต";
    if (!formData.startNumber) newErrors.startNumber = "กรุณากรอกลำดับเริ่ม";
    if (!formData.endNumber) newErrors.endNumber = "กรุณากรอกลำดับสุดท้าย";

    const start = parseInt(formData.startNumber);
    const end = parseInt(formData.endNumber);

    if (isNaN(start)) newErrors.startNumber = "กรุณากรอกตัวเลขเท่านั้น";
    if (isNaN(end)) newErrors.endNumber = "กรุณากรอกตัวเลขเท่านั้น";
    if (start > end) newErrors.endNumber = "ลำดับสุดท้ายต้องมากกว่าลำดับเริ่ม";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = calculateBorrowedBooks(
      start,
      end,
      formData.missingNumbers,
      formData.duplicateNumbers
    );
    setPreview(result);
  };

  const handleSubmit = async () => {
    if (!preview) {
      handleCalculate();
      return;
    }

    setUploading(true);

    try {
      // Upload images first
      let imagePaths: string[] = [];
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file) => {
          formData.append("files", file);
        });

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload images");
        }

        const uploadData = await uploadRes.json();
        imagePaths = uploadData.paths;
      }

      // Save record with image paths
      const start = parseInt(formData.startNumber);
      const end = parseInt(formData.endNumber);

      const record = {
        date: new Date(),
        organizationType: formData.organizationType,
        district: formData.district,
        startNumber: start,
        endNumber: end,
        missingNumbers: formData.missingNumbers,
        duplicateNumbers: formData.duplicateNumbers,
        calculatedBooks: preview.books,
        totalBooks: preview.total,
        status: "borrowed" as const,
        returnedBooks: [],
        returnHistory: [],
        borrowImages: imagePaths,
      };

      await saveRecordToAPI(record);
      router.push("/");
    } catch (error) {
      console.error("Failed to save record:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Header title="เพิ่มการยืมใหม่" subtitle="กรอกข้อมูลการยืมเอกสาร" />

      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* Organization Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ประเภท
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(["มูลนิธิ", "สมาคม"] as OrganizationType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, organizationType: type }))
                }
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  formData.organizationType === type
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* District */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            สำนักงานเขต
          </label>
          <SearchableSelect
            name="district"
            options={bangkokDistricts.map((d) => `เขต${d}`)}
            value={formData.district ? `เขต${formData.district}` : ""}
            onChange={(value) => {
              const district = value.replace("เขต", "");
              setFormData((prev) => ({ ...prev, district }));
              if (errors.district) {
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.district;
                  return newErrors;
                });
              }
            }}
            placeholder="พิมพ์เพื่อค้นหาเขต..."
            error={errors.district}
          />
        </div>

        {/* Start and End Numbers */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ลำดับเริ่ม
            </label>
            <input
              type="number"
              name="startNumber"
              value={formData.startNumber}
              onChange={handleChange}
              placeholder="เช่น 1"
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.startNumber ? "border-red-300" : "border-gray-200"
              } bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all`}
            />
            {errors.startNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.startNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ลำดับสุดท้าย
            </label>
            <input
              type="number"
              name="endNumber"
              value={formData.endNumber}
              onChange={handleChange}
              placeholder="เช่น 30"
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.endNumber ? "border-red-300" : "border-gray-200"
              } bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all`}
            />
            {errors.endNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.endNumber}</p>
            )}
          </div>
        </div>

        {/* Missing Numbers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            เลขที่ขาด{" "}
            <span className="text-gray-400 font-normal">(ถ้ามี)</span>
          </label>
          <input
            type="text"
            name="missingNumbers"
            value={formData.missingNumbers}
            onChange={handleChange}
            placeholder="เช่น 2,3,9"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
          />
          <p className="text-xs text-gray-500 mt-1">
            คั่นด้วยเครื่องหมาย , (Comma)
          </p>
        </div>

        {/* Duplicate Numbers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            เลขที่ซ้ำ{" "}
            <span className="text-gray-400 font-normal">(ถ้ามี)</span>
          </label>
          <input
            type="text"
            name="duplicateNumbers"
            value={formData.duplicateNumbers}
            onChange={handleChange}
            placeholder="เช่น 12.1,12.3"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
          />
          <p className="text-xs text-gray-500 mt-1">
            คั่นด้วยเครื่องหมาย , (Comma)
          </p>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            รูปภาพหลักฐาน{" "}
            <span className="text-gray-400 font-normal">(ถ้ามี)</span>
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="borrow-image-input"
          />
          <label
            htmlFor="borrow-image-input"
            className="flex items-center justify-center w-full px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 cursor-pointer transition-colors bg-gray-50 hover:bg-blue-50"
          >
            <span className="text-gray-600">📷 เลือกรูปภาพ</span>
          </label>

          {/* Image Preview */}
          {selectedFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2"
                >
                  <span className="text-sm text-gray-700 truncate flex-1">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="ml-2 text-red-500 hover:text-red-700 font-medium"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calculate Button */}
        <button
          type="button"
          onClick={handleCalculate}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl py-3 font-medium transition-colors"
        >
          🧮 คำนวณ
        </button>

        {/* Preview */}
        {preview && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-blue-900">
                จำนวนที่ยืม
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {preview.total} เล่ม
              </span>
            </div>
            <div className="text-sm text-blue-800">
              <div className="font-medium mb-1">เล่มที่:</div>
              <div className="bg-white rounded-lg p-3 max-h-32 overflow-y-auto text-xs text-blue-900">
                {preview.books.join(", ")}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {preview ? (
          <ShimmerButton
            onClick={handleSubmit}
            className="w-full text-base"
            background="rgb(37, 99, 235)"
            shimmerColor="#ffffff"
            disabled={uploading}
          >
            {uploading ? "⏳ กำลังอัพโหลด..." : "✅ บันทึกการยืม"}
          </ShimmerButton>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled
            className="w-full rounded-xl py-4 font-semibold bg-gray-200 text-gray-400 cursor-not-allowed"
          >
            ✅ บันทึกการยืม
          </button>
        )}
      </main>
    </>
  );
}
