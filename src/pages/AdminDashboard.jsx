import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Layers, Settings, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Students', path: '/admin/students', icon: <Users className="w-5 h-5" /> },
    { label: 'Courses', path: '/admin/courses', icon: <BookOpen className="w-5 h-5" /> },
    { label: 'Content (Videos/Notes)', path: '/admin/content', icon: <Layers className="w-5 h-5" /> },
    { label: 'Tests', path: '/admin/tests', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] w-full bg-light">
      <nav className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 order-last md:order-first fixed bottom-0 md:relative z-20 flex md:flex-col justify-around md:justify-start px-2 py-3 md:p-6 pb-safe">
        <div className="hidden md:block text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 ml-3">Admin Panel</div>
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 rounded-xl transition-all ${isActive ? 'bg-primary-600 text-white font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              {item.icon}
              <span className="text-xs md:text-sm">{item.label}</span>
            </Link>
          );
        })}
        <Link to="/" className="hidden md:flex flex-row items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all mt-auto">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-semibold">Logout</span>
        </Link>
      </nav>

      <main className="flex-1 p-4 sm:p-6 md:p-8 bg-slate-50 mb-16 md:mb-0 overflow-y-auto">
        <Routes>
          <Route path="/" element={<AdminOverview />} />
          <Route path="/courses" element={<AdminCourses />} />
          {/* Implement other routes similarly */}
        </Routes>
      </main>
    </div>
  );
}

function AdminOverview() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Admin Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value="1,245" color="border-l-4 border-blue-500 bg-white" />
        <StatCard title="Active Courses" value="8" color="border-l-4 border-green-500 bg-white" />
        <StatCard title="Study Materials" value="142" color="border-l-4 border-purple-500 bg-white" />
        <StatCard title="Tests Created" value="24" color="border-l-4 border-orange-500 bg-white" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mt-8">
        <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
        <p className="text-slate-500">No recent activity to display.</p>
      </div>
    </div>
  );
}

function StatCard({title, value, color}) {
  return (
    <div className={`p-6 rounded-2xl shadow-sm ${color}`}>
      <div className="text-sm font-medium text-slate-500 mb-1">{title}</div>
      <div className="text-3xl font-extrabold text-slate-900">{value}</div>
    </div>
  );
}

function AdminCourses() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Manage Courses</h2>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 text-sm">
          + Add New Course
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-sm font-semibold text-slate-600">Course Name</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Subject</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Students</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="p-4 font-medium">UGC NET Paper 1 Complete</td>
              <td className="p-4 text-slate-600">General Paper</td>
              <td className="p-4 text-slate-600">842</td>
              <td className="p-4">
                <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">Edit</button>
              </td>
            </tr>
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="p-4 font-medium">Education Paper 2 Mastery</td>
              <td className="p-4 text-slate-600">Education</td>
              <td className="p-4 text-slate-600">403</td>
              <td className="p-4">
                <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
