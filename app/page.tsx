"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { BlurFade } from "@/components/ui/blur-fade";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { getAllRecords } from "@/lib/storage";
import { BorrowRecord } from "@/lib/types";
import { formatShortDate } from "@/lib/utils";

export default function Home() {
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    borrowed: 0,
    returned: 0,
    totalBooks: 0,
  });

  useEffect(() => {
    const allRecords = getAllRecords();
    setRecords(allRecords.slice(0, 5)); // Show only 5 recent records

    const borrowed = allRecords.filter(
      (r) => r.status === "borrowed" || r.status === "partially_returned"
    ).length;
    const returned = allRecords.filter((r) => r.status === "returned").length;

    // Count total books not yet returned
    const totalBooks = allRecords
      .filter((r) => r.status === "borrowed" || r.status === "partially_returned")
      .reduce((sum, r) => {
        const returnedBooks = r.returnedBooks || [];
        const notReturned = r.calculatedBooks.filter(
          (book) => !returnedBooks.includes(book)
        );
        return sum + notReturned.length;
      }, 0);

    setStats({
      total: allRecords.length,
      borrowed,
      returned,
      totalBooks,
    });
  }, []);

  return (
    <>
      <Header
        title="ระบบจัดการการยืม-คืน"
        subtitle="มูลนิธิ และ สมาคม"
      />

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <BlurFade delay={0.1}>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-blue-600">
                {stats.borrowed}
              </div>
              <div className="text-sm text-gray-600 mt-1">กำลังยืม</div>
              <div className="text-xs text-gray-400 mt-1">
                {stats.totalBooks} เล่ม
              </div>
            </div>
          </BlurFade>

          <BlurFade delay={0.15}>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-green-600">
                {stats.returned}
              </div>
              <div className="text-sm text-gray-600 mt-1">คืนแล้ว</div>
            </div>
          </BlurFade>

          <BlurFade delay={0.2} className="col-span-2">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 shadow-md text-white">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm opacity-90 mt-1">ทั้งหมด</div>
            </div>
          </BlurFade>
        </div>

        {/* Quick Action */}
        <BlurFade delay={0.3}>
          <Link href="/borrow" className="block w-full">
            <ShimmerButton
              className="w-full text-base"
              background="rgb(37, 99, 235)"
              shimmerColor="#ffffff"
            >
              <span className="text-xl mr-2">➕</span>
              เพิ่มการยืมใหม่
            </ShimmerButton>
          </Link>
        </BlurFade>

        {/* Recent Records */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              รายการล่าสุด
            </h2>
            <Link
              href="/history"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              ดูทั้งหมด →
            </Link>
          </div>

          {records.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-gray-500">ยังไม่มีรายการ</p>
              <p className="text-sm text-gray-400 mt-1">
                เริ่มต้นโดยเพิ่มการยืมใหม่
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {records.map((record) => (
                <Link
                  key={record.id}
                  href={`/detail/${record.id}`}
                  className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {record.organizationType}
                      </div>
                      <div className="text-sm text-gray-600">
                        {record.district}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      {record.totalBooks} เล่ม
                    </span>
                    <span className="text-gray-400">
                      {formatShortDate(record.date)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
