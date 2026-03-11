'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/shared/Navbar';
import { getDashboard } from '../../utils/api';
import { PlaneTakeoff, CheckCircle2, Clock, MapPin, Plus, ChevronRight, Globe, Calendar, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading]);
  useEffect(() => {
    if (user) getDashboard().then(r => setData(r.data)).catch(console.error).finally(() => setFetching(false));
  }, [user]);

  if (loading || !user) return <Loader />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const statCards = data?.stats ? [
    { label: 'Total Trips', value: data.stats.total, icon: Globe, color: 'bg-blue-50 text-blue-600' },
    { label: 'Planned', value: data.stats.planned, icon: Clock, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Ongoing', value: data.stats.ongoing, icon: PlaneTakeoff, color: 'bg-green-50 text-green-600' },
    { label: 'Completed', value: data.stats.completed, icon: CheckCircle2, color: 'bg-purple-50 text-purple-600' },
  ] : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white mb-8 relative overflow-hidden">
          <div className="absolute right-6 top-6 opacity-10">
            <Globe className="w-32 h-32" />
          </div>
          <p className="text-blue-200 text-sm font-medium mb-1">{greeting}</p>
          <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
          <p className="text-blue-200 mb-5">Where would you like to go next?</p>
          <Link href="/plan"
            className="inline-flex items-center gap-2 bg-white text-blue-700 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-50 transition">
            <Plus className="w-4 h-4" /> Plan a New Trip
          </Link>
        </div>

        {/* Stats */}
        {!fetching && data?.stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statCards.map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-white rounded-xl p-5 border border-slate-100">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800">{s.value}</div>
                  <div className="text-sm text-slate-500 mt-0.5">{s.label}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Recent trips */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Recent Trips</h2>
          <Link href="/trips" className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {fetching ? (
          <div className="grid md:grid-cols-2 gap-4">{[1,2].map(i => <SkeletonCard key={i} />)}</div>
        ) : data?.recentTrips?.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {data?.recentTrips?.map(trip => <TripCard key={trip._id} trip={trip} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function TripCard({ trip }) {
  return (
    <Link href={`/trips/${trip._id}`}>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition group">
        {/* Cover image */}
        <div className="h-40 bg-slate-100 relative overflow-hidden">
          {trip.coverImage ? (
            <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Globe className="w-12 h-12 text-slate-300" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-3 left-4 text-white">
            <h3 className="font-bold text-base">{trip.title}</h3>
          </div>
          <StatusBadge status={trip.status} />
        </div>
        <div className="p-4 flex items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-blue-500" />{trip.destination?.city}</span>
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-blue-500" />{trip.numberOfDays} days</span>
          <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-blue-500" />${trip.budget?.total?.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
}

function StatusBadge({ status }) {
  const s = { planned: 'bg-slate-800/70', ongoing: 'bg-blue-600/80', completed: 'bg-green-600/80', cancelled: 'bg-red-600/80' };
  return (
    <span className={`absolute top-3 right-3 text-white text-xs px-2.5 py-1 rounded-full font-medium capitalize ${s[status] || s.planned}`}>
      {status}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-14 text-center">
      <Globe className="w-14 h-14 text-slate-200 mx-auto mb-4" />
      <h3 className="font-bold text-slate-700 text-lg mb-2">No trips yet</h3>
      <p className="text-slate-400 text-sm mb-5">Plan your first AI-powered trip in seconds</p>
      <Link href="/plan" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-500 transition">
        <Plus className="w-4 h-4" /> Plan a Trip
      </Link>
    </div>
  );
}

function SkeletonCard() {
  return <div className="bg-white rounded-2xl border border-slate-100 h-52 animate-pulse" />;
}

function Loader() {
  return <div className="min-h-screen flex items-center justify-center"><Globe className="w-8 h-8 text-blue-500 animate-spin" /></div>;
}
