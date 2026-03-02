import { z } from "zod";
import { prisma } from "@/lib/db";
import { createActivityValidator } from "@/lib/validators";
import { NextRequest, NextResponse } from "next/server";

// GET /api/activities - List all activities
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

    const activities = await prisma.activity.findMany({
      where: {
        userId,
        ...(applicationId && { applicationId }),
      },
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { date: "desc" },
    });

    const hasMore = activities.length > limit;
    const items = activities.slice(0, limit);

    return NextResponse.json({
      items,
      nextCursor: hasMore ? items[items.length - 1]?.id : null,
      hasMore,
    });
  } catch (error) {
    console.error("[v0] Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}

// POST /api/activities - Create new activity
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
    const validatedData = createActivityValidator.parse(body);

    const activity = await prisma.activity.create({
      data: {
        ...validatedData,
        userId,
        date: validatedData.date ? new Date(validatedData.date) : null,
      },
    });

    return NextResponse.json(activity, { status: 201 });
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
    console.error("[v0] Error creating activity:", error);
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 }
    );
  }
}
