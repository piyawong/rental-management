-- CreateTable
CREATE TABLE "BorrowRecord" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationType" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "startNumber" INTEGER NOT NULL,
    "endNumber" INTEGER NOT NULL,
    "missingNumbers" TEXT NOT NULL DEFAULT '',
    "duplicateNumbers" TEXT NOT NULL DEFAULT '',
    "calculatedBooks" TEXT[],
    "totalBooks" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "returnDate" TIMESTAMP(3),
    "lastReturnDate" TIMESTAMP(3),
    "returnedBooks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BorrowRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnHistory" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "booksReturned" TEXT[],
    "count" INTEGER NOT NULL,
    "borrowRecordId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReturnHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BorrowRecord_status_idx" ON "BorrowRecord"("status");

-- CreateIndex
CREATE INDEX "BorrowRecord_date_idx" ON "BorrowRecord"("date");

-- CreateIndex
CREATE INDEX "ReturnHistory_borrowRecordId_idx" ON "ReturnHistory"("borrowRecordId");

-- AddForeignKey
ALTER TABLE "ReturnHistory" ADD CONSTRAINT "ReturnHistory_borrowRecordId_fkey" FOREIGN KEY ("borrowRecordId") REFERENCES "BorrowRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
