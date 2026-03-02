import { z } from "zod";
import { prisma } from "@/lib/db";
import { createApplicationValidator } from "@/lib/validators";
import { NextRequest, NextResponse } from "next/server";

// GET /api/applications - List all applications
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
    const status = searchParams.get("status") || undefined;

    const applications = await prisma.application.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: "desc" },
    });

    const hasMore = applications.length > limit;
    const items = applications.slice(0, limit);

    return NextResponse.json({
      items,
      nextCursor: hasMore ? items[items.length - 1]?.id : null,
      hasMore,
    });
  } catch (error) {
    console.error("[v0] Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

// POST /api/applications - Create new application
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
    const validatedData = createApplicationValidator.parse(body);

    const application = await prisma.application.create({
      data: {
        ...validatedData,
        userId,
        appliedDate: validatedData.appliedDate
          ? new Date(validatedData.appliedDate)
          : null,
      },
    });

    return NextResponse.json(application, { status: 201 });
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
    console.error("[v0] Error creating application:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}
