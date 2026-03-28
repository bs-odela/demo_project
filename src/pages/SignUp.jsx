import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../lib/auth';

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    countryCode: '+1',
    password: '',
    role: 'Learner',
    professor_name: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 5) {
      setError('Please enter a valid phone number.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const fullFormData = {
        ...formData,
        phone: `${formData.countryCode} ${formData.phone}`
      };
      const user = await authService.signup(fullFormData);
      if (user.role === 'Developer') navigate('/developer');
      else navigate('/learner');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-0">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100 transition-all duration-300">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Create Account
        </h2>
        
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm transition-all border border-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className={`py-3 rounded-xl border-2 transition-all ${formData.role === 'Learner' ? 'border-primary-600 bg-primary-50 text-primary-700 font-bold shadow-sm' : 'border-gray-200 hover:border-primary-300 text-gray-600'}`}
                onClick={() => setFormData(prev => ({ ...prev, role: 'Learner' }))}
              >
                Learner
              </button>
              <button
                type="button"
                className={`py-3 rounded-xl border-2 transition-all ${formData.role === 'Developer' ? 'border-primary-600 bg-primary-50 text-primary-700 font-bold shadow-sm' : 'border-gray-200 hover:border-primary-300 text-gray-600'}`}
                onClick={() => setFormData(prev => ({ ...prev, role: 'Developer' }))}
              >
                Developer
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
              name="username"
              type="text" 
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="Your Name"
              required
            />
          </div>

          {formData.role === 'Developer' && (
            <div className="animate-fade-in-down">
              <label className="block text-sm font-medium text-gray-700 mb-1">Professor Name (Public Display)</label>
              <input 
                name="professor_name"
                type="text" 
                value={formData.professor_name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Dr. Smith"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="flex bg-white rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all overflow-hidden">
              <select 
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                className="bg-gray-50 border-r border-gray-200 px-3 py-3 text-gray-700 focus:outline-none cursor-pointer"
              >
                <option value="+1">US (+1)</option>
                <option value="+44">UK (+44)</option>
                <option value="+91">IN (+91)</option>
                <option value="+61">AU (+61)</option>
                <option value="+81">JP (+81)</option>
                <option value="+49">DE (+49)</option>
                <option value="+33">FR (+33)</option>
              </select>
              <input 
                name="phone"
                type="tel" 
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 focus:outline-none bg-transparent"
                placeholder="(555) 000-0000"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              name="email"
              type="email" 
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              name="password"
              type="password" 
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button disabled={loading} type="submit" className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors mt-2 text-lg shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
            ) : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-primary-600 font-bold hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}
