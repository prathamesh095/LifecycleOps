import { z } from "zod";
import { prisma } from "@/lib/db";
import { updateActivityValidator } from "@/lib/validators";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/activities/[id]
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

    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        application: true,
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    if (activity.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error("[v0] Error fetching activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}

// PATCH /api/activities/[id]
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
    const validatedData = updateActivityValidator.parse(body);

    const existing = await prisma.activity.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const activity = await prisma.activity.update({
      where: { id },
      data: {
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : undefined,
      },
    });

    return NextResponse.json(activity);
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
    console.error("[v0] Error updating activity:", error);
    return NextResponse.json(
      { error: "Failed to update activity" },
      { status: 500 }
    );
  }
}

// DELETE /api/activities/[id]
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

    const existing = await prisma.activity.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.activity.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] Error deleting activity:", error);
    return NextResponse.json(
      { error: "Failed to delete activity" },
      { status: 500 }
    );
  }
}
