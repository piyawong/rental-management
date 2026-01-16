import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateBorrowedBooks(
  startNumber: number,
  endNumber: number,
  missingNumbers: string,
  duplicateNumbers: string
): { books: string[]; total: number } {
  // Parse missing numbers
  const missing = missingNumbers
    .split(",")
    .map((n) => n.trim())
    .filter((n) => n !== "");

  // Parse duplicate numbers
  const duplicates = duplicateNumbers
    .split(",")
    .map((n) => n.trim())
    .filter((n) => n !== "");

  // Generate all numbers from start to end
  const allBooks: string[] = [];
  for (let i = startNumber; i <= endNumber; i++) {
    const strNum = i.toString();
    // Skip if it's in missing list
    if (!missing.includes(strNum)) {
      allBooks.push(strNum);
    }
  }

  // Add duplicate numbers
  allBooks.push(...duplicates);

  // Sort books naturally (handle decimal numbers like 12.1)
  allBooks.sort((a, b) => {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    return numA - numB;
  });

  return {
    books: allBooks,
    total: allBooks.length,
  };
}

export function formatDate(date: Date | undefined): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return "-";
  }
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatShortDate(date: Date | undefined): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return "-";
  }
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
