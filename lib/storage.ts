import { BorrowRecord } from "./types";

const STORAGE_KEY = "borrow_records";

export function getAllRecords(): BorrowRecord[] {
  if (typeof window === "undefined") return [];

  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];

  const records = JSON.parse(data);
  // Convert date strings back to Date objects
  return records.map((record: BorrowRecord) => ({
    ...record,
    date: new Date(record.date),
    returnDate: record.returnDate ? new Date(record.returnDate) : undefined,
  }));
}

export function saveRecord(record: BorrowRecord): void {
  const records = getAllRecords();
  records.push(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function updateRecord(id: string, updates: Partial<BorrowRecord>): void {
  const records = getAllRecords();
  const index = records.findIndex((r) => r.id === id);
  if (index !== -1) {
    records[index] = { ...records[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }
}

export function getRecordById(id: string): BorrowRecord | undefined {
  const records = getAllRecords();
  return records.find((r) => r.id === id);
}

export function deleteRecord(id: string): void {
  const records = getAllRecords();
  const filtered = records.filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
