import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all records
export async function GET() {
  try {
    const records = await prisma.borrowRecord.findMany({
      include: {
        returnHistory: {
          orderBy: {
            date: "asc",
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching records:", error);
    return NextResponse.json(
      { error: "Failed to fetch records" },
      { status: 500 }
    );
  }
}

// POST create new record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const record = await prisma.borrowRecord.create({
      data: {
        organizationType: body.organizationType,
        district: body.district,
        startNumber: body.startNumber,
        endNumber: body.endNumber,
        missingNumbers: body.missingNumbers || "",
        duplicateNumbers: body.duplicateNumbers || "",
        calculatedBooks: body.calculatedBooks,
        totalBooks: body.totalBooks,
        status: body.status,
        returnedBooks: body.returnedBooks || [],
        borrowImages: body.borrowImages || [],
      },
      include: {
        returnHistory: true,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Error creating record:", error);
    return NextResponse.json(
      { error: "Failed to create record" },
      { status: 500 }
    );
  }
}
