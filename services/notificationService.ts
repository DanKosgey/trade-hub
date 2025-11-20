import { supabase } from '../supabase/client';

export interface Notification {
  id: string;
  profileId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  courseId?: string;
  moduleId?: string;
  createdAt: Date;
}

export interface NotificationPreferences {
  profileId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  courseUpdates: boolean;
  moduleUpdates: boolean;
  quizReminders: boolean;
  progressReminders: boolean;
  updatedAt: Date;
}

export const notificationService = {
  // Get notifications for a user
  async getNotifications(profileId: string): Promise<Notification[]> {
    // Validate that profileId is a valid UUID
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId);
    if (!isValidUuid) {
      console.warn('Invalid profile ID provided to getNotifications:', profileId);
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(notification => ({
        id: notification.id,
        profileId: notification.profile_id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        read: notification.read,
        courseId: notification.course_id,
        moduleId: notification.module_id,
        createdAt: new Date(notification.created_at)
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  // Mark notification as read
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

  // Mark all notifications as read
  async markAllAsRead(profileId: string): Promise<boolean> {
    // Validate that profileId is a valid UUID
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId);
    if (!isValidUuid) {
      console.warn('Invalid profile ID provided to markAllAsRead:', profileId);
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('profile_id', profileId)
        .eq('read', false);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  },

  // Delete notification
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

  // Get unread notifications count
  async getUnreadCount(profileId: string): Promise<number> {
    // Validate that profileId is a valid UUID
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId);
    if (!isValidUuid) {
      console.warn('Invalid profile ID provided to getUnreadCount:', profileId);
      return 0;
    }
    
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('profile_id', profileId)
        .eq('read', false);
      
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error fetching unread notifications count:', error);
      return 0;
    }
  },

  // Get notification preferences
  async getPreferences(profileId: string): Promise<NotificationPreferences | null> {
    // Validate that profileId is a valid UUID
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId);
    if (!isValidUuid) {
      console.warn('Invalid profile ID provided to getPreferences:', profileId);
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('profile_id', profileId)
        .single();
      
      if (error) throw error;
      
      return {
        profileId: data.profile_id,
        emailNotifications: data.email_notifications,
        pushNotifications: data.push_notifications,
        courseUpdates: data.course_updates,
        moduleUpdates: data.module_updates,
        quizReminders: data.quiz_reminders,
        progressReminders: data.progress_reminders,
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return null;
    }
  },

  // Update notification preferences
  async updatePreferences(
    profileId: string, 
    preferences: Partial<NotificationPreferences>
  ): Promise<boolean> {
    // Validate that profileId is a valid UUID
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId);
    if (!isValidUuid) {
      console.warn('Invalid profile ID provided to updatePreferences:', profileId);
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          profile_id: profileId,
          email_notifications: preferences.emailNotifications,
          push_notifications: preferences.pushNotifications,
          course_updates: preferences.courseUpdates,
          module_updates: preferences.moduleUpdates,
          quiz_reminders: preferences.quizReminders,
          progress_reminders: preferences.progressReminders,
          updated_at: new Date()
        }, {
          onConflict: 'profile_id'
        });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  },

  // Create course update notification
  async createCourseUpdateNotification(
    courseId: string,
    updaterName: string,
    updateType: 'new_version' | 'content_update' | 'new_module'
  ): Promise<boolean> {
    try {
      // This would call the PostgreSQL function we created
      const { error } = await supabase.rpc('create_course_update_notification', {
        course_id: courseId,
        updater_name: updaterName,
        update_type: updateType
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error creating course update notification:', error);
      return false;
    }
  },

  // Create module update notification
  async createModuleUpdateNotification(
    moduleId: string,
    updaterName: string
  ): Promise<boolean> {
    try {
      // This would call the PostgreSQL function we created
      const { error } = await supabase.rpc('create_module_update_notification', {
        module_id: moduleId,
        updater_name: updaterName
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error creating module update notification:', error);
      return false;
    }
  }
};