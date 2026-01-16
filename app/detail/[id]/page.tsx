"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { BlurFade } from "@/components/ui/blur-fade";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { getRecordByIdFromAPI, deleteRecordFromAPI } from "@/lib/api";
import { BorrowRecord } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function DetailPage() {
  const params = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<BorrowRecord | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function loadRecord() {
      try {
        const id = params.id as string;
        const foundRecord = await getRecordByIdFromAPI(id);
        if (foundRecord) {
          setRecord(foundRecord);
        }
      } catch (error) {
        console.error("Failed to load record:", error);
      }
    }

    loadRecord();
  }, [params.id]);

  const handleDelete = async () => {
    if (!record) return;
    try {
      await deleteRecordFromAPI(record.id);
      router.push("/");
    } catch (error) {
      console.error("Failed to delete record:", error);
      alert("เกิดข้อผิดพลาดในการลบ");
    }
  };

  if (!record) {
    return (
      <>
        <Header title="รายละเอียด" />
        <main className="max-w-md mx-auto px-4 py-6">
          <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
            <div className="text-4xl mb-3">❌</div>
            <p className="text-gray-500">ไม่พบข้อมูล</p>
            <Link
              href="/"
              className="inline-block mt-4 text-blue-600 hover:text-blue-700"
            >
              ← กลับหน้าแรก
            </Link>
          </div>
        </main>
      </>
    );
  }

  const returnedBooks = record.returnedBooks || [];
  const notReturnedBooks = record.calculatedBooks.filter(
    (book) => !returnedBooks.includes(book)
  );
  const isFullyReturned = record.status === "returned";
  const isPartiallyReturned = record.status === "partially_returned";
  const canReturn = record.status === "borrowed" || record.status === "partially_returned";

  return (
    <>
      <Header title="รายละเอียดการยืม" />

      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* Status Badge */}
        <div
          className={`text-center py-4 rounded-xl font-semibold ${
            isFullyReturned
              ? "bg-green-50 text-green-700"
              : isPartiallyReturned
              ? "bg-yellow-50 text-yellow-700"
              : "bg-blue-50 text-blue-700"
          }`}
        >
          {isFullyReturned && "✅ คืนครบแล้ว"}
          {isPartiallyReturned && "⚠️ คืนบางส่วน"}
          {record.status === "borrowed" && "🔵 กำลังยืม"}
        </div>

        {/* Main Info Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">ประเภท</div>
            <div className="text-lg font-semibold">{record.organizationType}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">สำนักงานเขต</div>
            <div className="text-lg font-semibold">{record.district}</div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t">
            <div>
              <div className="text-sm text-gray-500 mb-1">ลำดับเริ่ม</div>
              <div className="text-lg font-semibold text-blue-600">
                {record.startNumber}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">ลำดับสุดท้าย</div>
              <div className="text-lg font-semibold text-blue-600">
                {record.endNumber}
              </div>
            </div>
          </div>

          {record.missingNumbers && (
            <div>
              <div className="text-sm text-gray-500 mb-1">เลขที่ขาด</div>
              <div className="text-red-600 font-medium">
                {record.missingNumbers}
              </div>
            </div>
          )}

          {record.duplicateNumbers && (
            <div>
              <div className="text-sm text-gray-500 mb-1">เลขที่ซ้ำ</div>
              <div className="text-orange-600 font-medium">
                {record.duplicateNumbers}
              </div>
            </div>
          )}
        </div>

        {/* Books Status Summary */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 shadow-lg text-white">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-sm opacity-90">ยืมทั้งหมด</div>
              <div className="text-3xl font-bold">{record.totalBooks}</div>
              <div className="text-xs opacity-75 mt-1">เล่ม</div>
            </div>
            {!isFullyReturned && (
              <div className="text-right">
                <div className="text-sm opacity-90">ยังไม่ได้คืน</div>
                <div className="text-3xl font-bold">{notReturnedBooks.length}</div>
                <div className="text-xs opacity-75 mt-1">เล่ม</div>
              </div>
            )}
            {isPartiallyReturned && (
              <div className="text-right">
                <div className="text-sm opacity-90">คืนแล้ว</div>
                <div className="text-3xl font-bold">{returnedBooks.length}</div>
                <div className="text-xs opacity-75 mt-1">เล่ม</div>
              </div>
            )}
          </div>

          <div className="bg-white/20 rounded-lg p-3 backdrop-blur">
            <div className="text-sm font-medium mb-2">
              {isFullyReturned ? "รายการทั้งหมด:" : "ยังไม่ได้คืน:"}
            </div>
            <div className="bg-white/30 rounded p-2 max-h-32 overflow-y-auto text-xs leading-relaxed">
              {isFullyReturned
                ? record.calculatedBooks.join(", ")
                : notReturnedBooks.length > 0
                ? notReturnedBooks.join(", ")
                : "คืนครบแล้ว"}
            </div>
          </div>
        </div>

        {/* Return History Timeline */}
        {record.returnHistory && record.returnHistory.length > 0 && (
          <BlurFade delay={0.2}>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>📜</span>
                <span>ประวัติการคืน ({record.returnHistory.length} รอบ)</span>
              </h3>
              <div className="space-y-4">
                {record.returnHistory.map((entry, index) => (
                  <BlurFade key={index} delay={0.1 * index}>
                    <div className="relative pl-6 pb-4 border-l-2 border-green-200 last:border-l-0 last:pb-0">
                      <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
                      <div className="bg-green-50 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="text-xs font-semibold text-green-900">
                            รอบที่ {index + 1}
                          </div>
                          <div className="text-xs text-green-700 font-medium">
                            {entry.count} เล่ม
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">
                          {formatDate(entry.date)}
                        </div>
                        <div className="text-xs text-green-800 bg-white rounded p-2">
                          เล่ม: {entry.booksReturned.join(", ")}
                        </div>
                      </div>
                    </div>
                  </BlurFade>
                ))}
              </div>
            </div>
          </BlurFade>
        )}

        {/* Dates */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">วันที่ยืม:</span>
            <span className="font-medium">{formatDate(record.date)}</span>
          </div>
          {record.lastReturnDate && (
            <div className="flex justify-between text-orange-600">
              <span>คืนล่าสุด:</span>
              <span className="font-medium">{formatDate(record.lastReturnDate)}</span>
            </div>
          )}
          {record.returnDate && (
            <div className="flex justify-between text-green-600">
              <span>คืนครบเมื่อ:</span>
              <span className="font-medium">{formatDate(record.returnDate)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {canReturn && (
            <Link href={`/return/${record.id}`} className="block w-full">
              <ShimmerButton
                className="w-full"
                background="rgb(22, 163, 74)"
                shimmerColor="#ffffff"
              >
                <span className="text-base">✅ คืนเล่ม</span>
              </ShimmerButton>
            </Link>
          )}

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full bg-red-50 hover:bg-red-100 text-red-600 rounded-xl py-3 font-medium transition-colors"
          >
            🗑️ ลบรายการนี้
          </button>

          <Link
            href="/"
            className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl py-3 text-center font-medium transition-colors"
          >
            ← กลับหน้าแรก
          </Link>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="text-lg font-semibold mb-2">ยืนยันการลบ</h3>
              <p className="text-gray-600 text-sm">
                คุณแน่ใจหรือไม่ที่จะลบรายการนี้? การกระทำนี้ไม่สามารถย้อนกลับได้
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl py-3 font-medium transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl py-3 font-semibold transition-colors"
              >
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
