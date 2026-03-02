import { z } from "zod";
import { prisma } from "@/lib/db";
import { updateApplicationValidator } from "@/lib/validators";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/applications/[id]
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

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        activities: true,
        contacts: true,
        reminders: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (application.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("[v0] Error fetching application:", error);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}

// PATCH /api/applications/[id]
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
    const validatedData = updateApplicationValidator.parse(body);

    const existing = await prisma.application.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const application = await prisma.application.update({
      where: { id },
      data: {
        ...validatedData,
        appliedDate: validatedData.appliedDate
          ? new Date(validatedData.appliedDate)
          : undefined,
      },
    });

    return NextResponse.json(application);
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
    console.error("[v0] Error updating application:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

// DELETE /api/applications/[id]
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

    const existing = await prisma.application.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.application.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] Error deleting application:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
