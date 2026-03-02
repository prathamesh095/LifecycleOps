import { z } from "zod";
import { prisma } from "@/lib/db";
import { createApplicationValidator } from "@/lib/validators";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { rateLimitMiddleware } from "@/lib/middleware/rate-limit";
import { csrfMiddleware } from "@/lib/middleware/csrf";
import { getSecurityHeaders } from "@/lib/middleware/security-headers";

// GET /api/applications - List all applications
export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Rate limit check
    const rateLimitError = await rateLimitMiddleware(req, user.id, "api");
    if (rateLimitError) {
      return rateLimitError;
    }

    const userId = user.id;

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

    const response = NextResponse.json({
      items,
      nextCursor: hasMore ? items[items.length - 1]?.id : null,
      hasMore,
    });

    // Add security headers and cache control
    Object.entries(getSecurityHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    response.headers.set("Cache-Control", "private, max-age=60");

    return response;
  } catch (error) {
    console.error("[Auth] Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

// POST /api/applications - Create new application
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Rate limit check
    const rateLimitError = await rateLimitMiddleware(req, user.id, "api");
    if (rateLimitError) {
      return rateLimitError;
    }

    // CSRF protection
    const csrfError = await csrfMiddleware(req);
    if (csrfError) {
      return csrfError;
    }

    const userId = user.id;

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

    const response = NextResponse.json(application, { status: 201 });
    Object.entries(getSecurityHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed" },
        { status: 400 }
      );
    }
    console.error("[Auth] Error creating application:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}
