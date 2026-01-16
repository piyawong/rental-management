export type OrganizationType = "มูลนิธิ" | "สมาคม";

export interface ReturnHistoryEntry {
  date: Date;
  booksReturned: string[]; // books returned in this round
  count: number;
}

export interface BorrowRecord {
  id: string;
  date: Date;
  organizationType: OrganizationType;
  district: string;
  startNumber: number;
  endNumber: number;
  missingNumbers: string; // comma separated: "2,3,9"
  duplicateNumbers: string; // comma separated: "12.1,12.3"
  calculatedBooks: string[]; // ["1", "4", "5", ...]
  totalBooks: number;
  status: "borrowed" | "partially_returned" | "returned";
  returnDate?: Date;
  lastReturnDate?: Date;
  returnedBooks: string[]; // all books that were returned
  returnHistory: ReturnHistoryEntry[]; // history of each return round
}

export interface BorrowFormData {
  organizationType: OrganizationType;
  district: string;
  startNumber: string;
  endNumber: string;
  missingNumbers: string;
  duplicateNumbers: string;
}
