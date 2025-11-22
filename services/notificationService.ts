import { supabase } from '../supabase/client';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  relatedEntityId?: string;
  relatedEntityType?: 'trade' | 'course' | 'quiz' | 'module';
}

export const notificationService = {
  // Create a new notification
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          profile_id: notification.userId, // Changed from user_id to profile_id
          title: notification.title,
          message: notification.message,
          type: notification.type,
          read: notification.read,
          related_entity_id: notification.relatedEntityId,
          related_entity_type: notification.relatedEntityType
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.profile_id, // Changed from user_id to profile_id
        title: data.title,
        message: data.message,
        type: data.type,
        read: data.read,
        createdAt: data.created_at,
        relatedEntityId: data.related_entity_id,
        relatedEntityType: data.related_entity_type
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  },

  // Get unread notifications for a user
  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('profile_id', userId) // Changed from user_id to profile_id
        .eq('read', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(notification => ({
        id: notification.id,
        userId: notification.profile_id, // Changed from user_id to profile_id
        title: notification.title,
        message: notification.message,
        type: notification.type,
        read: notification.read,
        createdAt: notification.created_at,
        relatedEntityId: notification.related_entity_id,
        relatedEntityType: notification.related_entity_type
      }));
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      return [];
    }
  },

  // Get all notifications for a user
  async getAllNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('profile_id', userId) // Changed from user_id to profile_id
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(notification => ({
        id: notification.id,
        userId: notification.profile_id, // Changed from user_id to profile_id
        title: notification.title,
        message: notification.message,
        type: notification.type,
        read: notification.read,
        createdAt: notification.created_at,
        relatedEntityId: notification.related_entity_id,
        relatedEntityType: notification.related_entity_type
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  // Mark a notification as read
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('profile_id', userId) // Changed from user_id to profile_id
        .eq('read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  },

  // Delete a notification
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  },

  // Create a trade review notification for admin
  async createTradeReviewNotification(tradeId: string, studentName: string, adminId: string): Promise<Notification | null> {
    return this.createNotification({
      userId: adminId,
      title: 'New Trade for Review',
      message: `${studentName} has submitted a new trade for your review.`,
      type: 'info',
      read: false,
      relatedEntityId: tradeId,
      relatedEntityType: 'trade'
    });
  },

  // Create a trade feedback notification for student
  async createTradeFeedbackNotification(tradeId: string, studentId: string, adminName: string, feedback: string): Promise<Notification | null> {
    return this.createNotification({
      userId: studentId,
      title: 'Trade Review Feedback',
      message: `${adminName} has reviewed your trade and provided feedback: ${feedback}`,
      type: 'info',
      read: false,
      relatedEntityId: tradeId,
      relatedEntityType: 'trade'
    });
  },

  // Create a mentor assignment notification
  async createMentorAssignmentNotification(studentId: string, mentorName: string): Promise<Notification | null> {
    return this.createNotification({
      userId: studentId,
      title: 'Mentor Assigned',
      message: `You have been assigned to ${mentorName} as your mentor.`,
      type: 'success',
      read: false
    });
  },

  // Subscribe to real-time notifications
  subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `profile_id=eq.${userId}` // Changed from user_id to profile_id
        },
        callback
      )
      .subscribe();

    return channel;
  }
};