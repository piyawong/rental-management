import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH - Add images to borrow record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { borrowImages, returnHistoryId, returnImages } = body;

    // Update borrow images
    if (borrowImages) {
      const record = await prisma.borrowRecord.findUnique({
        where: { id },
      });

      if (!record) {
        return NextResponse.json(
          { error: "Record not found" },
          { status: 404 }
        );
      }

      const updatedBorrowImages = [
        ...(record.borrowImages || []),
        ...borrowImages,
      ];

      await prisma.borrowRecord.update({
        where: { id },
        data: {
          borrowImages: updatedBorrowImages,
        },
      });

      return NextResponse.json({
        success: true,
        borrowImages: updatedBorrowImages,
      });
    }

    // Update return history images
    if (returnHistoryId && returnImages) {
      const returnHistory = await prisma.returnHistory.findUnique({
        where: { id: returnHistoryId },
      });

      if (!returnHistory) {
        return NextResponse.json(
          { error: "Return history not found" },
          { status: 404 }
        );
      }

      const updatedReturnImages = [
        ...(returnHistory.returnImages || []),
        ...returnImages,
      ];

      await prisma.returnHistory.update({
        where: { id: returnHistoryId },
        data: {
          returnImages: updatedReturnImages,
        },
      });

      return NextResponse.json({
        success: true,
        returnImages: updatedReturnImages,
      });
    }

    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating images:", error);
    return NextResponse.json(
      { error: "Failed to update images" },
      { status: 500 }
    );
  }
}
