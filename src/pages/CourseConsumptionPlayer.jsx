import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlayCircle, FileText, Video, AlignLeft, BookOpen, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { dbService } from '../lib/db';
import { authService } from '../lib/auth';

export default function CourseConsumptionPlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [videoObjUrl, setVideoObjUrl] = useState(null);

  useEffect(() => {
    const checkAccessAndFetch = async () => {
      try {
        const user = authService.getCurrentUser();
        const enrollments = await dbService.findEnrollmentsByLearner(user.id);
        const isEnrolled = enrollments.some(e => e.courseId === courseId);
        
        if (!isEnrolled) {
          alert("You are not enrolled in this course.");
          navigate('/learner');
          return;
        }

        const data = await dbService.getById('courses', courseId);
        if (!data) {
           alert("Course not found!");
           navigate('/learner');
           return;
        }
        setCourse(data);
      } catch (e) {
        console.error("Error fetching course", e);
      }
      setLoading(false);
    };
    checkAccessAndFetch();
  }, [courseId, navigate]);

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

  if (loading) return <div className="p-20 text-center font-bold text-gray-500 animate-pulse text-xl">Loading Course Content...</div>;
  if (!course) return null;

  console.log("COURSE LOADED:", course);
  const hasModules = course.modules && course.modules.length > 0;
  
  if (!hasModules) {
     return (
       <div className="p-20 text-center flex flex-col items-center">
         <h2 className="text-2xl font-bold text-gray-800">No modules available.</h2>
         <p className="text-gray-500 mt-2">Course Object Dump: {JSON.stringify(course, (key, value) => {
           if (typeof value === 'object' && value !== null && 'name' in value && 'size' in value) return 'FILE_OBJECT';
           return value;
         }, 2)}</p>
         <Link to={`/course/${course.id}`} className="px-6 py-3 bg-primary-600 text-white rounded-xl mt-6 font-bold hover:bg-primary-700 transition-colors shadow-lg">Go to Legacy Player</Link>
       </div>
     );
  }

  const activeModule = course.modules[activeModuleIndex];

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
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen font-sans w-full absolute top-0 left-0 right-0 z-50">
      <header className="bg-white px-4 md:px-6 py-4 shadow-sm flex items-center justify-between sticky top-0 z-20 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <Link to="/learner" className="text-gray-500 hover:text-gray-900 transition-colors p-2 -ml-2 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="font-extrabold text-xl leading-tight text-gray-900 line-clamp-1">{course.title}</h1>
            <p className="text-xs text-primary-600 font-bold tracking-wider uppercase mt-1">Module {activeModuleIndex + 1}: {activeModule?.title || 'Untitled'}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row w-full p-4 lg:p-6 gap-6 xl:gap-8 lg:items-start max-w-7xl mx-auto">
        
        {/* Sidebar (Course Modules Content) */}
        <div className="w-full lg:w-96 bg-white sm:rounded-3xl shadow-sm border border-gray-200 flex flex-col shrink-0 h-[300px] lg:h-[calc(100vh-8rem)] lg:sticky lg:top-24">
          <div className="p-6 border-b border-gray-100 bg-gray-50 rounded-t-3xl">
            <h3 className="font-extrabold text-gray-900 text-xl flex items-center gap-2"><BookOpen size={20} className="text-primary-500"/> Curriculum</h3>
          </div>
          
          <div className="overflow-y-auto p-3 space-y-2 flex-1">
            {course.modules.map((mod, mIdx) => {
              const isActive = mIdx === activeModuleIndex;
              return (
                <button 
                  key={mod.id}
                  onClick={() => setActiveModuleIndex(mIdx)}
                  className={`w-full text-left p-4 rounded-xl flex gap-4 transition-all border-2 ${isActive ? 'bg-primary-50 border-primary-200 shadow-sm' : 'border-transparent hover:bg-gray-50 hover:border-gray-100'}`}
                >
                  <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${isActive ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                    {mIdx + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`text-base font-bold line-clamp-2 ${isActive ? 'text-primary-900' : 'text-gray-800'}`}>{mod.title || 'Untitled Module'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {(mod.videoUrl || mod.videoFile) && <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-gray-500 bg-white border border-gray-200 shadow-sm px-2 py-0.5 rounded-md"><Video size={12} className={isActive ? 'text-primary-500' : 'text-gray-400'} /> Video</div>}
                      {(mod.pdfData) && <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-gray-500 bg-white border border-gray-200 shadow-sm px-2 py-0.5 rounded-md"><FileText size={12} className={isActive ? 'text-primary-500' : 'text-gray-400'} /> PDF</div>}
                    </div>
                  </div>
                </button>
              )
            })}
            {course.modules.length === 0 && <div className="p-8 text-sm text-gray-400 text-center font-medium italic">No modules in this course</div>}
          </div>
        </div>

        {/* Main Content Area (Player) */}
        <div className="flex-1 flex flex-col bg-white sm:rounded-3xl shadow-sm border border-gray-200 overflow-hidden lg:min-w-[600px]">
          {activeModule ? (
            <>
              {/* Video Player Area */}
              <div className="w-full aspect-video bg-gray-900 relative flex items-center justify-center overflow-hidden shrink-0">
                {videoObjUrl ? (
                  <video src={videoObjUrl} controls className="w-full h-full object-contain bg-black shadow-inner" />
                ) : activeModule.videoUrl ? (
                  <iframe 
                    src={activeModule.videoUrl.includes('watch?v=') ? activeModule.videoUrl.replace('watch?v=', 'embed/') : activeModule.videoUrl} 
                    className="w-full h-full" 
                    allowFullScreen 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  ></iframe>
                ) : (
                  <div className="text-gray-400 flex flex-col items-center p-8 text-center gap-3">
                    <Video size={48} className="opacity-40 mb-2" />
                    <span className="font-bold text-lg text-gray-300">No video for this module</span>
                    <span className="text-sm">Read the description or notes below.</span>
                  </div>
                )}
              </div>

              {/* Module Details */}
              <div className="p-6 md:p-8 flex-1">
                <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-gray-900 leading-snug">{activeModule.title || 'Untitled Module'}</h2>
                
                {activeModule.description ? (
                  <div className="mb-8 text-gray-700 text-base leading-relaxed bg-gray-50 p-6 rounded-2xl border border-gray-100 whitespace-pre-wrap font-medium shadow-inner">
                    {activeModule.description}
                  </div>
                ) : (
                  <div className="mb-8 text-gray-400 italic text-sm">No description provided for this module.</div>
                )}

                {/* PDF Area */}
                {activeModule.pdfData && (
                  <div className="mt-6 flex items-center justify-between p-5 md:p-6 border-2 border-primary-100 rounded-2xl bg-white hover:border-primary-200 transition-colors shadow-sm group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-red-50 text-red-500 rounded-xl group-hover:scale-105 transition-transform"><FileText size={28} className="drop-shadow-sm"/></div>
                      <div>
                        <div className="font-bold text-gray-900 text-lg">Module Notes</div>
                        <div className="text-sm font-bold text-gray-500 mt-0.5">PDF Document</div>
                      </div>
                    </div>
                    <button onClick={() => handleDownloadPdf(activeModule.pdfData, `${activeModule.title || 'Module'}_Notes.pdf`)} className="px-5 py-2.5 font-bold bg-primary-600 text-white rounded-xl shadow-md hover:bg-primary-700 hover:-translate-y-0.5 transition-all text-sm md:text-base">
                      Download PDF
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-20 text-center font-bold text-gray-400 flex flex-col items-center">
               <BookOpen size={48} className="text-gray-200 mb-4"/>
               Select a module from the curriculum to begin learning.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
