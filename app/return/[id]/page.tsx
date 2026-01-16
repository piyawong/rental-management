"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { BlurFade } from "@/components/ui/blur-fade";
import { getRecordByIdFromAPI, updateRecordInAPI } from "@/lib/api";
import { BorrowRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function ReturnPage() {
  const params = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<BorrowRecord | null>(null);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [notReturnedBooks, setNotReturnedBooks] = useState<string[]>([]);

  useEffect(() => {
    async function loadRecord() {
      try {
        const id = params.id as string;
        const foundRecord = await getRecordByIdFromAPI(id);
        if (foundRecord) {
          setRecord(foundRecord);
          // Books that haven't been returned yet
          const returnedBooks = foundRecord.returnedBooks || [];
          const notReturned = foundRecord.calculatedBooks.filter(
            (book) => !returnedBooks.includes(book)
          );
          setNotReturnedBooks(notReturned);
          // Pre-select all not returned books
          setSelectedBooks(notReturned);
        }
      } catch (error) {
        console.error("Failed to load record:", error);
      }
    }

    loadRecord();
  }, [params.id]);

  const toggleBook = (book: string) => {
    setSelectedBooks((prev) =>
      prev.includes(book) ? prev.filter((b) => b !== book) : [...prev, book]
    );
  };

  const selectAll = () => {
    setSelectedBooks(notReturnedBooks);
  };

  const deselectAll = () => {
    setSelectedBooks([]);
  };

  const handleReturn = async () => {
    if (!record || selectedBooks.length === 0) return;

    const currentReturnedBooks = record.returnedBooks || [];
    const newReturnedBooks = [
      ...currentReturnedBooks,
      ...selectedBooks,
    ];

    const allReturned = newReturnedBooks.length === record.calculatedBooks.length;

    // Create new return history entry
    const newHistoryEntry = {
      date: new Date(),
      booksReturned: selectedBooks,
      count: selectedBooks.length,
    };

    try {
      await updateRecordInAPI(record.id, {
        returnedBooks: newReturnedBooks,
        newReturnHistoryEntry: newHistoryEntry,
        status: allReturned ? "returned" : "partially_returned",
        lastReturnDate: new Date(),
        returnDate: allReturned ? new Date() : record.returnDate,
      });

      router.push(`/detail/${record.id}`);
    } catch (error) {
      console.error("Failed to update record:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  if (!record) {
    return (
      <>
        <Header title="คืนเล่ม" />
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

  if (notReturnedBooks.length === 0) {
    return (
      <>
        <Header title="คืนเล่ม" />
        <main className="max-w-md mx-auto px-4 py-6">
          <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-gray-700 font-semibold mb-2">คืนครบแล้ว</p>
            <p className="text-sm text-gray-500">ไม่มีเล่มที่ต้องคืนแล้ว</p>
            <Link
              href={`/detail/${record.id}`}
              className="inline-block mt-4 text-blue-600 hover:text-blue-700"
            >
              ← กลับ
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header
        title="เลือกเล่มที่จะคืน"
        subtitle={`${record.organizationType} - ${record.district}`}
      />

      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* Summary */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 shadow-lg text-white">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm opacity-90">เลือกแล้ว</div>
              <div className="text-3xl font-bold">{selectedBooks.length}</div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">ยังไม่ได้คืน</div>
              <div className="text-3xl font-bold">{notReturnedBooks.length}</div>
            </div>
          </div>
        </div>

        {/* Select Actions */}
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg py-2 text-sm font-medium transition-colors"
          >
            เลือกทั้งหมด
          </button>
          <button
            onClick={deselectAll}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg py-2 text-sm font-medium transition-colors"
          >
            ยกเลิกทั้งหมด
          </button>
        </div>

        {/* Books Grid */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            เลือกเล่มที่จะคืน:
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {notReturnedBooks.map((book) => {
              const isSelected = selectedBooks.includes(book);
              return (
                <button
                  key={book}
                  onClick={() => toggleBook(book)}
                  className={cn(
                    "aspect-square rounded-lg font-semibold text-sm transition-all",
                    isSelected
                      ? "bg-green-600 text-white shadow-md scale-105"
                      : "bg-white text-gray-700 border-2 border-gray-200 hover:border-green-400"
                  )}
                >
                  {book}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          {selectedBooks.length > 0 ? (
            <ShimmerButton
              onClick={handleReturn}
              className="w-full text-base"
              background="rgb(22, 163, 74)"
              shimmerColor="#ffffff"
            >
              ✅ บันทึกการคืน ({selectedBooks.length} เล่ม)
            </ShimmerButton>
          ) : (
            <button
              disabled
              className="w-full rounded-xl py-4 font-semibold bg-gray-200 text-gray-400 cursor-not-allowed"
            >
              ✅ บันทึกการคืน (0 เล่ม)
            </button>
          )}

          <Link
            href={`/detail/${record.id}`}
            className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl py-3 text-center font-medium transition-colors"
          >
            ← ยกเลิก
          </Link>
        </div>
      </main>
    </>
  );
}
