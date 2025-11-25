import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Course, CourseModule, CourseCategory, CourseProgress, Enrollment 
} from '../../types';
import { 
  GraduationCap, Clock, CheckCircle, Lock, PlayCircle, 
  BookOpen, Filter, Search, ChevronDown, ChevronRight,
  User, Tag, Layers, FileText, Heart, Award
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

type ViewerTab = 'all' | 'enrolled' | 'completed' | 'bookmarked';

const STORAGE_VIEW_KEY = 'courseViewerState';
const STORAGE_BOOKMARKS_KEY = 'courseBookmarks';

const EnhancedCourseViewer: React.FC<EnhancedCourseViewerProps> = ({
  courses,
  modules,
  categories,
  enrollments,
  progress,
  onEnroll,
  onCompleteModule
}) => {
  const [activeTab, setActiveTab] = useState<ViewerTab>('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'alphabetical' | 'duration' | 'level'>('newest');
  const [courseLastModules, setCourseLastModules] = useState<Record<string, string>>({});
  const [bookmarkedCourses, setBookmarkedCourses] = useState<string[]>([]);

  // Restore state on mount
  useEffect(() => {
    try {
      const savedBookmarks = localStorage.getItem(STORAGE_BOOKMARKS_KEY);
      if (savedBookmarks) {
        setBookmarkedCourses(JSON.parse(savedBookmarks));
      }
    } catch {}

    try {
      const saved = localStorage.getItem(STORAGE_VIEW_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setActiveTab(parsed.activeTab || 'all');
        setSearchTerm(parsed.searchTerm || '');
        setSelectedCategory(parsed.selectedCategory || 'all');
        setSortBy(parsed.sortBy || 'newest');
        setExpandedCourses(parsed.expandedCourses || {});
        setCourseLastModules(parsed.courseLastModules || {});
        if (parsed.selectedCourseId) {
          const course = courses.find(c => c.id === parsed.selectedCourseId);
          if (course && enrollments.some(e => e.courseId === course.id && (e.status === 'active' || e.status === 'completed'))) {
            setSelectedCourse(course);
            if (parsed.selectedModuleId) {
              const mod = modules.find(m => m.id === parsed.selectedModuleId && m.courseId === course.id);
              if (mod) {
                setSelectedModule(mod);
              }
            }
          }
        }
      }
    } catch {}
  }, [courses, modules, enrollments]);

  // Save view state
  useEffect(() => {
    const state = {
      activeTab,
      searchTerm,
      selectedCategory,
      sortBy,
      expandedCourses,
      courseLastModules,
      selectedCourseId: selectedCourse?.id,
      selectedModuleId: selectedModule?.id,
    };
    localStorage.setItem(STORAGE_VIEW_KEY, JSON.stringify(state));
  }, [activeTab, searchTerm, selectedCategory, sortBy, expandedCourses, courseLastModules, selectedCourse, selectedModule]);

  // Save bookmarks
  useEffect(() => {
    localStorage.setItem(STORAGE_BOOKMARKS_KEY, JSON.stringify(bookmarkedCourses));
  }, [bookmarkedCourses]);

  const parseDuration = useCallback((duration: string): number => {
    let totalMinutes = 0;
    const hourMatch = duration.match(/(\d+)h/);
    const minuteMatch = duration.match(/(\d+)m/);
    if (hourMatch) totalMinutes += parseInt(hourMatch[1]) * 60;
    if (minuteMatch) totalMinutes += parseInt(minuteMatch[1]);
    return totalMinutes;
  }, []);

  const getCourseModules = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? [...course.modules].sort((a, b) => (a.order || 0) - (b.order || 0)) : [];
  };

  const getModuleProgress = (moduleId: string) => {
    return progress.find(p => p.moduleId === moduleId);
  };

  const getCourseProgress = (courseId: string) => {
    const courseModules = getCourseModules(courseId);
    if (courseModules.length === 0) return 0;
    
    const completedModules = courseModules.filter(module => {
      const moduleProgress = getModuleProgress(module.id);
      return moduleProgress?.completed;
    }).length;
    
    return Math.round((completedModules / courseModules.length) * 100);
  };

  const isModuleUnlocked = (module: CourseModule) => {
    const courseModules = getCourseModules(module.courseId || '');
    const moduleIndex = courseModules.findIndex(m => m.id === module.id);
    
    if (moduleIndex === 0) return true;
    
    const previousModule = courseModules[moduleIndex - 1];
    const previousProgress = getModuleProgress(previousModule.id);
    return previousProgress?.completed || false;
  };

  const getResumeModule = (courseId: string): CourseModule | null => {
    const courseModules = getCourseModules(courseId);
    if (courseModules.length === 0) return null;
    
    const unlockedModules = courseModules.filter(isModuleUnlocked);
    
    const lastModuleId = courseLastModules[courseId];
    let resumeModule = lastModuleId ? courseModules.find(m => m.id === lastModuleId) : null;
    
    if (resumeModule && getModuleProgress(resumeModule.id)?.completed) {
      resumeModule = null;
    }
    
    if (!resumeModule) {
      resumeModule = unlockedModules.find(m => !getModuleProgress(m.id)?.completed) || unlockedModules[0];
    }
    
    return resumeModule;
  };

  const toggleCourseExpansion = (courseId: string) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  const handleSelectModule = (module: CourseModule) => {
    if (isModuleUnlocked(module)) {
      setSelectedModule(module);
      setCourseLastModules(prev => ({
        ...prev,
        [module.courseId || '']: module.id
      }));
    }
  };

  const toggleBookmark = (courseId: string) => {
    setBookmarkedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId) 
        : [...prev, courseId]
    );
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || course.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return (b.createdAt || 0) - (a.createdAt || 0); // Assuming courses have createdAt timestamp
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      case 'duration':
        return parseDuration(a.duration) - parseDuration(b.duration);
      case 'level':
        const levels = { beginner: 0, intermediate: 1, advanced: 2 };
        return levels[a.level] - levels[b.level];
      default:
        return 0;
    }
  });

  const enrolledCourses = filteredCourses.filter(course => 
    enrollments.some(e => e.courseId === course.id && e.status === 'active')
  );

  const completedCourses = filteredCourses.filter(course => 
    enrollments.some(e => e.courseId === course.id && e.status === 'completed')
  );

  const bookmarkedFiltered = filteredCourses.filter(course => 
    bookmarkedCourses.includes(course.id)
  );

  const getCoursesToShow = () => {
    switch (activeTab) {
      case 'enrolled': return enrolledCourses;
      case 'completed': return completedCourses;
      case 'bookmarked': return bookmarkedFiltered;
      default: return filteredCourses;
    }
  };

  const renderCourseCard = (course: Course) => {
    const courseProgress = getCourseProgress(course.id);
    const isEnrolled = enrollments.some(e => e.courseId === course.id && e.status === 'active');
    const isCompleted = enrollments.some(e => e.courseId === course.id && e.status === 'completed');
    const courseModules = getCourseModules(course.id);
    const category = categories.find(c => c.id === course.categoryId);
    const isBookmarked = bookmarkedCourses.includes(course.id);
    
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
          
          <div className="mt-4 flex items-center gap-2">
            {!isEnrolled && !isCompleted ? (
              <button
                onClick={() => onEnroll(course.id)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm transition"
              >
                Enroll Now
              </button>
            ) : (
              <button
                onClick={() => {
                  setSelectedCourse(course);
                  const resumeModule = getResumeModule(course.id);
                  if (resumeModule && !isCompleted) {
                    handleSelectModule(resumeModule);
                  }
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold text-sm transition"
              >
                {isCompleted ? 'Review Course' : 'Continue Learning'}
              </button>
            )}
            
            <button
              onClick={() => toggleBookmark(course.id)}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
            >
              <Heart className={`h-5 w-5 ${isBookmarked ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
            </button>
            
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
          
          {isCompleted && (
            <button
              onClick={() => console.log('Download certificate for', course.id)} // Replace with actual handler
              className="mt-4 w-full px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold text-sm transition flex items-center justify-center gap-2"
            >
              <Award className="h-4 w-4" /> Download Certificate
            </button>
          )}
        </div>
        
        {expandedCourses[course.id] && (
          <div className="border-t border-gray-700 bg-gray-900/30">
            <div className="p-5">
              <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4" /> Course Modules
              </h4>
              
              <div className="space-y-3">
                {courseModules.map((module, index) => {
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

  const renderCourseDetail = () => {
    if (!selectedCourse) return null;
    
    const courseModules = getCourseModules(selectedCourse.id);
    const courseProgress = getCourseProgress(selectedCourse.id);
    const isEnrolled = enrollments.some(e => e.courseId === selectedCourse.id && e.status === 'active');
    const isCompleted = courseProgress === 100;
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
                  onClick={() => onEnroll(selectedCourse.id)}
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
                    onClick={() => {
                      const resumeModule = getResumeModule(selectedCourse.id);
                      if (resumeModule) handleSelectModule(resumeModule);
                    }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition"
                  >
                    {courseProgress > 0 ? 'Continue Learning' : 'Start Course'}
                  </button>
                  {isCompleted && (
                    <button
                      onClick={() => console.log('Download certificate for', selectedCourse.id)} // Replace with actual handler
                      className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition mt-2 flex items-center justify-center gap-2"
                    >
                      <Award className="h-4 w-4" /> Download Certificate
                    </button>
                  )}
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
            {courseModules.map((module, index) => {
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

  const renderModuleDetail = () => {
    if (!selectedModule) return null;
    
    const moduleProgress = getModuleProgress(selectedModule.id);
    const isCompleted = moduleProgress?.completed;
    
    const getEmbedUrl = (url: string | undefined) => {
      if (!url) return null;
      if (url.includes('youtube.com/watch')) {
        const videoId = url.split('v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return url;
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
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No video content available
                </div>
              )}
            </div>
          ) : (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{selectedModule.title}</h2>
              <p className="text-gray-300">{selectedModule.content}</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          {!isCompleted && (
            <button
              onClick={() => onCompleteModule(selectedModule.id)}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition"
            >
              Mark as Complete
            </button>
          )}
        </div>
      </div>
    );
  };

  if (selectedModule) return renderModuleDetail();
  if (selectedCourse) return renderCourseDetail();

  return (
    <div className="text-white">
      <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
        <GraduationCap className="h-8 w-8 text-blue-500" /> Courses
      </h1>
      
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('all')} className={activeTab === 'all' ? 'bg-blue-600' : 'bg-gray-700'}>All</button>
        <button onClick={() => setActiveTab('enrolled')} className={activeTab === 'enrolled' ? 'bg-blue-600' : 'bg-gray-700'}>Enrolled</button>
        <button onClick={() => setActiveTab('completed')} className={activeTab === 'completed' ? 'bg-blue-600' : 'bg-gray-700'}>Completed</button>
        <button onClick={() => setActiveTab('bookmarked')} className={activeTab === 'bookmarked' ? 'bg-blue-600' : 'bg-gray-700'}>Bookmarked</button>
      </div>
      
      <div className="flex gap-4 mb-4">
        <input 
          type="text" 
          placeholder="Search..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
          className="bg-gray-800 p-2 rounded"
        />
        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="bg-gray-800 p-2 rounded">
          <option value="all">All Categories</option>
          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="bg-gray-800 p-2 rounded">
          <option value="newest">Newest</option>
          <option value="alphabetical">Alphabetical</option>
          <option value="duration">Duration</option>
          <option value="level">Level</option>
        </select>
      </div>
      
      <div className="space-y-4">
        {getCoursesToShow().map(renderCourseCard)}
      </div>
    </div>
  );
};

export default EnhancedCourseViewer;