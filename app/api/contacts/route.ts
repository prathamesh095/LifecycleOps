import { z } from "zod";
import { prisma } from "@/lib/db";
import { createContactValidator } from "@/lib/validators";
import { NextRequest, NextResponse } from "next/server";

// GET /api/contacts - List all contacts
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor") || undefined;
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const applicationId = searchParams.get("applicationId") || undefined;

    const contacts = await prisma.contact.findMany({
      where: {
        userId,
        ...(applicationId && { applicationId }),
      },
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: "desc" },
    });

    const hasMore = contacts.length > limit;
    const items = contacts.slice(0, limit);

    return NextResponse.json({
      items,
      nextCursor: hasMore ? items[items.length - 1]?.id : null,
      hasMore,
    });
  } catch (error) {
    console.error("[v0] Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

// POST /api/contacts - Create new contact
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = createContactValidator.parse(body);

    const contact = await prisma.contact.create({
      data: {
        ...validatedData,
        userId,
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }
    console.error("[v0] Error creating contact:", error);
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    );
  }
}
