-- AlterTable
ALTER TABLE "BorrowRecord" ADD COLUMN     "borrowImages" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "ReturnHistory" ADD COLUMN     "returnImages" TEXT[] DEFAULT ARRAY[]::TEXT[];
