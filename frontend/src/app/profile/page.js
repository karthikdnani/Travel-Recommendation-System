'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/shared/Navbar';
import { updateProfile, changePassword } from '../../utils/api';
import { User, Mail, Lock, Save, CheckCircle2, AlertCircle, Globe } from 'lucide-react';

const ALL_INTERESTS = ['adventure', 'food', 'culture', 'beaches', 'nightlife', 'nature', 'history', 'art', 'shopping', 'sports'];
const ICONS = { adventure: '🧗', food: '🍜', culture: '🎭', beaches: '🏖️', nightlife: '🎵', nature: '🌿', history: '🏛️', art: '🎨', shopping: '🛍️', sports: '⚽' };

export default function ProfilePage() {
  const { user, loading, updateUser } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('profile');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState([]);
  const [pass, setPass] = useState({ current: '', new: '', confirm: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading]);
  useEffect(() => { if (user) { setName(user.name || ''); setBio(user.bio || ''); setInterests(user.preferences?.interests || []); } }, [user]);

  const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type: '', text: '' }), 3500); };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await updateProfile({ name, bio, preferences: { interests } });
      updateUser(data.user); showMsg('success', 'Profile updated!');
    } catch { showMsg('error', 'Update failed.'); } finally { setSaving(false); }
  };

  const savePassword = async () => {
    if (pass.new !== pass.confirm) return showMsg('error', 'New passwords do not match.');
    if (pass.new.length < 6) return showMsg('error', 'Password must be at least 6 characters.');
    setSaving(true);
    try {
      await changePassword({ currentPassword: pass.current, newPassword: pass.new });
      showMsg('success', 'Password changed!'); setPass({ current: '', new: '', confirm: '' });
    } catch (err) { showMsg('error', err.response?.data?.error || 'Password change failed.'); } finally { setSaving(false); }
  };

  if (loading) return <Loader />;

  const TABS = [{ id: 'profile', label: 'Profile', icon: User }, { id: 'interests', label: 'Interests', icon: Globe }, { id: 'security', label: 'Security', icon: Lock }];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6 flex items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{user?.name}</h1>
            <p className="text-slate-500 text-sm">{user?.email}</p>
            <p className="text-slate-400 text-xs mt-1">{user?.totalTrips || 0} trips planned</p>
          </div>
        </div>

        {msg.text && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm mb-4 ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
            {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />} {msg.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-200 mb-5">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition -mb-px ${tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          {tab === 'profile' && (
            <div className="space-y-4 max-w-md">
              <h2 className="font-bold text-slate-800 mb-4">Edit Profile</h2>
              <FieldInput label="Full Name" icon={User} value={name} onChange={setName} />
              <FieldInput label="Email (read only)" icon={Mail} value={user?.email} disabled />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} maxLength={200} placeholder="Tell us about yourself..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm resize-none" />
              </div>
              <SaveBtn onClick={saveProfile} loading={saving} />
            </div>
          )}

          {tab === 'interests' && (
            <div>
              <h2 className="font-bold text-slate-800 mb-1">Travel Interests</h2>
              <p className="text-slate-500 text-sm mb-4">These personalise your AI-generated itineraries</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-5">
                {ALL_INTERESTS.map(i => (
                  <button key={i} onClick={() => setInterests(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i])}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium capitalize transition ${interests.includes(i) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                    <span>{ICONS[i]}</span> {i}
                    {interests.includes(i) && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-blue-500" />}
                  </button>
                ))}
              </div>
              <SaveBtn onClick={saveProfile} loading={saving} />
            </div>
          )}

          {tab === 'security' && (
            <div className="space-y-4 max-w-md">
              <h2 className="font-bold text-slate-800 mb-4">Change Password</h2>
              <FieldInput label="Current Password" icon={Lock} type="password" value={pass.current} onChange={v => setPass(p => ({ ...p, current: v }))} placeholder="••••••••" />
              <FieldInput label="New Password" icon={Lock} type="password" value={pass.new} onChange={v => setPass(p => ({ ...p, new: v }))} placeholder="Min 6 characters" />
              <FieldInput label="Confirm New Password" icon={Lock} type="password" value={pass.confirm} onChange={v => setPass(p => ({ ...p, confirm: v }))} placeholder="Re-enter new password" />
              <SaveBtn onClick={savePassword} loading={saving} label="Update Password" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FieldInput({ label, icon: Icon, value, onChange, type = 'text', placeholder = '', disabled = false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type={type} value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder} disabled={disabled}
          className={`w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''}`} />
      </div>
    </div>
  );
}

function SaveBtn({ onClick, loading, label = 'Save Changes' }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition disabled:opacity-60">
      <Save className="w-4 h-4" /> {loading ? 'Saving...' : label}
    </button>
  );
}

function Loader() { return <div className="min-h-screen flex items-center justify-center"><Globe className="w-8 h-8 text-blue-500 animate-spin" /></div>; }
