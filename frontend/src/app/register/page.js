'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Globe, User, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

const INTERESTS = [
  { value: 'adventure', label: 'Adventure', icon: '🧗' },
  { value: 'food', label: 'Food', icon: '🍜' },
  { value: 'culture', label: 'Culture', icon: '🎭' },
  { value: 'beaches', label: 'Beaches', icon: '🏖️' },
  { value: 'nature', label: 'Nature', icon: '🌿' },
  { value: 'history', label: 'History', icon: '🏛️' },
  { value: 'art', label: 'Art', icon: '🎨' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'nightlife', label: 'Nightlife', icon: '🎵' },
  { value: 'sports', label: 'Sports', icon: '⚽' },
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [interests, setInterests] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const nextStep = (e) => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setStep(2);
  };

  const handleRegister = async () => {
    setLoading(true); setError('');
    try {
      await register(form.name, form.email, form.password, interests);
      router.push('/dashboard');
    } catch (err) { setError(err.response?.data?.error || 'Registration failed.'); setStep(1); }
    finally { setLoading(false); }
  };

  const toggle = (val) => setInterests(p => p.includes(val) ? p.filter(i => i !== val) : [...p, val]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">{step === 1 ? 'Create your account' : 'What interests you?'}</h1>
          <p className="text-slate-500 mt-1 text-sm">{step === 1 ? 'Free forever — no credit card needed' : 'AI uses this to personalise your trips'}</p>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mb-6">
          <div className={`h-2 rounded-full transition-all ${step === 1 ? 'w-8 bg-blue-600' : 'w-4 bg-blue-300'}`} />
          <div className={`h-2 rounded-full transition-all ${step === 2 ? 'w-8 bg-blue-600' : 'w-4 bg-slate-200'}`} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm mb-5">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={nextStep} className="space-y-4">
              {[
                { field: 'name', label: 'Full Name', icon: User, type: 'text', placeholder: 'John Doe' },
                { field: 'email', label: 'Email', icon: Mail, type: 'email', placeholder: 'you@example.com' },
                { field: 'password', label: 'Password', icon: Lock, type: 'password', placeholder: 'Min 6 characters' },
                { field: 'confirm', label: 'Confirm Password', icon: Lock, type: 'password', placeholder: 'Re-enter password' },
              ].map(({ field, label, icon: Icon, type, placeholder }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type={type} placeholder={placeholder} value={form[field]}
                      onChange={e => setForm({ ...form, [field]: e.target.value })} required
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm" />
                  </div>
                </div>
              ))}
              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition text-sm mt-2">
                Continue →
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {INTERESTS.map(i => (
                  <button key={i.value} onClick={() => toggle(i.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition ${interests.includes(i.value) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                    <span>{i.icon}</span> {i.label}
                    {interests.includes(i.value) && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-blue-500" />}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 text-center">{interests.length} selected · you can skip this</p>
              <div className="flex gap-3 mt-2">
                <button onClick={() => setStep(1)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition text-sm">← Back</button>
                <button onClick={handleRegister} disabled={loading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition disabled:opacity-60 text-sm">
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account? <Link href="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
