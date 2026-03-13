'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/shared/Navbar';
import { generateTrip } from '../../utils/api';
import { MapPin, PlaneTakeoff, Calendar, Users, DollarSign, Target, AlertCircle, Sparkles, Globe, ChevronRight } from 'lucide-react';

const INTERESTS = [
  { value: 'adventure', label: 'Adventure', icon: '🧗' },
  { value: 'food', label: 'Food & Dining', icon: '🍜' },
  { value: 'culture', label: 'Culture', icon: '🎭' },
  { value: 'beaches', label: 'Beaches', icon: '🏖️' },
  { value: 'nature', label: 'Nature', icon: '🌿' },
  { value: 'history', label: 'History', icon: '🏛️' },
  { value: 'art', label: 'Art', icon: '🎨' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'nightlife', label: 'Nightlife', icon: '🎵' },
  { value: 'sports', label: 'Sports', icon: '⚽' },
];

const POPULAR_DEST = ['Paris, France', 'Tokyo, Japan', 'Bali, Indonesia', 'London, UK', 'New York, USA', 'Dubai, UAE', 'Barcelona, Spain', 'Bangkok, Thailand'];

export default function PlanPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ origin: '', destination: '', startDate: '', numberOfDays: 5, budget: 1500, currency: 'USD', travelers: 1, interests: [] });

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading]);

  const toggleInterest = (val) => setForm(p => ({ ...p, interests: p.interests.includes(val) ? p.interests.filter(i => i !== val) : [...p.interests, val] }));

  const next = () => {
    setError('');
    if (step === 1 && (!form.origin.trim() || !form.destination.trim())) return setError('Please enter both origin and destination.');
    setStep(s => s + 1);
  };

  const submit = async () => {
    setGenerating(true); setError('');
    try {
      const { data } = await generateTrip({ ...form, numberOfDays: parseInt(form.numberOfDays), budget: parseFloat(form.budget), travelers: parseInt(form.travelers) });
      router.push(`/trips/${data.trip._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Generation failed. Please try again.');
      setGenerating(false);
    }
  };

  if (loading) return <Loader />;
  if (generating) return <GeneratingScreen destination={form.destination} />;

  const STEPS = [{ n: 1, label: 'Destination', icon: MapPin }, { n: 2, label: 'Interests', icon: Target }, { n: 3, label: 'Budget', icon: DollarSign }];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Plan Your Trip</h1>
          <p className="text-slate-500 mt-2 text-sm">Get a personalized itinerary for any destination</p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = s.n === step, done = s.n < step;
            return (
              <div key={s.n} className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${active ? 'bg-blue-600 text-white' : done ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                  <Icon className="w-3.5 h-3.5" /> {s.label}
                </div>
                {i < 2 && <ChevronRight className="w-4 h-4 text-slate-300 mx-1" />}
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-600" /> Where are you going?</h2>
              <Field label="Starting From *" icon={PlaneTakeoff} type="text" placeholder="e.g. Vijayawada, India"
                value={form.origin} onChange={v => setForm({ ...form, origin: v })} />
              <div>
                <Field label="Destination *" icon={MapPin} type="text" placeholder="e.g. Paris, France"
                  value={form.destination} onChange={v => setForm({ ...form, destination: v })} />
                <div className="flex flex-wrap gap-2 mt-3">
                  {POPULAR_DEST.map(d => (
                    <button key={d} onClick={() => setForm({ ...form, destination: d })}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition ${form.destination === d ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-600 hover:border-blue-300'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="date" value={form.startDate} min={new Date().toISOString().split('T')[0]}
                      onChange={e => setForm({ ...form, startDate: e.target.value })}
                      className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Number of Days</label>
                  <input type="number" min="1" max="30" value={form.numberOfDays}
                    onChange={e => setForm({ ...form, numberOfDays: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2"><Target className="w-5 h-5 text-blue-600" /> What interests you?</h2>
              <p className="text-sm text-slate-500">System tailors your itinerary to your interests</p>
              <div className="grid grid-cols-2 gap-2">
                {INTERESTS.map(i => (
                  <button key={i.value} onClick={() => toggleInterest(i.value)}
                    className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 text-sm font-medium transition ${form.interests.includes(i.value) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                    <span>{i.icon}</span> {i.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400">{form.interests.length} selected · you can skip this</p>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2"><DollarSign className="w-5 h-5 text-blue-600" /> Budget & travelers</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Total Budget: <span className="text-blue-600 font-bold">${form.budget.toLocaleString()} {form.currency}</span>
                </label>
                <input type="range" min="100" max="10000" step="50" value={form.budget}
                  onChange={e => setForm({ ...form, budget: parseInt(e.target.value) })}
                  className="w-full accent-blue-600" />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>$100 Budget</span><span>$5,000 Mid</span><span>$10,000 Luxury</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Currency</label>
                  <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}
                    className="w-full px-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm">
                    {['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Travelers</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="number" min="1" max="20" value={form.travelers}
                      onChange={e => setForm({ ...form, travelers: e.target.value })}
                      className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm" />
                  </div>
                </div>
              </div>

              {/* Summary box */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-blue-500" /> Trip Summary</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                  {[
                    ['From', form.origin || '—'], ['To', form.destination || '—'],
                    ['Days', `${form.numberOfDays} days`], ['Travelers', form.travelers],
                    ['Budget', `$${form.budget.toLocaleString()} ${form.currency}`],
                    ['Interests', form.interests.length > 0 ? `${form.interests.length} selected` : 'General'],
                  ].map(([k, v]) => (
                    <div key={k}><span className="text-slate-400">{k}:</span> <span className="font-medium">{v}</span></div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && <button onClick={() => setStep(s => s - 1)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-sm transition">← Back</button>}
            {step < 3
              ? <button onClick={next} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition">Continue →</button>
              : <button onClick={submit} className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition">
                  <Sparkles className="w-4 h-4" /> Generate Trip
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, type, placeholder, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm" />
      </div>
    </div>
  );
}

function GeneratingScreen({ destination }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const msgs = [
    'Connecting to server...',
    `Researching ${destination}...`,
    'Finding unique attractions...',
    'Planning day-by-day itinerary...',
    'Selecting restaurants...',
    'Recommending hotels...',
    'Calculating budget breakdown...',
    'Adding precise map coordinates...',
    'Fetching photos...',
    'Almost ready!',
  ];
  useEffect(() => { const t = setInterval(() => setMsgIdx(i => (i + 1) % msgs.length), 2000); return () => clearInterval(t); }, []);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 to-slate-900">
      <div className="text-center text-white px-6">
        <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-blue-400/30">
          <Globe className="w-10 h-10 text-blue-400 animate-spin" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Planning your trip</h2>
        <p className="text-blue-300 text-lg mb-8 min-h-[28px]">{msgs[msgIdx]}</p>
        <div className="w-56 h-1.5 bg-blue-900/50 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-blue-400 rounded-full animate-pulse" style={{ width: `${((msgIdx + 1) / msgs.length) * 100}%`, transition: 'width 1.8s ease' }} />
        </div>
        <p className="text-blue-500 text-xs mt-4">This takes about 10-20 seconds</p>
      </div>
    </div>
  );
}

function Loader() { return <div className="min-h-screen flex items-center justify-center"><Globe className="w-8 h-8 text-blue-500 animate-spin" /></div>; }
