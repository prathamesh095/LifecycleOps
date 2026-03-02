import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
  try {
    const userId = 1; // Mock user ID

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM activities WHERE user_id = ? ORDER BY activity_at DESC',
      [userId]
    );

    const activities = rows.map((row: any) => ({
      ...row,
      id: row.public_id,
      internal_id: row.id,
      metadata_json: row.metadata_json ? JSON.stringify(row.metadata_json) : null, // Wait, mysql2 returns JSON as object if column type is JSON?
      // Actually, mysql2 returns JSON columns as objects automatically.
      // But the frontend expects stringified JSON? No, frontend expects object?
      // Let's check `lib/schemas.ts`. `metadata_json?: string;`
      // So frontend expects string.
      // If mysql2 returns object, we should stringify it.
    }));

    return NextResponse.json(activities);
  } catch (error: any) {
    console.error('Failed to fetch activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}
