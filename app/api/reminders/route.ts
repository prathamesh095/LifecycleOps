import { z } from "zod";
import { prisma } from "@/lib/db";
import { createReminderValidator } from "@/lib/validators";
import { NextRequest, NextResponse } from "next/server";

// GET /api/reminders - List all reminders
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
    const completed = searchParams.get("completed");

    const reminders = await prisma.reminder.findMany({
      where: {
        userId,
        ...(applicationId && { applicationId }),
        ...(completed !== null && { completed: completed === "true" }),
      },
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { dueDate: "asc" },
    });

    const hasMore = reminders.length > limit;
    const items = reminders.slice(0, limit);

    return NextResponse.json({
      items,
      nextCursor: hasMore ? items[items.length - 1]?.id : null,
      hasMore,
    });
  } catch (error) {
    console.error("[v0] Error fetching reminders:", error);
    return NextResponse.json(
      { error: "Failed to fetch reminders" },
      { status: 500 }
    );
  }
}

// POST /api/reminders - Create new reminder
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
    const validatedData = createReminderValidator.parse(body);

    const reminder = await prisma.reminder.create({
      data: {
        ...validatedData,
        userId,
        dueDate: new Date(validatedData.dueDate),
      },
    });

    return NextResponse.json(reminder, { status: 201 });
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
    console.error("[v0] Error creating reminder:", error);
    return NextResponse.json(
      { error: "Failed to create reminder" },
      { status: 500 }
    );
  }
}
