import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { BookOpen, Video, FileText, CheckSquare, User, LogOut } from 'lucide-react';

export default function StudentDashboard() {
  const location = useLocation();

  const navItems = [
    { label: 'My Courses', path: '/student', icon: <BookOpen className="w-5 h-5" /> },
    { label: 'Classes', path: '/student/classes', icon: <Video className="w-5 h-5" /> },
    { label: 'Notes', path: '/student/notes', icon: <FileText className="w-5 h-5" /> },
    { label: 'Tests', path: '/student/tests', icon: <CheckSquare className="w-5 h-5" /> },
    { label: 'Profile', path: '/student/profile', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] w-full bg-light">
      {/* Sidebar for Desktop, Bottom Nav for Mobile */}
      <nav className="w-full md:w-64 bg-white border-r border-gray-100 flex-shrink-0 order-last md:order-first fixed bottom-0 md:relative z-20 border-t md:border-t-0 flex md:flex-col justify-around md:justify-start px-2 py-3 md:p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:shadow-none">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 rounded-xl transition-all ${isActive ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              {item.icon}
              <span className="text-xs md:text-sm">{item.label}</span>
            </Link>
          );
        })}
        <Link to="/" className="hidden md:flex flex-row items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all mt-auto">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-semibold">Logout</span>
        </Link>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 bg-light mb-16 md:mb-0 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/profile" element={<div className="p-4 bg-white rounded-2xl shadow-sm">Profile Details</div>} />
        </Routes>
      </main>
    </div>
  );
}

// Sub-components for Student Dashboard

function Overview() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Enrolled Courses" value="3" color="bg-blue-50 text-blue-600" />
        <StatCard title="Tests Completed" value="12" color="bg-green-50 text-green-600" />
        <StatCard title="Avg. Score" value="78%" color="bg-purple-50 text-purple-600" />
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold mb-4">Recent Classes</h3>
        <p className="text-gray-500 text-sm">You have no recent classes.</p>
      </div>
    </div>
  );
}

function StatCard({title, value, color}) {
  return (
    <div className={`p-6 rounded-2xl ${color} border border-transparent`}>
      <div className="text-sm font-medium mb-2 opacity-80">{title}</div>
      <div className="text-3xl font-extrabold">{value}</div>
    </div>
  );
}

function Classes() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Video Classes</h2>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {/* Mock Data */}
        {[1,2,3,4].map(i => (
          <Link to={`/course/${i}`} key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group cursor-pointer hover:shadow-md transition-all block">
            <div className="h-40 bg-gray-200 w-full relative flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6 ml-1" />
              </div>
            </div>
            <div className="p-4">
              <div className="text-xs font-bold text-primary-600 mb-1">Paper {i > 2 ? '2' : '1'}</div>
              <h4 className="font-bold mb-1">Teaching Aptitude - Part {i}</h4>
              <p className="text-sm text-gray-500 line-clamp-2">Understanding the basic concepts of teaching and leaning dynamics.</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Notes() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Study Materials & Notes</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {[1,2,3].map(i => (
             <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
               <div className="flex items-center gap-4">
                 <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                    <FileText className="w-6 h-6" />
                 </div>
                 <div>
                   <h4 className="font-bold text-sm sm:text-base">Research Methodology Chapter {i}</h4>
                   <p className="text-xs text-gray-400">PDF Document • 2.4 MB</p>
                 </div>
               </div>
               <button className="px-4 py-2 text-sm font-semibold text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100">Download</button>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Tests() {
  return (
    <div>
       <h2 className="text-2xl font-bold mb-6">Mock Tests</h2>
       <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
         {[1,2].map(i => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-lg mb-1">Full Length Mock - Paper {i}</h4>
                  <p className="text-sm text-gray-500">50 Questions • 60 Minutes</p>
                </div>
                <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">New</span>
              </div>
              <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end">
                <Link to={`/test/${i}`} className="px-6 py-2 bg-dark text-white rounded-lg font-semibold hover:bg-black transition-colors block text-center">Start Test</Link>
              </div>
            </div>
         ))}
       </div>
    </div>
  );
}
