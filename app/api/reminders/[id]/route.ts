import { z } from "zod";
import { prisma } from "@/lib/db";
import { updateReminderValidator } from "@/lib/validators";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/reminders/[id]
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const reminder = await prisma.reminder.findUnique({
      where: { id },
      include: {
        application: true,
      },
    });

    if (!reminder) {
      return NextResponse.json(
        { error: "Reminder not found" },
        { status: 404 }
      );
    }

    if (reminder.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json(reminder);
  } catch (error) {
    console.error("[v0] Error fetching reminder:", error);
    return NextResponse.json(
      { error: "Failed to fetch reminder" },
      { status: 500 }
    );
  }
}

// PATCH /api/reminders/[id]
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const validatedData = updateReminderValidator.parse(body);

    const existing = await prisma.reminder.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Reminder not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const reminder = await prisma.reminder.update({
      where: { id },
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate
          ? new Date(validatedData.dueDate)
          : undefined,
      },
    });

    return NextResponse.json(reminder);
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
    console.error("[v0] Error updating reminder:", error);
    return NextResponse.json(
      { error: "Failed to update reminder" },
      { status: 500 }
    );
  }
}

// DELETE /api/reminders/[id]
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existing = await prisma.reminder.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Reminder not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.reminder.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] Error deleting reminder:", error);
    return NextResponse.json(
      { error: "Failed to delete reminder" },
      { status: 500 }
    );
  }
}
