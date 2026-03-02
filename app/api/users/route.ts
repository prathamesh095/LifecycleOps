import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { UserCreateSchema, ApiResponse, UserResponse } from '@/types';
import { Prisma } from '@prisma/client';

/**
 * GET /api/users
 * Lists users with pagination.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);

    return NextResponse.json({
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Creates a new user with input validation.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validate Input
    const validationResult = UserCreateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { email, name } = validationResult.data;

    // 2. Create User
    const user = await prisma.user.create({
      data: {
        email,
        name,
      },
    });

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    // 3. Handle Specific Errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002 is the error code for unique constraint violation
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        );
      }
    }

    console.error('Failed to create user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
