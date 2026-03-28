import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { authService } from '../lib/auth';
import { dbService } from '../lib/db';
import { useState, useEffect } from 'react';
import { PlayCircle, Search, BookOpen, Clock, CheckCircle } from 'lucide-react';

function DashboardMain() {
  const user = authService.getCurrentUser();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [activeTab, setActiveTab] = useState('discover'); // 'discover' | 'enrolled'
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allCourses = await dbService.getAll('courses');
        const userEnrollments = await dbService.findEnrollmentsByLearner(user.id);
        setCourses(allCourses);
        setEnrollments(userEnrollments);
      } catch (e) {
        console.error("Error fetching data", e);
      }
      setLoading(false);
    };
    fetchData();
  }, [user.id]);

  const handleEnroll = async (courseId) => {
    try {
      const newEnrollment = {
        id: crypto.randomUUID(),
        learnerId: user.id,
        courseId,
        progress: 0,
        enrolledAt: new Date().toISOString()
      };
      await dbService.put('enrollments', newEnrollment);
      setEnrollments([...enrollments, newEnrollment]);
      setActiveTab('enrolled');
    } catch (e) {
      alert("Failed to enroll: " + e.message);
    }
  };

  const enrolledCourseIds = enrollments.map(e => e.courseId);
  const enrolledCoursesList = courses.filter(c => enrolledCourseIds.includes(c.id));
  const discoverCoursesList = courses.filter(c => !enrolledCourseIds.includes(c.id) && c.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in mt-4">
      {/* Hero Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -translate-y-32 translate-x-32 blur-3xl opacity-60"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Welcome Back, {user?.username}!</h1>
          <p className="text-gray-500 text-lg">Ready to master something new today?</p>
        </div>
        <div className="flex gap-4 relative z-10">
           <div className="bg-indigo-50 px-5 py-4 rounded-2xl border border-indigo-100 flex flex-col items-center">
              <span className="text-3xl font-black text-indigo-600">{enrolledCoursesList.length}</span>
              <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider mt-1">Enrolled</span>
           </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('discover')} 
          className={`pb-4 px-6 text-lg font-bold transition-all relative ${activeTab === 'discover' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-800'}`}
        >
          Discover Courses
          {activeTab === 'discover' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('enrolled')} 
          className={`pb-4 px-6 text-lg font-bold transition-all relative ${activeTab === 'enrolled' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-800'}`}
        >
          My Learning
          {activeTab === 'enrolled' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full"></div>}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500 flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            Loading platform content...
        </div>
      ) : activeTab === 'discover' ? (
        <div className="space-y-6">
           {/* Search Bar */}
           <div className="relative w-full max-w-md">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
             <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search for a course..." className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm" />
           </div>

           {discoverCoursesList.length === 0 ? (
             <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
               <Search size={48} className="mx-auto text-gray-300 mb-4" />
               <h3 className="text-xl font-bold text-gray-700">No courses found</h3>
               <p className="text-gray-500 mt-2">Try adjusting your search or come back later for new content.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {discoverCoursesList.map(course => (
                  <div key={course.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-2 flex flex-col h-full">
                    <div className="h-48 bg-gray-900 bg-gradient-to-br from-indigo-900 via-primary-900 to-primary-700 p-6 flex items-end">
                      <h3 className="text-2xl font-bold text-white leading-tight drop-shadow-md">{course.title}</h3>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex gap-4 text-sm font-semibold text-gray-600 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100 w-fit">
                        <div className="flex items-center gap-2"><BookOpen size={16} className="text-primary-500"/> {course.modules?.length || 0} Modules</div>
                      </div>
                      <div className="mt-auto pt-4 border-t border-gray-100">
                         <button onClick={() => handleEnroll(course.id)} className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl transition-colors">
                           Enroll Now
                         </button>
                      </div>
                    </div>
                  </div>
               ))}
             </div>
           )}
        </div>
      ) : (
        <div className="space-y-6">
           {enrolledCoursesList.length === 0 ? (
             <div className="bg-white p-16 text-center rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center group">
                <div className="bg-indigo-50 p-6 rounded-full mb-6 text-indigo-500 group-hover:scale-110 group-hover:bg-indigo-100 transition-all transform">
                  <PlayCircle size={64} />
                </div>
                <h3 className="text-2xl font-black text-gray-800 mb-3">Not Enrolled Yet</h3>
                <p className="text-gray-500 mw-md mb-8 text-lg">You haven't enrolled in any courses. Explore the platform and start learning!</p>
                <button onClick={() => setActiveTab('discover')} className="px-8 py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30">
                  Discover Courses
                </button>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {enrolledCoursesList.map(course => (
                  <div key={course.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-2 flex flex-col h-full border-b-4 border-b-primary-500">
                    <div className="h-40 bg-gray-900 bg-gradient-to-tr from-gray-800 to-indigo-900 p-6 flex flex-col justify-end relative">
                      <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold border border-white/30 flex items-center gap-1"><CheckCircle size={12}/> Enrolled</div>
                      <h3 className="text-2xl font-bold text-white leading-tight drop-shadow-md line-clamp-2">{course.title}</h3>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <p className="text-sm text-gray-500 mb-6 flex items-center gap-1"><Clock size={14}/> Started {new Date(enrollments.find(e => e.courseId === course.id)?.enrolledAt || Date.now()).toLocaleDateString()}</p>
                      <div className="mt-auto pt-4 border-t border-gray-100">
                         <Link to={`/course/${course.id}/learn`} className="w-full flex justify-center items-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors shadow-md hover:shadow-lg">
                           <PlayCircle size={20} /> Continue Learning
                         </Link>
                      </div>
                    </div>
                  </div>
               ))}
             </div>
           )}
        </div>
      )}
    </div>
  );
}

export default function LearnerDashboard() {
  return (
    <Routes>
      <Route path="/" element={<DashboardMain />} />
    </Routes>
  );
}
