import { BorrowRecord } from "./types";

export async function getAllRecordsFromAPI(): Promise<BorrowRecord[]> {
  const response = await fetch("/api/records");
  if (!response.ok) throw new Error("Failed to fetch records");
  const data = await response.json();

  // Convert date strings back to Date objects
  return data.map((record: any) => ({
    ...record,
    date: new Date(record.date),
    returnDate: record.returnDate ? new Date(record.returnDate) : undefined,
    lastReturnDate: record.lastReturnDate
      ? new Date(record.lastReturnDate)
      : undefined,
    returnHistory: record.returnHistory.map((entry: any) => ({
      ...entry,
      date: new Date(entry.date),
    })),
  }));
}

export async function getRecordByIdFromAPI(
  id: string
): Promise<BorrowRecord | null> {
  const response = await fetch(`/api/records/${id}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Failed to fetch record");

  const record = await response.json();

  // Convert date strings
  return {
    ...record,
    date: new Date(record.date),
    returnDate: record.returnDate ? new Date(record.returnDate) : undefined,
    lastReturnDate: record.lastReturnDate
      ? new Date(record.lastReturnDate)
      : undefined,
    returnHistory: record.returnHistory.map((entry: any) => ({
      ...entry,
      date: new Date(entry.date),
    })),
  };
}

export async function saveRecordToAPI(
  record: Omit<BorrowRecord, "id">
): Promise<BorrowRecord> {
  const response = await fetch("/api/records", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(record),
  });

  if (!response.ok) throw new Error("Failed to create record");

  const data = await response.json();

  return {
    ...data,
    date: new Date(data.date),
    returnDate: data.returnDate ? new Date(data.returnDate) : undefined,
    lastReturnDate: data.lastReturnDate
      ? new Date(data.lastReturnDate)
      : undefined,
    returnHistory: data.returnHistory.map((entry: any) => ({
      ...entry,
      date: new Date(entry.date),
    })),
  };
}

export async function updateRecordInAPI(
  id: string,
  updates: Partial<BorrowRecord> & { newReturnHistoryEntry?: any }
): Promise<void> {
  const response = await fetch(`/api/records/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) throw new Error("Failed to update record");
}

export async function deleteRecordFromAPI(id: string): Promise<void> {
  const response = await fetch(`/api/records/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Failed to delete record");
}
