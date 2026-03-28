import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-12 text-center animate-fade-in">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
        Quick learning made <span className="text-primary-600">Easy</span>
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mb-10 leading-relaxed">
        Join our comprehensive platform features video lectures, carefully curated notes, and realistic mock tests designed to guarantee your success.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Link to="/login" className="px-10 py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 hover:shadow-lg transition-all transform hover:-translate-y-1 shadow-md shadow-primary-500/20">
          Start Learning Now
        </Link>
      </div>
    </div>
  );
}
