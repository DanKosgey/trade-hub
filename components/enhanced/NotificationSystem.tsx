import React, { useState, useEffect } from 'react';
import { Notification, NotificationPreferences } from '../../services/notificationService';
import { 
  Bell, BellOff, Settings, X, CheckCircle, 
  AlertTriangle, AlertCircle, Info, 
  BookOpen, Layers, Check, Trash2
} from 'lucide-react';

interface NotificationSystemProps {
  notifications: Notification[];
  preferences: NotificationPreferences | null;
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onUpdatePreferences: (preferences: Partial<NotificationPreferences>) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  preferences,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onUpdatePreferences
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Get icon based on notification type
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  // Get background color based on notification type
  const getBackgroundColor = (type: string, read: boolean) => {
    if (read) {
      return 'bg-gray-800/30';
    }
    
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/30';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 'error':
        return 'bg-red-500/10 border-red-500/30';
      default:
        return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  // Handle preference change
  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    if (preferences) {
      onUpdatePreferences({ [key]: value });
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-trade-dark border border-gray-700 rounded-xl shadow-2xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="font-bold text-white">Notifications</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setShowPreferences(!showPreferences)}
                className="text-gray-400 hover:text-white"
              >
                <Settings className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Preferences Panel */}
          {showPreferences && preferences && (
            <div className="p-4 border-b border-gray-700">
              <h4 className="font-bold text-white mb-3">Notification Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Email Notifications</span>
                  <button
                    onClick={() => handlePreferenceChange('emailNotifications', !preferences.emailNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      preferences.emailNotifications ? 'bg-blue-500' : 'bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Course Updates</span>
                  <button
                    onClick={() => handlePreferenceChange('courseUpdates', !preferences.courseUpdates)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      preferences.courseUpdates ? 'bg-blue-500' : 'bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        preferences.courseUpdates ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Module Updates</span>
                  <button
                    onClick={() => handlePreferenceChange('moduleUpdates', !preferences.moduleUpdates)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      preferences.moduleUpdates ? 'bg-blue-500' : 'bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        preferences.moduleUpdates ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Quiz Reminders</span>
                  <button
                    onClick={() => handlePreferenceChange('quizReminders', !preferences.quizReminders)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      preferences.quizReminders ? 'bg-blue-500' : 'bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        preferences.quizReminders ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <BellOff className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 transition-all ${
                      notification.read 
                        ? 'border-transparent' 
                        : 'border-blue-500'
                    } ${getBackgroundColor(notification.type, notification.read)}`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className={`text-sm font-bold ${
                            notification.read ? 'text-gray-400' : 'text-white'
                          }`}>
                            {notification.title}
                          </h4>
                          <button
                            onClick={() => onDelete(notification.id)}
                            className="text-gray-500 hover:text-red-400 ml-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className={`text-sm mt-1 ${
                          notification.read ? 'text-gray-500' : 'text-gray-300'
                        }`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <span>
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </span>
                          {!notification.read && (
                            <button
                              onClick={() => onMarkAsRead(notification.id)}
                              className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                              <Check className="h-3 w-3" /> Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside handler */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        ></div>
      )}
    </div>
  );
};

export default NotificationSystem;