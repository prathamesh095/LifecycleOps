import { z } from "zod";
import { prisma } from "@/lib/db";
import { updateContactValidator } from "@/lib/validators";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/contacts/[id]
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

    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        application: true,
      },
    });

    if (!contact) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    if (contact.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json(contact);
  } catch (error) {
    console.error("[v0] Error fetching contact:", error);
    return NextResponse.json(
      { error: "Failed to fetch contact" },
      { status: 500 }
    );
  }
}

// PATCH /api/contacts/[id]
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
    const validatedData = updateContactValidator.parse(body);

    const existing = await prisma.contact.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const contact = await prisma.contact.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(contact);
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
    console.error("[v0] Error updating contact:", error);
    return NextResponse.json(
      { error: "Failed to update contact" },
      { status: 500 }
    );
  }
}

// DELETE /api/contacts/[id]
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

    const existing = await prisma.contact.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.contact.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] Error deleting contact:", error);
    return NextResponse.json(
      { error: "Failed to delete contact" },
      { status: 500 }
    );
  }
}
