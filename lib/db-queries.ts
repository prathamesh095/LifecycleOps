/**
 * Optimized database query patterns
 * Prevents N+1 queries through eager loading
 * Uses indexes efficiently with pagination
 */

import { prisma } from './db';

/**
 * Get user's applications with related data (applications list view)
 * Avoids N+1 by including counts and recent data
 */
export async function getUserApplicationsOptimized(
  userId: string,
  { cursor, limit = 20, status }: { cursor?: string; limit?: number; status?: string }
) {
  const take = Math.min(limit, 100);

  const applications = await prisma.application.findMany({
    where: {
      userId,
      ...(status && { status }),
    },
    include: {
      // Get counts without fetching all relations
      _count: {
        select: {
          activities: true,
          contacts: true,
          reminders: { where: { completed: false } }, // Only count incomplete
        },
      },
    },
    take: take + 1, // Get one extra to detect if there are more
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: 'desc' },
  });

  const hasMore = applications.length > take;
  const items = applications.slice(0, take);

  return {
    items,
    nextCursor: hasMore ? items[items.length - 1]?.id : null,
    hasMore,
  };
}

/**
 * Get application with all related data (detail view)
 * Uses aggressive eager loading for performance
 */
export async function getApplicationDetailOptimized(applicationId: string, userId: string) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 50, // Limit to prevent huge payloads
      },
      contacts: {
        orderBy: { createdAt: 'desc' },
      },
      reminders: {
        where: { completed: false },
        orderBy: { dueDate: 'asc' },
      },
      _count: {
        select: {
          activities: true,
          contacts: true,
          reminders: true,
        },
      },
    },
  });

  if (!application || application.userId !== userId) {
    return null;
  }

  return application;
}

/**
 * Get user's dashboard stats efficiently
 * Uses single query with aggregations
 */
export async function getUserDashboardStats(userId: string) {
  const [applications, activities, contacts, reminders, user] = await Promise.all([
    prisma.application.count({ where: { userId } }),
    prisma.activity.count({ where: { userId } }),
    prisma.contact.count({ where: { userId } }),
    prisma.reminder.count({ where: { userId, completed: false } }),
    prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true } }),
  ]);

  return {
    user,
    stats: {
      totalApplications: applications,
      totalActivities: activities,
      totalContacts: contacts,
      pendingReminders: reminders,
    },
  };
}

/**
 * Get recently updated applications (activity feed)
 */
export async function getRecentActivityFeed(userId: string, limit = 20) {
  const activities = await prisma.activity.findMany({
    where: { userId },
    include: {
      application: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return activities;
}

/**
 * Search applications efficiently using indexed columns
 */
export async function searchApplications(
  userId: string,
  { query, status, cursor, limit = 20 }: { query?: string; status?: string; cursor?: string; limit?: number }
) {
  const take = Math.min(limit, 100);

  const where: any = { userId };

  if (status) {
    where.status = status;
  }

  if (query) {
    // Simple substring search - for production use full-text search
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ];
  }

  const applications = await prisma.application.findMany({
    where,
    take: take + 1,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      createdAt: true,
      appliedDate: true,
      _count: {
        select: { activities: true },
      },
    },
  });

  const hasMore = applications.length > take;
  const items = applications.slice(0, take);

  return {
    items,
    nextCursor: hasMore ? items[items.length - 1]?.id : null,
    hasMore,
  };
}

/**
 * Get upcoming reminders for all user's applications
 */
export async function getUpcomingReminders(userId: string, daysAhead = 7) {
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  const reminders = await prisma.reminder.findMany({
    where: {
      userId,
      completed: false,
      dueDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      application: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { dueDate: 'asc' },
  });

  return reminders;
}

/**
 * Batch operations for bulk imports
 * More efficient than individual creates
 */
export async function createApplicationsBatch(
  userId: string,
  applications: Array<{
    name: string;
    description?: string;
    status?: string;
    category?: string;
    appliedDate?: Date;
  }>
) {
  // Prisma doesn't have native batch insert, use createMany
  const result = await prisma.application.createMany({
    data: applications.map(app => ({
      ...app,
      userId,
      status: app.status || 'active',
    })),
    skipDuplicates: true,
  });

  return result;
}
