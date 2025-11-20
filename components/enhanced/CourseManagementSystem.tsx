import React, { useState, useEffect } from 'react';
import { Course, CourseModule, CourseCategory, CourseProgress, Enrollment, StudentProfile } from '../../types';
import { courseService } from '../../services/courseService';
import { notificationService, Notification, NotificationPreferences } from '../../services/notificationService';
import EnhancedCourseBuilder from './EnhancedCourseBuilder';
import EnhancedCourseViewer from './EnhancedCourseViewer';
import DifficultyLevelManager from './DifficultyLevelManager';
import EnrollmentManager from './EnrollmentManager';
import AdminDashboardAnalytics from './AdminDashboardAnalytics';
import ProgressTracker from './ProgressTracker';
import StudentProgressReport from './StudentProgressReport';
import CourseExportImport from './CourseExportImport';
import CourseVersioning from './CourseVersioning';
import NotificationSystem from './NotificationSystem';
import CategoryManager from './CategoryManager';
import { 
  BookOpen, Users, BarChart3, Settings, 
  Download, Bell, User, TrendingUp
} from 'lucide-react';

interface CourseManagementSystemProps {
  currentUser: StudentProfile;
  isAdmin: boolean;
}

const CourseManagementSystem: React.FC<CourseManagementSystemProps> = ({
  currentUser,
  isAdmin
}) => {
  // State management
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'courses' | 'analytics' | 'enrollments' | 'progress' | 'settings'>('courses');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all data on component mount
  useEffect(() => {
    loadData();
  }, [currentUser.id]);

  // Load notifications and preferences
  useEffect(() => {
    // Only load notifications for real users with valid UUIDs
    // Admin users should not load notifications since they don't have profiles
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentUser.id) && currentUser.id !== '00000000-0000-0000-0000-000000000000';
    if (isValidUuid) {
      loadNotifications();
      loadNotificationPreferences();
    }
  }, [currentUser.id]);

  // Load all system data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load all modules first
      const modulesData = await courseService.getModules();
      setModules(modulesData);
      
      // Load all courses and populate them with their modules
      const coursesData = await courseService.getCourses();
      const coursesWithModules = coursesData.map(course => ({
        ...course,
        modules: modulesData.filter(module => module.courseId === course.id)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
      }));
      setCourses(coursesWithModules);
      
      // Update modules state to ensure it's in sync
      setModules(modulesData);
      
      // Load categories
      const categoriesData = await courseService.getCategories();
      setCategories(categoriesData);
      
      // Load enrollments (for admin) or user enrollments
      const enrollmentsData = isAdmin 
        ? await courseService.getAllEnrollments()
        : await courseService.getEnrollments(currentUser.id);
      setEnrollments(enrollmentsData);
      
      // Load progress (for admin) or user progress
      const progressData = isAdmin
        ? await courseService.getAllProgress()
        : await courseService.getProgress(currentUser.id);
      setProgress(progressData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load course data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load notifications
  const loadNotifications = async () => {
    // Skip loading notifications for admin users
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentUser.id) && currentUser.id !== '00000000-0000-0000-0000-000000000000';
    if (!isValidUuid) return;
    
    try {
      const notificationsData = await notificationService.getNotifications(currentUser.id);
      setNotifications(notificationsData);
      
      const unread = await notificationService.getUnreadCount(currentUser.id);
      setUnreadCount(unread);
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };

  // Load notification preferences
  const loadNotificationPreferences = async () => {
    // Skip loading notification preferences for admin users
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentUser.id) && currentUser.id !== '00000000-0000-0000-0000-000000000000';
    if (!isValidUuid) return;
    
    try {
      const preferences = await notificationService.getPreferences(currentUser.id);
      setNotificationPreferences(preferences);
    } catch (err) {
      console.error('Error loading notification preferences:', err);
    }
  };

  // Course management functions
  const handleAddCourse = async (course: Course) => {
    try {
      const newCourse = await courseService.createCourse(course);
      if (newCourse) {
        setCourses([...courses, { ...newCourse, modules: [] }]);
        // Notify users if this is an update to an existing course
        if (course.id) {
          await notificationService.createCourseUpdateNotification(
            course.id, 
            currentUser.name, 
            'content_update'
          );
        }
      }
    } catch (err) {
      console.error('Error adding course:', err);
      setError('Failed to add course. Please try again.');
    }
  };

  const handleUpdateCourse = async (id: string, updates: Partial<Course>) => {
    try {
      const success = await courseService.updateCourse(id, updates);
      if (success) {
        setCourses(courses.map(course => 
          course.id === id ? { ...course, ...updates } : course
        ));
        // Notify enrolled users of the update
        await notificationService.createCourseUpdateNotification(
          id, 
          currentUser.name, 
          'content_update'
        );
      }
    } catch (err) {
      console.error('Error updating course:', err);
      setError('Failed to update course. Please try again.');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      const success = await courseService.deleteCourse(id);
      if (success) {
        setCourses(courses.filter(course => course.id !== id));
        setModules(modules.filter(module => module.courseId !== id));
      }
    } catch (err) {
      console.error('Error deleting course:', err);
      setError('Failed to delete course. Please try again.');
    }
  };

  const handleAddModule = async (module: CourseModule) => {
    try {
      const newModule = await courseService.createModule(module);
      if (newModule) {
        setModules([...modules, newModule]);
        // Update the corresponding course with the new module
        setCourses(courses.map(course => {
          if (course.id === module.courseId) {
            return {
              ...course,
              modules: [...course.modules, newModule]
                .sort((a, b) => (a.order || 0) - (b.order || 0))
            };
          }
          return course;
        }));
        
        // Also update the modules state to ensure consistency
        setModules([...modules, newModule]);
        // Notify users if this is a new module in an existing course
        if (module.courseId) {
          await notificationService.createCourseUpdateNotification(
            module.courseId, 
            currentUser.name, 
            'new_module'
          );
        }
      }
    } catch (err) {
      console.error('Error adding module:', err);
      setError('Failed to add module. Please try again.');
    }
  };

  // Category management functions
  const handleAddCategory = async (category: Omit<CourseCategory, 'id'>) => {
    try {
      const newCategory = await courseService.createCategory(category);
      if (newCategory) {
        setCategories([...categories, newCategory]);
      }
    } catch (err) {
      console.error('Error adding category:', err);
      setError('Failed to add category. Please try again.');
    }
  };

  const handleUpdateCategory = async (id: string, updates: Partial<CourseCategory>) => {
    try {
      const success = await courseService.updateCategory(id, updates);
      if (success) {
        setCategories(categories.map(category => 
          category.id === id ? { ...category, ...updates } : category
        ));
      }
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Failed to update category. Please try again.');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const success = await courseService.deleteCategory(id);
      if (success) {
        setCategories(categories.filter(category => category.id !== id));
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category. Please try again.');
    }
  };

  const handleUpdateModule = async (id: string, updates: Partial<CourseModule>) => {
    try {
      const success = await courseService.updateModule(id, updates);
      if (success) {
        const updatedModule = modules.find(m => m.id === id);
        if (updatedModule) {
          setModules(modules.map(module => 
            module.id === id ? { ...module, ...updates } : module
          ));
          
          // Update the corresponding course with the updated module
          // Handle case where module might be moved to a different course
          setCourses(courses.map(course => {
            // Remove module from old course if courseId changed
            if (updatedModule.courseId && course.id === updatedModule.courseId && updates.courseId && updates.courseId !== updatedModule.courseId) {
              return {
                ...course,
                modules: course.modules.filter(m => m.id !== id)
              };
            }
            // Add/update module in new course
            if (updates.courseId && course.id === updates.courseId) {
              const newModuleData = { ...updatedModule, ...updates };
              return {
                ...course,
                modules: [...course.modules.filter(m => m.id !== id), newModuleData]
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
              };
            }
            // Update module in same course
            if (course.id === updatedModule.courseId && (!updates.courseId || updates.courseId === updatedModule.courseId)) {
              return {
                ...course,
                modules: course.modules.map(m => 
                  m.id === id ? { ...m, ...updates } : m
                ).sort((a, b) => (a.order || 0) - (b.order || 0))
              };
            }
            return course;
          }));
        }
        
        // Notify enrolled users of the update
        const module = modules.find(m => m.id === id);
        if (module?.courseId) {
          await notificationService.createModuleUpdateNotification(
            id, 
            currentUser.name
          );
        }
      }
    } catch (err) {
      console.error('Error updating module:', err);
      setError('Failed to update module. Please try again.');
    }
  };

  const handleDeleteModule = async (id: string) => {
    try {
      const success = await courseService.deleteModule(id);
      if (success) {
        const deletedModule = modules.find(m => m.id === id);
        setModules(modules.filter(module => module.id !== id));
        
        // Remove the module from its course
        if (deletedModule) {
          setCourses(courses.map(course => {
            if (course.id === deletedModule.courseId) {
              return {
                ...course,
                modules: course.modules.filter(m => m.id !== id)
              };
            }
            return course;
          }));
          
          // Also update the modules state to ensure consistency
          setModules(modules.filter(module => module.id !== id));
        }
      }
    } catch (err) {
      console.error('Error deleting module:', err);
      setError('Failed to delete module. Please try again.');
    }
  };

  // Enrollment functions
  const handleEnrollStudent = async (profileId: string, courseId: string) => {
    try {
      console.log('Enrolling user:', profileId, 'in course:', courseId);
      const enrollment = await courseService.enrollInCourse(profileId, courseId);
      if (enrollment) {
        setEnrollments([...enrollments, enrollment]);
      } else {
        setError('Failed to enroll in course. Please try again.');
      }
    } catch (err) {
      console.error('Error enrolling student:', err);
      setError('Failed to enroll student. Please try again.');
    }
  };

  const handleUpdateEnrollment = async (id: string, updates: Partial<Enrollment>) => {
    try {
      const success = await courseService.updateEnrollment(id, updates);
      if (success) {
        setEnrollments(enrollments.map(enrollment => 
          enrollment.id === id ? { ...enrollment, ...updates } : enrollment
        ));
      }
    } catch (err) {
      console.error('Error updating enrollment:', err);
      setError('Failed to update enrollment. Please try again.');
    }
  };

  // Progress tracking functions
  const handleCompleteModule = async (moduleId: string) => {
    try {
      const success = await courseService.updateModuleProgress(
        currentUser.id, 
        moduleId, 
        { completed: true, completedAt: new Date() }
      );
      
      if (success) {
        setProgress(progress.map(p => 
          p.moduleId === moduleId 
            ? { ...p, completed: true, completedAt: new Date() } 
            : p
        ));
        
        // Update enrollment progress
        const module = modules.find(m => m.id === moduleId);
        if (module?.courseId) {
          // Recalculate course progress and update enrollment
          const courseModules = modules.filter(m => m.courseId === module.courseId);
          const completedModules = courseModules.filter(m => 
            progress.some(p => p.moduleId === m.id && p.completed)
          ).length;
          
          const courseProgress = Math.round((completedModules / courseModules.length) * 100);
          
          // Find enrollment for this course and update progress
          const enrollment = enrollments.find(e => 
            e.profileId === currentUser.id && e.courseId === module.courseId
          );
          
          if (enrollment) {
            await handleUpdateEnrollment(enrollment.id, { progress: courseProgress });
          }
        }
      }
    } catch (err) {
      console.error('Error completing module:', err);
      setError('Failed to mark module as complete. Please try again.');
    }
  };

  // Notification functions
  const handleMarkAsRead = async (id: string) => {
    try {
      const success = await notificationService.markAsRead(id);
      if (success) {
        setNotifications(notifications.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        ));
        setUnreadCount(unreadCount - 1);
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const success = await notificationService.markAllAsRead(currentUser.id);
      if (success) {
        setNotifications(notifications.map(notification => 
          ({ ...notification, read: true })
        ));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      const success = await notificationService.deleteNotification(id);
      if (success) {
        setNotifications(notifications.filter(notification => 
          notification.id !== id
        ));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleUpdateNotificationPreferences = async (preferences: Partial<NotificationPreferences>) => {
    try {
      const success = await notificationService.updatePreferences(
        currentUser.id, 
        preferences
      );
      if (success && notificationPreferences) {
        setNotificationPreferences({
          ...notificationPreferences,
          ...preferences
        });
      }
    } catch (err) {
      console.error('Error updating notification preferences:', err);
    }
  };

  // Export/Import functions
  const handleImportCourses = async (data: { 
    courses: Course[], 
    modules: CourseModule[], 
    categories: CourseCategory[] 
  }) => {
    try {
      // Import courses
      for (const course of data.courses) {
        await courseService.createCourse(course);
      }
      
      // Import modules
      for (const module of data.modules) {
        await courseService.createModule(module);
      }
      
      // Note: Category creation is not implemented in courseService
      // Categories are managed separately in the database
      
      // Reload data
      loadData();
    } catch (err) {
      console.error('Error importing courses:', err);
      setError('Failed to import course data. Please try again.');
    }
  };

  // Versioning functions
  const handleCreateVersion = async (courseId: string) => {
    try {
      // This would call a service function to create a new version
      // For now, we'll simulate the process
      setTimeout(() => {
        loadData(); // Reload data to show new version
      }, 2000);
    } catch (err) {
      console.error('Error creating course version:', err);
      setError('Failed to create course version. Please try again.');
    }
  };

  const handleSwitchVersion = async (courseId: string) => {
    try {
      // This would switch to a different version of the course
      // For now, we'll just reload the data
      loadData();
    } catch (err) {
      console.error('Error switching course version:', err);
      setError('Failed to switch course version. Please try again.');
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading course management system...</div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 m-4">
        <div className="text-red-400 font-bold">Error</div>
        <div className="text-red-300">{error}</div>
        <button 
          onClick={loadData}
          className="mt-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  // Admin view
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-trade-dark">
        {/* Admin Header */}
        <div className="bg-black border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-trade-accent" />
                <h1 className="text-xl font-bold text-white">Course Management System</h1>
              </div>
              
              <div className="flex items-center gap-4">
                <NotificationSystem
                  notifications={notifications}
                  preferences={notificationPreferences}
                  unreadCount={unreadCount}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                  onDelete={handleDeleteNotification}
                  onUpdatePreferences={handleUpdateNotificationPreferences}
                />
                
                <div className="flex items-center gap-2 text-white">
                  <User className="h-5 w-5" />
                  <span>{currentUser.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Admin Navigation */}
        <div className="bg-gray-900 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('courses')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'courses'
                    ? 'border-trade-accent text-trade-accent'
                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <BookOpen className="h-4 w-4" /> Courses
              </button>
              
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'analytics'
                    ? 'border-trade-accent text-trade-accent'
                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="h-4 w-4" /> Analytics
              </button>
              
              <button
                onClick={() => setActiveTab('enrollments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'enrollments'
                    ? 'border-trade-accent text-trade-accent'
                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <Users className="h-4 w-4" /> Enrollments
              </button>
              
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'settings'
                    ? 'border-trade-accent text-trade-accent'
                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <Settings className="h-4 w-4" /> Settings
              </button>
            </div>
          </div>
        </div>
        
        {/* Admin Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'courses' && (
            <EnhancedCourseBuilder
              courses={courses}
              modules={modules}
              categories={categories}
              onAddCourse={handleAddCourse}
              onUpdateCourse={handleUpdateCourse}
              onDeleteCourse={handleDeleteCourse}
              onAddModule={handleAddModule}
              onUpdateModule={handleUpdateModule}
              onDeleteModule={handleDeleteModule}
            />
          )}
          
          {activeTab === 'analytics' && (
            <AdminDashboardAnalytics
              courses={courses}
              modules={modules}
              enrollments={enrollments}
              progress={progress}
            />
          )}
          
          {activeTab === 'enrollments' && (
            <EnrollmentManager
              courses={courses}
              enrollments={enrollments}
              students={[]} // This would come from a student service
              onEnrollStudent={handleEnrollStudent}
              onUpdateEnrollment={handleUpdateEnrollment}
            />
          )}
          
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <CategoryManager
                categories={categories}
                onAddCategory={handleAddCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
              />
              <CourseExportImport
                courses={courses}
                modules={modules}
                categories={categories}
                onImportCourses={handleImportCourses}
              />
              <DifficultyLevelManager
                levels={[]} // This would come from a levels service
                onSaveLevel={() => {}}
                onDeleteLevel={() => {}}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Student view
  return (
    <div className="min-h-screen bg-trade-dark">
      {/* Student Header */}
      <div className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-trade-accent" />
              <h1 className="text-xl font-bold text-white">Learning Center</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentUser.id) && currentUser.id !== '00000000-0000-0000-0000-000000000000' && (
                <NotificationSystem
                  notifications={notifications}
                  preferences={notificationPreferences}
                  unreadCount={unreadCount}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                  onDelete={handleDeleteNotification}
                  onUpdatePreferences={handleUpdateNotificationPreferences}
                />
              )}
              
              <div className="flex items-center gap-2 text-white">
                <User className="h-5 w-5" />
                <span>{currentUser.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Student Navigation */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('courses')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'courses'
                  ? 'border-trade-accent text-trade-accent'
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <BookOpen className="h-4 w-4" /> Courses
            </button>
            
            <button
              onClick={() => setActiveTab('progress')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'progress'
                  ? 'border-trade-accent text-trade-accent'
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <TrendingUp className="h-4 w-4" /> Progress
            </button>
          </div>
        </div>
      </div>
      
      {/* Student Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'courses' && (
          <EnhancedCourseViewer
            courses={courses}
            modules={modules}
            categories={categories}
            enrollments={enrollments.filter(e => e.profileId === currentUser.id)}
            progress={progress.filter(p => p.profileId === currentUser.id)}
            onEnroll={(courseId) => {
              console.log('Enroll button clicked for course:', courseId);
              handleEnrollStudent(currentUser.id, courseId);
            }}
            onCompleteModule={handleCompleteModule}
          />
        )}
        
        {activeTab === 'progress' && (
          <div className="space-y-6">
            <ProgressTracker
              courses={courses}
              modules={modules}
              enrollments={enrollments.filter(e => e.profileId === currentUser.id)}
              progress={progress.filter(p => p.profileId === currentUser.id)}
              userId={currentUser.id}
            />
            <StudentProgressReport
              student={currentUser}
              courses={courses}
              modules={modules}
              enrollments={enrollments.filter(e => e.profileId === currentUser.id)}
              progress={progress.filter(p => p.profileId === currentUser.id)}
              onExportReport={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseManagementSystem;