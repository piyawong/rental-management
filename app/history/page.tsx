"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { getAllRecords } from "@/lib/storage";
import { BorrowRecord } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function HistoryPage() {
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [filter, setFilter] = useState<"all" | "borrowed" | "returned">("all");

  useEffect(() => {
    const allRecords = getAllRecords();
    // Sort by date descending
    allRecords.sort((a, b) => b.date.getTime() - a.date.getTime());
    setRecords(allRecords);
  }, []);

  const filteredRecords = records.filter((record) => {
    if (filter === "all") return true;
    return record.status === filter;
  });

  return (
    <>
      <Header title="ประวัติการยืม-คืน" subtitle="รายการทั้งหมด" />

      <main className="max-w-md mx-auto px-4 py-6">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { key: "all", label: "ทั้งหมด" },
            { key: "borrowed", label: "กำลังยืม" },
            { key: "returned", label: "คืนแล้ว" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                filter === tab.key
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
              }`}
            >
              {tab.label}
              <span className="ml-1 text-xs">
                (
                {
                  records.filter((r) =>
                    tab.key === "all" ? true : r.status === tab.key
                  ).length
                }
                )
              </span>
            </button>
          ))}
        </div>

        {/* Records List */}
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100 mt-8">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-gray-500">ไม่มีรายการ</p>
            <p className="text-sm text-gray-400 mt-1">
              {filter === "all"
                ? "เริ่มต้นโดยเพิ่มการยืมใหม่"
                : `ไม่มีรายการ${
                    filter === "borrowed" ? "ที่กำลังยืม" : "ที่คืนแล้ว"
                  }`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map((record) => (
              <Link
                key={record.id}
                href={`/detail/${record.id}`}
                className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        {record.organizationType}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          record.status === "borrowed"
                            ? "bg-blue-100 text-blue-700"
                            : record.status === "partially_returned"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {record.status === "borrowed"
                          ? "กำลังยืม"
                          : record.status === "partially_returned"
                          ? "คืนบางส่วน"
                          : "คืนแล้ว"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {record.district}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {record.totalBooks}
                    </div>
                    <div className="text-xs text-gray-500">เล่ม</div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-100">
                  <span>
                    ยืม: {record.startNumber}-{record.endNumber}
                  </span>
                  <span>{formatDate(record.date)}</span>
                </div>

                {record.status === "returned" && record.returnDate && (
                  <div className="text-xs text-green-600 mt-1">
                    คืนเมื่อ: {formatDate(record.returnDate)}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
