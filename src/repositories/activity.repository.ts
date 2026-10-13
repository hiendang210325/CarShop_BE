import { prisma } from '../database/prisma';
import { RecentActivity } from '../types/dashboard.types';

export class ActivityRepository {
  async findRecent(limit: number = 10): Promise<RecentActivity[]> {
    const activities = await prisma.recentActivity.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return activities.map((a) => ({
      id: a.id,
      type: a.type as RecentActivity['type'],
      title: a.title,
      description: a.description,
      user: a.user,
      timestamp: a.timestamp.toISOString(),
    }));
  }

  async logActivity(activity: RecentActivity): Promise<RecentActivity> {
    const created = await prisma.recentActivity.create({
      data: {
        id: activity.id,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        user: activity.user,
        timestamp: new Date(activity.timestamp),
      },
    });

    return {
      id: created.id,
      type: created.type as RecentActivity['type'],
      title: created.title,
      description: created.description,
      user: created.user,
      timestamp: created.timestamp.toISOString(),
    };
  }
}

export const activityRepository = new ActivityRepository();
