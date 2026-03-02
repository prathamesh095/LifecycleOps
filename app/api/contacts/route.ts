import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
  try {
    const userId = 1; // Mock user ID

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM contacts WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    const contacts = rows.map((row: any) => ({
      ...row,
      id: row.public_id,
      internal_id: row.id,
    }));

    return NextResponse.json(contacts);
  } catch (error: any) {
    console.error('Failed to fetch contacts:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}
