import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Video, FileText, AlignLeft, ArrowLeft, Save } from 'lucide-react';
import { authService } from '../lib/auth';
import { dbService } from '../lib/db';

export default function CreateCourse() {
  const { courseId } = useParams();
  const [title, setTitle] = useState('');
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [originalCreatedAt, setOriginalCreatedAt] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (courseId) {
      const fetchCourse = async () => {
        try {
          const course = await dbService.getById('courses', courseId);
          if (course) {
            setTitle(course.title || '');
            setModules(course.modules || []);
            setOriginalCreatedAt(course.createdAt || null);
          }
        } catch (e) {
          console.error("Error fetching course:", e);
        }
      };
      fetchCourse();
    }
  }, [courseId]);

  const handleAddModule = () => {
    setModules([...modules, { 
      id: crypto.randomUUID(), 
      title: '', 
      description: '', 
      videoUrl: '', 
      videoFile: null, 
      pdfFile: null 
    }]);
  };

  const handleUpdateModule = (id, field, value) => {
    setModules(modules.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleRemoveModule = (id) => {
    setModules(modules.filter(m => m.id !== id));
  };

  // Basic utility to convert file to data URL for mock saving
  const getBase64 = (file) => new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  const handleSave = async () => {
    if (!title) return alert('Course title is required');
    if (modules.length === 0) return alert('Add at least one module');
    
    setLoading(true);
    try {
      const user = authService.getCurrentUser();
      
      // Process files (in a real app, upload to S3/Firebase Storage, here we use base64 for IndexedDB mock)
      const processedModules = await Promise.all(modules.map(async (m) => ({
        ...m,
        pdfData: m.pdfFile ? await getBase64(m.pdfFile) : m.pdfData,
        pdfFile: undefined // don't store raw file object
      })));

      const newCourse = {
        id: courseId || crypto.randomUUID(),
        developerId: user.id,
        title,
        modules: processedModules,
        createdAt: originalCreatedAt || new Date().toISOString()
      };

      await dbService.put('courses', newCourse);
      
      // Update streak natively
      const lastActive = user.lastActive ? new Date(user.lastActive) : new Date(0);
      const today = new Date();
      let newStreak = user.streak || 0;
      if (today.toDateString() !== lastActive.toDateString()) {
         newStreak += 1;
      }
      await authService.updateProfile(user.id, { streak: newStreak, lastActive: today.toISOString() });

      navigate('/developer');
    } catch (e) {
      alert('Error saving course: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full animate-fade-in pb-20 mt-4">
      <div className="flex items-center gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft size={24} className="text-gray-600" /></button>
        <div>
           <h1 className="text-3xl font-bold text-gray-900">{courseId ? 'Edit Course' : 'Create New Course'}</h1>
           <p className="text-gray-500">{courseId ? 'Update your curriculum and materials.' : 'Design your curriculum and upload materials.'}</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <label className="block text-sm font-bold text-gray-700 mb-2">Course Title</label>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-xl px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
          placeholder="e.g. Master React in 10 Days"
        />
      </div>



      <div className="mt-12 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Modules</h2>
        <p className="text-gray-500 mb-6">Build your curriculum by adding modules with content.</p>
        
        <div className="space-y-6">
          {modules.map((mod, mIndex) => (
            <div key={mod.id} className="p-6 border-2 border-indigo-100 bg-indigo-50/30 rounded-2xl relative group">
              <button onClick={() => handleRemoveModule(mod.id)} className="absolute top-6 right-6 p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 size={18} />
              </button>
              
              <h3 className="font-bold text-indigo-700 flex items-center gap-2 mb-4 text-lg">
                <span className="bg-indigo-100 w-8 h-8 rounded-full flex items-center justify-center text-indigo-700">{mIndex + 1}</span> 
                Module
              </h3>
              
              <input 
                type="text" 
                value={mod.title} 
                onChange={(e) => handleUpdateModule(mod.id, 'title', e.target.value)}
                className="w-full mb-4 text-lg font-semibold px-4 py-3 bg-white rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Module Title (e.g. Getting Started)"
              />
              
              <textarea 
                value={mod.description} 
                onChange={(e) => handleUpdateModule(mod.id, 'description', e.target.value)}
                className="w-full mb-6 text-sm px-4 py-3 bg-white rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="Module Description (Optional)"
                rows="3"
              />
              
              <div className="space-y-4 pl-4 md:pl-8 border-l-2 border-indigo-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-indigo-100 rounded-xl p-4 bg-white shadow-sm">
                     <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Video size={16} className="text-indigo-500"/> Video File</label>
                     <input type="file" accept="video/*" onChange={(e) => handleUpdateModule(mod.id, 'videoFile', e.target.files[0])} className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors" />
                     {mod.videoFile && <p className="mt-2 text-sm text-green-600 truncate font-medium">Selected: {mod.videoFile.name}</p>}
                     
                     <div className="flex items-center gap-2 my-4">
                       <div className="h-px bg-gray-200 flex-1"></div>
                       <span className="text-xs text-gray-400 font-bold uppercase">OR</span>
                       <div className="h-px bg-gray-200 flex-1"></div>
                     </div>
                     
                     <label className="block text-sm font-bold text-gray-700 mb-2">Video URL (e.g. YouTube)</label>
                     <input type="text" value={mod.videoUrl} onChange={(e) => handleUpdateModule(mod.id, 'videoUrl', e.target.value)} className="w-full text-sm px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="https://..." />
                  </div>
                  
                  <div className="border border-indigo-100 rounded-xl p-4 bg-white shadow-sm">
                     <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><FileText size={16} className="text-indigo-500"/> PDF Document / Notes</label>
                     <input type="file" accept=".pdf" onChange={(e) => handleUpdateModule(mod.id, 'pdfFile', e.target.files[0])} className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors" />
                     {mod.pdfFile ? (
                       <p className="mt-2 text-sm text-green-600 truncate font-medium">Selected: {mod.pdfFile.name}</p>
                     ) : mod.pdfData ? (
                       <p className="mt-2 text-sm text-indigo-600 truncate font-medium">Existing PDF uploaded</p>
                     ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <button onClick={handleAddModule} className="w-full py-4 mt-4 border-2 border-dashed border-indigo-300 rounded-2xl text-indigo-600 font-bold hover:border-indigo-500 hover:bg-indigo-50 transition-all flex justify-center items-center gap-3">
            <Plus size={20} /> Add New Module
          </button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-sm border-t border-gray-200 flex justify-center z-40 transform translate-y-0 transition-transform">
        <div className="w-full max-w-4xl flex justify-end gap-4 items-center">
           <button onClick={() => navigate('/developer')} className="px-6 py-3 font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
           <button onClick={handleSave} disabled={loading} className="px-8 py-3 bg-primary-600 text-white font-bold text-lg rounded-xl hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-1 transform disabled:opacity-50">
             <Save size={20} /> {loading ? 'Saving to Database...' : (courseId ? 'Save Changes' : 'Save & Publish Course')}
           </button>
        </div>
      </div>
    </div>
  );
}
