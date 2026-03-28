import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlayCircle, FileText, CheckCircle2, AlignLeft, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { dbService } from '../lib/db';

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('text'); // 'video' | 'notes' | 'text'
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [videoObjUrl, setVideoObjUrl] = useState(null);

  useEffect(() => {
    if (course && course.modules && course.modules.length > 0) {
      const activeMod = course.modules[activeModuleIndex];
      if (activeMod && activeMod.videoFile) {
        const url = URL.createObjectURL(activeMod.videoFile);
        setVideoObjUrl(url);
        return () => URL.revokeObjectURL(url);
      } else {
        setVideoObjUrl(null);
      }
    }
  }, [course, activeModuleIndex]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await dbService.getById('courses', courseId);
        if (!data) {
           alert("Course not found!");
           navigate('/learner');
           return;
        }
        setCourse(data);
        
        // Auto select first available tab for the active module
        if (data.modules && data.modules.length > 0) {
           const firstMod = data.modules[0];
           if (firstMod.videoFile || firstMod.videoUrl) setActiveTab('video');
           else if (firstMod.description) setActiveTab('text');
           else if (firstMod.pdfData) setActiveTab('notes');
        }
        
      } catch (e) {
        console.error("Error fetching course", e);
      }
      setLoading(false);
    };
    fetchCourse();
  }, [courseId, navigate]);

  if (loading) return <div className="p-20 text-center font-bold text-gray-500 animate-pulse text-xl">Loading Course Player...</div>;
  if (!course || course.modules.length === 0) return <div className="p-20 text-center"><h2 className="text-2xl font-bold">No modules available in this course.</h2><Link to="/learner" className="text-primary-600 mt-4 block">Go back to dashboard</Link></div>;

  const activeModule = course.modules[activeModuleIndex];

  // Helper to safely trigger download for Base64 PDF
  const handleDownloadPdf = (base64, filename) => {
    if (!base64) return;
    const link = document.createElement('a');
    link.href = base64;
    link.download = filename || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen pb-16 md:pb-0 font-sans">
      <header className="bg-white px-4 md:px-6 py-4 shadow-sm flex items-center justify-between sticky top-0 z-20 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <Link to="/learner" className="text-gray-500 hover:text-gray-900 transition-colors p-2 -ml-2 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="font-extrabold text-xl leading-tight text-gray-900 line-clamp-1">{course.title}</h1>
            <p className="text-xs text-primary-600 font-bold tracking-wider uppercase mt-1">Module {activeModuleIndex + 1} of {course.modules.length}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-0 sm:p-4 lg:p-6 gap-6 xl:gap-8 lg:items-start">
        {/* Main Content Area (Player) */}
        <div className="flex-1 flex flex-col bg-white sm:rounded-3xl shadow-sm border-x sm:border border-gray-200 overflow-hidden lg:min-w-[700px]">
          
          {/* Dynamic Media Viewer based on Current Component */}
          {activeTab === 'video' && (activeModule.videoFile || activeModule.videoUrl) ? (
            <div className="w-full aspect-video bg-gray-900 relative flex items-center justify-center overflow-hidden">
               {videoObjUrl ? (
                  <video src={videoObjUrl} controls className="w-full h-full object-contain" />
               ) : activeModule.videoUrl ? (
                  <iframe 
                    src={activeModule.videoUrl.includes('watch?v=') ? activeModule.videoUrl.replace('watch?v=', 'embed/') : activeModule.videoUrl} 
                    className="w-full h-full" 
                    allowFullScreen 
                  ></iframe>
               ) : (
                  <div className="text-gray-500 font-bold p-8 text-center">No video provided for this module.</div>
               )}
            </div>
          ) : activeTab === 'notes' && activeModule.pdfData ? (
            <div className="w-full h-64 bg-slate-100 border-b border-gray-200 flex flex-col items-center justify-center border-dashed">
                <FileText size={64} className="text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium mb-4">PDF Document Attached</p>
                <button onClick={() => handleDownloadPdf(activeModule.pdfData, `Module_${activeModuleIndex+1}_Notes.pdf`)} className="px-6 py-2 bg-primary-100 text-primary-700 font-bold rounded-xl hover:bg-primary-200 transition-colors">
                  Download PDF Notes
                </button>
            </div>
          ) : null}

          <div className="p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-gray-900 leading-snug">{activeModule.title}</h2>
            
            <div className="flex border-b border-gray-200 mb-8 bg-gray-50 p-1 rounded-xl w-fit">
              {(activeModule.videoFile || activeModule.videoUrl) && (
                <button 
                  onClick={() => setActiveTab('video')}
                  className={`py-2 px-6 font-bold text-sm rounded-lg transition-all ${activeTab === 'video' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <Video size={16} className="inline mr-2 -mt-0.5" />Video
                </button>
              )}
              {activeModule.description && (
                <button 
                  onClick={() => setActiveTab('text')}
                  className={`py-2 px-6 font-bold text-sm rounded-lg transition-all ${activeTab === 'text' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <AlignLeft size={16} className="inline mr-2 -mt-0.5" />Description
                </button>
              )}
              {activeModule.pdfData && (
                <button 
                  onClick={() => setActiveTab('notes')}
                  className={`py-2 px-6 font-bold text-sm rounded-lg transition-all ${activeTab === 'notes' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <FileText size={16} className="inline mr-2 -mt-0.5" />Attached PDF
                </button>
              )}
            </div>

            {/* Render Text Content if Text Tab Content is active */}
            {activeTab === 'text' && activeModule.description && (
               <div className="text-gray-700 space-y-4 text-base leading-relaxed bg-gray-50 p-6 sm:p-8 rounded-2xl border border-gray-100 whitespace-pre-wrap font-medium">
                 {activeModule.description}
               </div>
            )}
            
            {activeTab === 'notes' && activeModule.pdfData && (
                <div className="flex items-center justify-between p-6 border-2 border-gray-100 rounded-2xl bg-white hover:border-primary-200 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-red-50 text-red-500 rounded-xl"><FileText className="w-8 h-8"/></div>
                     <div>
                       <div className="font-bold text-gray-900 text-lg">Module Notes</div>
                       <div className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-2">
                           <CheckCircle2 size={14} className="text-green-500" />
                           Available for download
                       </div>
                     </div>
                  </div>
                  <button onClick={() => handleDownloadPdf(activeModule.pdfData, `Module_${activeModuleIndex+1}_Notes.pdf`)} className="px-5 py-2.5 font-bold bg-primary-600 text-white rounded-xl shadow-md hover:bg-primary-700 hover:-translate-y-0.5 transition-all">Download</button>
                </div>
            )}
            
          </div>
        </div>

        {/* Sidebar (Course Modules Content) */}
        <div className="w-full lg:w-96 bg-white sm:rounded-3xl shadow-sm border-y sm:border border-gray-200 flex flex-col shrink-0 h-fit lg:sticky lg:top-24 max-h-[calc(100vh-8rem)]">
          <div className="p-6 border-b border-gray-100 bg-gray-50 rounded-t-3xl">
            <h3 className="font-extrabold text-gray-900 text-xl flex items-center gap-2"><BookOpen size={20} className="text-primary-500"/> Syllabus</h3>
            <div className="text-sm text-gray-500 font-bold mt-2">{activeModuleIndex + 1}/{course.modules.length} Modules Selected</div>
            <div className="w-full h-2 bg-gray-200 rounded-full mt-3 overflow-hidden shadow-inner">
               <div className="h-full bg-primary-500 transition-all duration-500" style={{ width: `${((activeModuleIndex + 1) / course.modules.length) * 100}%` }}></div>
            </div>
          </div>
          
          <div className="overflow-y-auto p-3 space-y-2">
            {course.modules.map((mod, idx) => {
              const isActive = idx === activeModuleIndex;
              return (
                 <button 
                   key={mod.id}
                   onClick={() => {
                      setActiveModuleIndex(idx);
                      if (mod.videoFile || mod.videoUrl) setActiveTab('video');
                      else if (mod.description) setActiveTab('text');
                      else if (mod.pdfData) setActiveTab('notes');
                   }}
                   className={`w-full flex items-start text-left gap-4 p-4 rounded-2xl transition-all ${isActive ? 'bg-primary-50 border-2 border-primary-100 shadow-sm' : 'border-2 border-transparent hover:bg-gray-50 hover:border-gray-100'}`}
                 >
                   <div className="mt-1 shrink-0">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${isActive ? 'border-primary-500 bg-primary-100 text-primary-700' : 'border-gray-300 text-gray-400 bg-white'}`}>
                        {idx + 1}
                      </div>
                   </div>
                   <div>
                     <div className={`font-bold text-base leading-snug line-clamp-2 ${isActive ? 'text-primary-900' : 'text-gray-800'}`}>
                       {mod.title}
                     </div>
                     <div className="flex gap-2 mt-2">
                        {(mod.videoFile || mod.videoUrl) && <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold text-gray-500 uppercase">Video</span>}
                        {mod.pdfData && <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold text-gray-500 uppercase">PDF</span>}
                        {mod.description && <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold text-gray-500 uppercase">Text</span>}
                     </div>
                   </div>
                 </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
