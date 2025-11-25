import React, { useState } from 'react';
import { 
  Course, CourseModule, CourseCategory, CourseProgress, Enrollment 
} from '../../types';
import { 
  GraduationCap, Clock, CheckCircle, Lock, PlayCircle, 
  BookOpen, Filter, Search, ChevronDown, ChevronRight,
  User, Tag, Layers, FileText
} from 'lucide-react';

interface EnhancedCourseViewerProps {
  courses: Course[];
  modules: CourseModule[];
  categories: CourseCategory[];
  enrollments: Enrollment[];
  progress: CourseProgress[];
  onEnroll: (courseId: string) => void;
  onCompleteModule: (moduleId: string) => void;
}

const EnhancedCourseViewer: React.FC<EnhancedCourseViewerProps> = ({
  courses,
  modules,
  categories,
  enrollments,
  progress,
  onEnroll,
  onCompleteModule
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'enrolled' | 'completed'>('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter courses based on search and category
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || course.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get user's enrolled courses
  const enrolledCourses = filteredCourses.filter(course => 
    enrollments.some(e => e.courseId === course.id && e.status === 'active')
  );

  // Get user's completed courses
  const completedCourses = filteredCourses.filter(course => 
    enrollments.some(e => e.courseId === course.id && e.status === 'completed')
  );

  // Get modules for a specific course
  const getCourseModules = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? [...course.modules].sort((a, b) => (a.order || 0) - (b.order || 0)) : [];
  };

  // Get module progress
  const getModuleProgress = (moduleId: string) => {
    return progress.find(p => p.moduleId === moduleId);
  };

  // Get course progress
  const getCourseProgress = (courseId: string) => {
    const courseModules = getCourseModules(courseId);
    if (courseModules.length === 0) return 0;
    
    const completedModules = courseModules.filter(module => {
      const moduleProgress = getModuleProgress(module.id);
      return moduleProgress?.completed;
    }).length;
    
    return Math.round((completedModules / courseModules.length) * 100);
  };

  // Check if module is unlocked (based on prerequisites)
  const isModuleUnlocked = (module: CourseModule) => {
    // For now, we'll implement a simple sequential unlock
    // In a full implementation, this would check prerequisites
    const courseModules = getCourseModules(module.courseId || '');
    const moduleIndex = courseModules.findIndex(m => m.id === module.id);
    
    // First module is always unlocked
    if (moduleIndex === 0) return true;
    
    // Check if previous module is completed
    const previousModule = courseModules[moduleIndex - 1];
    const previousProgress = getModuleProgress(previousModule.id);
    return previousProgress?.completed || false;
  };

  // Toggle course expansion
  const toggleCourseExpansion = (courseId: string) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  // Handle module selection
  const handleSelectModule = (module: CourseModule) => {
    if (isModuleUnlocked(module)) {
      setSelectedModule(module);
    }
  };

  // Render course card
  const renderCourseCard = (course: Course) => {
    const courseProgress = getCourseProgress(course.id);
    const isEnrolled = enrollments.some(e => e.courseId === course.id && e.status === 'active');
    const isCompleted = enrollments.some(e => e.courseId === course.id && e.status === 'completed');
    const courseModules = getCourseModules(course.id);
    
    const category = categories.find(c => c.id === course.categoryId);
    
    return (
      <div 
        key={course.id} 
        className="bg-trade-dark border border-gray-700 rounded-xl overflow-hidden transition-all hover:border-blue-500/50"
      >
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">{course.title}</h3>
                {isCompleted && (
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-bold uppercase">
                    Completed
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-sm mb-3">{course.description}</p>
              
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {course.duration}
                </span>
                <span className={`px-2 py-0.5 rounded capitalize border ${
                  course.level === 'beginner' ? 'border-green-500/20 text-green-400' :
                  course.level === 'intermediate' ? 'border-yellow-500/20 text-yellow-400' :
                  'border-red-500/20 text-red-400'
                }`}>
                  {course.level}
                </span>
                {category && (
                  <span 
                    className="flex items-center gap-1 px-2 py-0.5 rounded" 
                    style={{ 
                      backgroundColor: `${category.color}20`, 
                      color: category.color,
                      border: `1px solid ${category.color}30`
                    }}
                  >
                    <Tag className="h-3 w-3" /> {category.name}
                  </span>
                )}
                <span>{courseModules.length} modules</span>
              </div>
            </div>
            
            {course.instructor && (
              <div className="flex items-center gap-1 text-xs text-gray-500 ml-2">
                <User className="h-3 w-3" />
                {course.instructor}
              </div>
            )}
          </div>
          
          {isEnrolled && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Progress</span>
                <span>{courseProgress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${courseProgress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          <div className="mt-4 flex gap-2">
            {!isEnrolled && !isCompleted ? (
              <button
                onClick={() => {
                  console.log('Enroll Now button clicked for course:', course.id);
                  onEnroll(course.id);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm transition"
              >
                Enroll Now
              </button>
            ) : (
              <button
                onClick={() => setSelectedCourse(course)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold text-sm transition"
              >
                {isCompleted ? 'Review Course' : 'Continue Learning'}
              </button>
            )}
            
            <button
              onClick={() => toggleCourseExpansion(course.id)}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
            >
              {expandedCourses[course.id] ? 
                <ChevronDown className="h-5 w-5 text-gray-400" /> : 
                <ChevronRight className="h-5 w-5 text-gray-400" />
              }
            </button>
          </div>
        </div>
        
        {expandedCourses[course.id] && (
          <div className="border-t border-gray-700 bg-gray-900/30">
            <div className="p-5">
              <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4" /> Course Modules
              </h4>
              
              <div className="space-y-3">
                {courseModules
                  .map((module, index) => {
                  const moduleProgress = getModuleProgress(module.id);
                  const isUnlocked = isModuleUnlocked(module);
                  const isCompleted = moduleProgress?.completed;
                  
                  return (
                    <div 
                      key={module.id}
                      className={`p-3 rounded-lg border transition-all ${
                        isCompleted ? 'border-green-500/30 bg-green-500/5' :
                        isUnlocked ? 'border-gray-600 hover:border-blue-500/50 cursor-pointer' :
                        'border-gray-700 opacity-60'
                      }`}
                      onClick={() => isUnlocked && handleSelectModule(module)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCompleted ? 'bg-green-500 text-white' :
                            isUnlocked ? 'bg-blue-500 text-white' :
                            'bg-gray-700 text-gray-400'
                          }`}>
                            {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                          </div>
                          
                          <div>
                            <h5 className={`font-bold ${
                              isUnlocked ? 'text-white' : 'text-gray-400'
                            }`}>
                              {module.title}
                            </h5>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {module.duration}
                              </span>
                              {module.contentType === 'video' ? (
                                <span className="flex items-center gap-1 text-blue-400">
                                  <PlayCircle className="h-3 w-3" /> Video
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-purple-400">
                                  <FileText className="h-3 w-3" /> Text
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {!isUnlocked && (
                          <Lock className="h-4 w-4 text-gray-500" />
                        )}
                        
                        {isCompleted && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render course detail view
  const renderCourseDetail = () => {
    if (!selectedCourse) return null;
    
    const courseModules = getCourseModules(selectedCourse.id);
    const courseProgress = getCourseProgress(selectedCourse.id);
    const isEnrolled = enrollments.some(e => e.courseId === selectedCourse.id && e.status === 'active');
    
    const category = categories.find(c => c.id === selectedCourse.categoryId);
    
    return (
      <div className="text-white">
        <button
          onClick={() => setSelectedCourse(null)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
        >
          ← Back to Courses
        </button>
        
        <div className="bg-trade-dark border border-gray-700 rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-2xl font-bold text-white">{selectedCourse.title}</h1>
                {category && (
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-bold" 
                    style={{ 
                      backgroundColor: `${category.color}20`, 
                      color: category.color,
                      border: `1px solid ${category.color}30`
                    }}
                  >
                    {category.name}
                  </span>
                )}
              </div>
              
              <p className="text-gray-300 mb-4">{selectedCourse.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {selectedCourse.duration}
                </span>
                <span className={`px-2 py-1 rounded capitalize border ${
                  selectedCourse.level === 'beginner' ? 'border-green-500/20 text-green-400' :
                  selectedCourse.level === 'intermediate' ? 'border-yellow-500/20 text-yellow-400' :
                  'border-red-500/20 text-red-400'
                }`}>
                  {selectedCourse.level}
                </span>
                <span>{courseModules.length} modules</span>
                {selectedCourse.instructor && (
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" /> {selectedCourse.instructor}
                  </span>
                )}
              </div>
            </div>
            
            <div className="md:w-64">
              {!isEnrolled ? (
                <button
                  onClick={() => {
                    console.log('Enroll Now button clicked for course:', selectedCourse.id);
                    onEnroll(selectedCourse.id);
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition"
                >
                  Enroll Now
                </button>
              ) : (
                <div>
                  <div className="text-center mb-3">
                    <div className="text-2xl font-bold">{courseProgress}%</div>
                    <div className="text-xs text-gray-500 uppercase">Complete</div>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${courseProgress}%` }}
                    ></div>
                  </div>
                  <button
                    onClick={() => courseModules.length > 0 && handleSelectModule(courseModules[0])}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition"
                  >
                    {courseProgress > 0 ? 'Continue Learning' : 'Start Course'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-trade-dark border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5" /> Course Modules
          </h2>
          
          <div className="space-y-4">
            {courseModules
              .map((module, index) => {
              const moduleProgress = getModuleProgress(module.id);
              const isUnlocked = isModuleUnlocked(module);
              const isCompleted = moduleProgress?.completed;
              
              return (
                <div 
                  key={module.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isCompleted ? 'border-green-500/30 bg-green-500/5' :
                    isUnlocked ? 'border-gray-600 hover:border-blue-500/50 cursor-pointer' :
                    'border-gray-700 opacity-60'
                  }`}
                  onClick={() => isUnlocked && handleSelectModule(module)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        isCompleted ? 'bg-green-500 text-white' :
                        isUnlocked ? 'bg-blue-500 text-white' :
                        'bg-gray-700 text-gray-400'
                      }`}>
                        {isCompleted ? <CheckCircle className="h-5 w-5" /> : index + 1}
                      </div>
                      
                      <div>
                        <h3 className={`font-bold text-lg ${
                          isUnlocked ? 'text-white' : 'text-gray-400'
                        }`}>
                          {module.title}
                        </h3>
                        <p className="text-gray-400 text-sm">{module.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {module.duration}
                          </span>
                          {module.contentType === 'video' ? (
                            <span className="flex items-center gap-1 text-blue-400">
                              <PlayCircle className="h-3 w-3" /> Video Lesson
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-purple-400">
                              <FileText className="h-3 w-3" /> Text Article
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {!isUnlocked && (
                      <Lock className="h-5 w-5 text-gray-500" />
                    )}
                    
                    {isCompleted && (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render module detail view
  const renderModuleDetail = () => {
    if (!selectedModule) return null;
    
    const moduleProgress = getModuleProgress(selectedModule.id);
    const isCompleted = moduleProgress?.completed;
    
    // Function to convert YouTube URLs to embed format
    const getEmbedUrl = (url: string | undefined) => {
      if (!url) return null;
      
      // Handle YouTube URLs
      if (url.includes('youtube.com/watch')) {
        const videoId = url.split('v=')[1]?.split('&')[0];
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      } else if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }
      
      // Return the original URL if it's already an embed URL or not a YouTube URL
      return url.includes('embed') || !url.includes('youtube.com') ? url : null;
    };
    
    const embedUrl = selectedModule.contentType === 'video' ? getEmbedUrl(selectedModule.content) : null;
    
    return (
      <div className="text-white max-w-4xl mx-auto">
        <button
          onClick={() => setSelectedModule(null)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
        >
          ← Back to Course
        </button>
        
        <div className="bg-trade-dark border border-gray-700 rounded-xl overflow-hidden mb-6">
          {selectedModule.contentType === 'video' ? (
            <div className="aspect-video bg-gray-900">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={selectedModule.title}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : selectedModule.content ? (
                <div className="w-full h-full flex items-center justify-center p-6">
                  <div className="text-center">
                    <PlayCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">Unable to Embed Video</h3>
                    <p className="text-gray-500 mb-4">This video cannot be embedded. Please use a direct embed URL.</p>
                    <p className="text-sm text-gray-600 bg-gray-800 p-3 rounded-lg break-words">{selectedModule.content}</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <PlayCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">No video content available</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 bg-trade-dark min-h-[400px]">
              <h2 className="text-3xl font-bold mb-6">{selectedModule.title}</h2>
              <div className="prose prose-invert max-w-none">
                {selectedModule.content?.split('\n').map((line, i) => {
                  if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold mb-4 text-white">{line.substring(2)}</h1>;
                  if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mb-3 text-white mt-8">{line.substring(3)}</h2>;
                  if (line.trim() === '') return <br key={i} />;
                  return <p key={i} className="text-gray-300 leading-relaxed mb-4">{line}</p>;
                })}
                {!selectedModule.content && (
                  <div className="text-center text-gray-500 py-10">
                    <div className="mb-4">No content available for this module.</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <button
            onClick={() => setSelectedModule(null)}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition"
          >
            Back to Modules
          </button>
          
          {!isCompleted ? (
            <button
              onClick={() => onCompleteModule(selectedModule.id)}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold flex items-center gap-2 transition"
            >
              <CheckCircle className="h-5 w-5" /> Mark as Complete
            </button>
          ) : (
            <div className="px-6 py-3 bg-green-600/20 text-green-400 rounded-lg font-bold flex items-center gap-2">
              <CheckCircle className="h-5 w-5" /> Completed
            </div>
          )}
        </div>
      </div>
    );
  };

  // Main render
  if (selectedModule) {
    return renderModuleDetail();
  }
  
  if (selectedCourse) {
    return renderCourseDetail();
  }

  return (
    <div className="text-white pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-trade-accent" />
            Learning Center
          </h1>
          <p className="text-gray-400 mt-1">Expand your trading knowledge with our comprehensive courses.</p>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold">
            {enrolledCourses.length}
          </div>
          <div className="text-xs text-gray-500 uppercase">Courses Enrolled</div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
            activeTab === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
          }`}
        >
          All Courses
        </button>
        <button
          onClick={() => setActiveTab('enrolled')}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
            activeTab === 'enrolled' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
          }`}
        >
          My Courses
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
            activeTab === 'completed' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
          }`}
        >
          Completed
        </button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search courses..."
            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <select
            className="bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none pl-10 appearance-none"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Course List */}
      {filteredCourses.length === 0 ? (
        <div className="bg-trade-dark border border-dashed border-gray-700 rounded-xl p-12 text-center">
          <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-400">No courses found</h3>
          <p className="text-gray-500">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'No courses are available at the moment.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {(activeTab === 'all' 
            ? filteredCourses 
            : activeTab === 'enrolled' 
              ? enrolledCourses 
              : completedCourses
          ).map(course => renderCourseCard(course))}
        </div>
      )}
    </div>
  );
};

export default EnhancedCourseViewer;