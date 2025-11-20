import React, { useState, useEffect } from 'react';
import { Course, CourseModule, Enrollment, CourseProgress } from '../../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  PieChart, Pie, AreaChart, Area, CartesianGrid, Legend
} from 'recharts';
import { 
  TrendingUp, Users, BookOpen, CheckCircle, Clock, 
  AlertTriangle, Award, Target, Calendar, Layers
} from 'lucide-react';

interface AdminDashboardAnalyticsProps {
  courses: Course[];
  modules: CourseModule[];
  enrollments: Enrollment[];
  progress: CourseProgress[];
}

const AdminDashboardAnalytics: React.FC<AdminDashboardAnalyticsProps> = ({
  courses,
  modules,
  enrollments,
  progress
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  // Calculate statistics
  const totalCourses = courses.length;
  const totalModules = modules.length;
  const totalEnrollments = enrollments.length;
  const activeEnrollments = enrollments.filter(e => e.status === 'active').length;
  const completedEnrollments = enrollments.filter(e => e.status === 'completed').length;
  
  // Calculate completion rate
  const completionRate = totalEnrollments > 0 
    ? Math.round((completedEnrollments / totalEnrollments) * 100) 
    : 0;
  
  // Calculate average progress
  const averageProgress = enrollments.length > 0 
    ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / enrollments.length)
    : 0;

  // Get enrollments by course
  const getEnrollmentsByCourse = () => {
    const courseEnrollments: Record<string, { course: Course, count: number, completed: number }> = {};
    
    courses.forEach(course => {
      courseEnrollments[course.id] = {
        course,
        count: 0,
        completed: 0
      };
    });
    
    enrollments.forEach(enrollment => {
      if (courseEnrollments[enrollment.courseId]) {
        courseEnrollments[enrollment.courseId].count += 1;
        if (enrollment.status === 'completed') {
          courseEnrollments[enrollment.courseId].completed += 1;
        }
      }
    });
    
    return Object.values(courseEnrollments)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 courses
  };

  // Get enrollment trend data
  const getEnrollmentTrendData = () => {
    // This is a simplified version - in a real app, you would have actual dates
    const data = [];
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 30;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simulate enrollment data
      const enrollmentsOnDate = Math.floor(Math.random() * 10) + 5;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        enrollments: enrollmentsOnDate,
        completions: Math.floor(enrollmentsOnDate * (completionRate / 100))
      });
    }
    
    return data;
  };

  // Get module completion data
  const getModuleCompletionData = () => {
    // Group modules by course
    const courseModules: Record<string, CourseModule[]> = {};
    
    modules.forEach(module => {
      if (!courseModules[module.courseId || '']) {
        courseModules[module.courseId || ''] = [];
      }
      courseModules[module.courseId || ''].push(module);
    });
    
    // Calculate completion rate for each course
    const data = Object.entries(courseModules).map(([courseId, courseModules]) => {
      const course = courses.find(c => c.id === courseId);
      if (!course) return null;
      
      const totalModules = courseModules.length;
      const completedModules = courseModules.filter(module => {
        return progress.some(p => p.moduleId === module.id && p.completed);
      }).length;
      
      const completionRate = totalModules > 0 
        ? Math.round((completedModules / totalModules) * 100) 
        : 0;
      
      return {
        name: course.title.length > 20 ? course.title.substring(0, 20) + '...' : course.title,
        completion: completionRate,
        total: totalModules,
        completed: completedModules
      };
    }).filter(Boolean) as { name: string, completion: number, total: number, completed: number }[];
    
    return data.sort((a, b) => b.completion - a.completion).slice(0, 10);
  };

  // Get difficulty distribution
  const getDifficultyDistribution = () => {
    const distribution: Record<string, number> = {
      beginner: 0,
      intermediate: 0,
      advanced: 0
    };
    
    courses.forEach(course => {
      distribution[course.level] = (distribution[course.level] || 0) + 1;
    });
    
    return [
      { name: 'Beginner', value: distribution.beginner, color: '#10B981' },
      { name: 'Intermediate', value: distribution.intermediate, color: '#F59E0B' },
      { name: 'Advanced', value: distribution.advanced, color: '#EF4444' }
    ];
  };

  // Get content type distribution
  const getContentTypeDistribution = () => {
    const distribution: Record<string, number> = {
      video: 0,
      text: 0
    };
    
    modules.forEach(module => {
      if (module.contentType) {
        distribution[module.contentType] = (distribution[module.contentType] || 0) + 1;
      }
    });
    
    return [
      { name: 'Video', value: distribution.video, color: '#3B82F6' },
      { name: 'Text', value: distribution.text, color: '#8B5CF6' }
    ];
  };

  // Data for charts
  const enrollmentTrendData = getEnrollmentTrendData();
  const enrollmentsByCourse = getEnrollmentsByCourse();
  const moduleCompletionData = getModuleCompletionData();
  const difficultyDistribution = getDifficultyDistribution();
  const contentTypeDistribution = getContentTypeDistribution();

  return (
    <div className="text-white pb-10">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-trade-accent" />
            Course Analytics Dashboard
          </h1>
          <p className="text-gray-400 mt-1">Comprehensive insights into course performance and student engagement.</p>
        </div>
        
        <div className="flex gap-2">
          <select
            className="bg-black border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          
          <select
            className="bg-black border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-trade-dark border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{totalCourses}</div>
              <div className="text-sm text-gray-400">Total Courses</div>
            </div>
          </div>
        </div>
        
        <div className="bg-trade-dark border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Layers className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{totalModules}</div>
              <div className="text-sm text-gray-400">Total Modules</div>
            </div>
          </div>
        </div>
        
        <div className="bg-trade-dark border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Users className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{totalEnrollments}</div>
              <div className="text-sm text-gray-400">Total Enrollments</div>
            </div>
          </div>
        </div>
        
        <div className="bg-trade-dark border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Award className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <div className="text-sm text-gray-400">Completion Rate</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Enrollment Trend */}
        <div className="bg-trade-dark border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" /> Enrollment Trend
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrollmentTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    borderColor: '#374151', 
                    borderRadius: '0.5rem' 
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="enrollments" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.2} 
                />
                <Area 
                  type="monotone" 
                  dataKey="completions" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.2} 
                />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Module Completion Rates */}
        <div className="bg-trade-dark border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" /> Module Completion Rates
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moduleCompletionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    borderColor: '#374151', 
                    borderRadius: '0.5rem' 
                  }} 
                  formatter={(value) => [`${value}%`, 'Completion Rate']}
                />
                <Bar dataKey="completion" name="Completion Rate">
                  {moduleCompletionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#8B5CF6" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Enrollments by Course */}
        <div className="lg:col-span-2 bg-trade-dark border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" /> Top Courses by Enrollment
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enrollmentsByCourse}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="course.title" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    borderColor: '#374151', 
                    borderRadius: '0.5rem' 
                  }} 
                />
                <Bar dataKey="count" name="Enrollments" fill="#3B82F6" />
                <Bar dataKey="completed" name="Completed" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Difficulty Distribution */}
        <div className="bg-trade-dark border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5" /> Course Difficulty Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={difficultyDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {difficultyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    borderColor: '#374151', 
                    borderRadius: '0.5rem' 
                  }} 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Content Type Distribution */}
      <div className="bg-trade-dark border border-gray-700 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5" /> Content Type Distribution
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={contentTypeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {contentTypeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  borderColor: '#374151', 
                  borderRadius: '0.5rem' 
                }} 
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Detailed Stats */}
      <div className="bg-trade-dark border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" /> Detailed Statistics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{activeEnrollments}</div>
            <div className="text-sm text-gray-400">Active Enrollments</div>
          </div>
          
          <div className="bg-gray-800/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{completedEnrollments}</div>
            <div className="text-sm text-gray-400">Completed Enrollments</div>
          </div>
          
          <div className="bg-gray-800/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{averageProgress}%</div>
            <div className="text-sm text-gray-400">Average Progress</div>
          </div>
          
          <div className="bg-gray-800/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">
              {Math.round(totalModules / totalCourses)}
            </div>
            <div className="text-sm text-gray-400">Avg. Modules per Course</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardAnalytics;