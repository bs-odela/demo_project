import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle } from 'lucide-react';

export default function TestEnvironment() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 mins
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Mock Questions
  const questions = [
    { id: 1, text: "Which of the following is not a characteristic of good teaching?", options: ["Democratic", "Autocratic", "Sympathetic", "Remedial"], correct: 1 },
    { id: 2, text: "The primary duty of a teacher is to:", options: ["Raise the intellectual standard of students", "Improve physical standard of students", "Help all round development of students", "Imbibe value system in students"], correct: 2 },
    { id: 3, text: "Micro teaching is more effective:", options: ["During the preparation for teaching-practice", "During the teaching-practice", "After the teaching-practice", "Always"], correct: 0 },
  ];

  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
         if (prev <= 1) {
             clearInterval(timer);
             handleSubmit();
             return 0;
         }
         return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted]);

  const handleSelect = (optionIndex) => {
    if (isSubmitted) return;
    setAnswers({ ...answers, [currentQuestion]: optionIndex });
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct) score++;
    });
    return score;
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isSubmitted) {
    const score = calculateScore();
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-light">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-2">Test Submitted!</h2>
          <p className="text-gray-600 mb-8">You have successfully completed Mock Test {testId}.</p>
          
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-8">
            <div className="text-sm font-semibold text-gray-500 mb-1">Your Score</div>
            <div className="text-5xl font-extrabold text-primary-600">{score} <span className="text-2xl text-gray-400">/ {questions.length}</span></div>
          </div>

          <button onClick={() => navigate('/student/tests')} className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentQuestion];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="bg-white px-6 py-4 shadow-sm flex justify-between items-center sticky top-0 z-10 border-b border-gray-100">
        <div>
          <h1 className="font-bold text-lg">Mock Test {testId}</h1>
          <div className="text-xs font-semibold text-blue-600">Question {currentQuestion + 1} of {questions.length}</div>
        </div>
        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold font-mono text-lg">
          <Clock className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 gap-6">
        {/* Main Content Area */}
        <main className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 flex flex-col">
          <div className="text-lg sm:text-xl font-medium mb-8 text-gray-900 leading-relaxed">
            <span className="font-bold mr-2 text-gray-400">{currentQuestion + 1}.</span>
            {q.text}
          </div>
          
          <div className="space-y-4 flex-1">
            {q.options.map((option, idx) => {
              const isSelected = answers[currentQuestion] === idx;
              return (
                <button 
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${isSelected ? 'border-primary-500 bg-primary-50 text-primary-900 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                >
                  <span className={`inline-block w-8 h-8 text-center leading-8 rounded-full border mr-3 text-sm font-bold ${isSelected ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-300 text-gray-500'}`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
             <button 
               onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
               disabled={currentQuestion === 0}
               className="px-6 py-3 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               Previous
             </button>
             {currentQuestion === questions.length - 1 ? (
               <button 
                 onClick={handleSubmit}
                 className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-sm"
               >
                 Submit Test
               </button>
             ) : (
               <button 
                 onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                 className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-sm"
               >
                 Next
               </button>
             )}
          </div>
        </main>

        {/* Right Sidebar - Question Palette */}
        <aside className="w-full md:w-64 lg:w-80 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit shrink-0 shrink">
           <h3 className="font-bold text-gray-700 mb-4">Question Palette</h3>
           <div className="grid grid-cols-5 gap-2">
             {questions.map((_, idx) => {
               const isAnswered = answers[idx] !== undefined;
               const isCurrent = currentQuestion === idx;
               let style = "bg-gray-100 text-gray-600 border border-transparent";
               if (isCurrent) style = "ring-2 ring-primary-500 ring-offset-2 bg-primary-50 text-primary-700 font-bold border-transparent";
               else if (isAnswered) style = "bg-green-500 text-white border border-green-600 font-bold shadow-sm";

               return (
                 <button 
                   key={idx}
                   onClick={() => setCurrentQuestion(idx)}
                   className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm transition-all ${style}`}
                 >
                   {idx + 1}
                 </button>
               )
             })}
           </div>
           
           <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3 text-sm">
             <div className="flex items-center gap-3"><div className="w-4 h-4 rounded bg-green-500 border border-green-600"></div> <span className="text-gray-600">Answered</span></div>
             <div className="flex items-center gap-3"><div className="w-4 h-4 rounded bg-gray-100"></div> <span className="text-gray-600">Not Visited / Unanswered</span></div>
           </div>
        </aside>
      </div>
    </div>
  );
}
