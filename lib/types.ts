export type OrganizationType = "มูลนิธิ" | "สมาคม";

export interface ReturnHistoryEntry {
  id?: string; // return history ID for updating
  date: Date;
  booksReturned: string[]; // books returned in this round
  count: number;
  returnImages?: string[]; // image paths for return evidence
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
  borrowImages?: string[]; // image paths for borrow evidence
}

export interface BorrowFormData {
  organizationType: OrganizationType;
  district: string;
  startNumber: string;
  endNumber: string;
  missingNumbers: string;
  duplicateNumbers: string;
}
