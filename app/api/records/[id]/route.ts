import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET single record by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const record = await prisma.borrowRecord.findUnique({
      where: { id },
      include: {
        returnHistory: {
          orderBy: {
            date: "asc",
          },
        },
      },
    });

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error("Error fetching record:", error);
    return NextResponse.json(
      { error: "Failed to fetch record" },
      { status: 500 }
    );
  }
}

// PATCH update record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Prepare update data
    const updateData: any = {};

    if (body.status !== undefined) updateData.status = body.status;
    if (body.returnDate !== undefined)
      updateData.returnDate = body.returnDate ? new Date(body.returnDate) : null;
    if (body.lastReturnDate !== undefined)
      updateData.lastReturnDate = body.lastReturnDate
        ? new Date(body.lastReturnDate)
        : null;
    if (body.returnedBooks !== undefined)
      updateData.returnedBooks = body.returnedBooks;

    // Handle return history
    if (body.newReturnHistoryEntry) {
      await prisma.returnHistory.create({
        data: {
          borrowRecordId: id,
          booksReturned: body.newReturnHistoryEntry.booksReturned,
          count: body.newReturnHistoryEntry.count,
          date: new Date(body.newReturnHistoryEntry.date),
        },
      });
    }

    const record = await prisma.borrowRecord.update({
      where: { id },
      data: updateData,
      include: {
        returnHistory: {
          orderBy: {
            date: "asc",
          },
        },
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error("Error updating record:", error);
    return NextResponse.json(
      { error: "Failed to update record" },
      { status: 500 }
    );
  }
}

// DELETE record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.borrowRecord.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting record:", error);
    return NextResponse.json(
      { error: "Failed to delete record" },
      { status: 500 }
    );
  }
}
