import { Routes, Route, Link } from 'react-router-dom';
import { authService } from '../lib/auth';
import { dbService } from '../lib/db';
import { useState, useEffect } from 'react';
import CreateCourse from './CreateCourse';
import { PlusCircle, BookOpen, Clock } from 'lucide-react';

function DashboardStats() {
  const user = authService.getCurrentUser();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoursesAndCheckStreak = async () => {
      try {
        // Enforce Streak Rules
        const currentUser = await dbService.getById('users', user.id);
        if (currentUser) {
            let newStreak = currentUser.streak || 0;
            const lastActive = new Date(currentUser.lastActive || currentUser.createdAt);
            const today = new Date();
            
            const lastActiveZero = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
            const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            
            const diffDays = Math.round((todayZero - lastActiveZero) / (1000 * 60 * 60 * 24));
            
            let requiresUpdate = false;
            if (diffDays === 1) {
              newStreak += 1;
              requiresUpdate = true;
            } else if (diffDays > 1) {
              newStreak = 0; // Strictly reset to 0 as requested if missing for > 24 hours
              requiresUpdate = true;
            }
            
            if (requiresUpdate) {
               await authService.updateProfile(user.id, { streak: newStreak, lastActive: today.toISOString() });
               // Note: The UI will update automatically on next render or via the authService update,
               // but we can locally patch the user object for instant UI update
               user.streak = newStreak;
            }
        }

        const data = await dbService.findCoursesByDeveloper(user.id);
        setCourses(data);
      } catch (e) {
        console.error("Error fetching courses and streak", e);
      }
      setLoading(false);
    };
    fetchCoursesAndCheckStreak();
  }, [user.id]);

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in mt-4">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full -translate-y-32 translate-x-32 blur-3xl opacity-60"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Developer Dashboard</h1>
            <p className="text-gray-500 text-lg">Manage your courses, view analytics, and empower learners.</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex items-center gap-4 shadow-sm">
            <div className="text-4xl">🔥</div>
            <div>
               <p className="text-sm text-orange-800 font-semibold uppercase tracking-wider">Current Streak</p>
               <p className="text-3xl font-black text-orange-600">{user?.streak || 0} <span className="text-lg font-bold text-orange-500">Days</span></p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 px-6">
        <h2 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="text-primary-500"/> Your Library</h2>
        <Link to="/developer/create-course" className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:-translate-y-1">
          <PlusCircle size={20} />
          <span>Create New Course</span>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500 flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
            Loading your courses...
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white p-16 text-center rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center group">
          <div className="bg-primary-50 p-6 rounded-full mb-6 text-primary-500 group-hover:scale-110 group-hover:bg-primary-100 transition-all transform">
            <BookOpen size={64} />
          </div>
          <h3 className="text-2xl font-black text-gray-800 mb-3">No Courses Yet</h3>
          <p className="text-gray-500 mw-md mb-8 text-lg">You haven't created any courses. Start building your first course to share your knowledge with the world!</p>
          <Link to="/developer/create-course" className="px-8 py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30">
            Create First Course
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map(course => (
            <div key={course.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-2 group flex flex-col h-full">
              <div className="h-48 bg-gray-900 bg-gradient-to-tr from-gray-900 to-primary-900 p-6 flex flex-col justify-end relative">
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold border border-white/30">Published</div>
                <h3 className="text-2xl font-bold text-white leading-tight drop-shadow-md">{course.title}</h3>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex gap-4 text-sm font-semibold text-gray-600 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2"><BookOpen size={16} className="text-primary-500"/> {course.modules?.length || 0} Modules</div>
                  </div>
                </div>
                <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-auto">
                  <span className="text-xs font-bold text-gray-400 flex items-center gap-1 uppercase tracking-wider"><Clock size={14}/> {new Date(course.createdAt).toLocaleDateString()}</span>
                  <Link to={`/developer/edit-course/${course.id}`} className="text-primary-600 font-bold hover:text-primary-700 hover:bg-primary-50 px-4 py-2 rounded-lg transition-colors">Edit</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DeveloperDashboard() {
  return (
    <Routes>
      <Route path="/" element={<DashboardStats />} />
      <Route path="/create-course" element={<CreateCourse />} />
      <Route path="/edit-course/:courseId" element={<CreateCourse />} />
    </Routes>
  );
}
