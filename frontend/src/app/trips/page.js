'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/shared/Navbar';
import { getTrips, deleteTrip } from '../../utils/api';
import { MapPin, Calendar, DollarSign, Plus, Trash2, Globe, ChevronRight } from 'lucide-react';

const STATUS_COLORS = { planned: 'bg-slate-100 text-slate-600', ongoing: 'bg-blue-100 text-blue-700', completed: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-600' };

export default function TripsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState([]);
  const [filter, setFilter] = useState('all');
  const [fetching, setFetching] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading]);
  useEffect(() => {
    if (user) {
      setFetching(true);
      getTrips(filter !== 'all' ? { status: filter } : {}).then(r => setTrips(r.data.trips)).catch(console.error).finally(() => setFetching(false));
    }
  }, [user, filter]);

  const handleDelete = async (id, e) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm('Delete this trip?')) return;
    setDeleting(id);
    try { await deleteTrip(id); setTrips(p => p.filter(t => t._id !== id)); }
    catch { alert('Failed to delete.'); }
    finally { setDeleting(null); }
  };

  const FILTERS = ['all', 'planned', 'ongoing', 'completed', 'cancelled'];

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">My Trips</h1>
            <p className="text-slate-500 text-sm mt-0.5">{trips.length} trip{trips.length !== 1 ? 's' : ''}</p>
          </div>
          <Link href="/plan" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition">
            <Plus className="w-4 h-4" /> New Trip
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition whitespace-nowrap ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'}`}>
              {f === 'all' ? 'All Trips' : f}
            </button>
          ))}
        </div>

        {fetching ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
        ) : trips.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map(trip => (
              <Link key={trip._id} href={`/trips/${trip._id}`}>
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition group relative">
                  {/* Cover image */}
                  <div className="h-44 bg-slate-100 relative">
                    {trip.coverImage ? (
                      <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Globe className="w-10 h-10 text-slate-300" /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className={`absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[trip.status]}`}>{trip.status}</span>
                    <button onClick={(e) => handleDelete(trip._id, e)} disabled={deleting === trip._id}
                      className="absolute top-3 right-3 p-1.5 bg-black/30 hover:bg-red-500 text-white rounded-lg transition opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-800 mb-2">{trip.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-blue-500" />{trip.destination?.city}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-blue-500" />{trip.numberOfDays}d</span>
                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3 text-blue-500" />${trip.budget?.total?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
      <Globe className="w-12 h-12 text-slate-200 mx-auto mb-4" />
      <h3 className="font-bold text-slate-700 mb-2">No trips found</h3>
      <p className="text-slate-400 text-sm mb-5">Start planning your next adventure!</p>
      <Link href="/plan" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-500 transition">
        <Plus className="w-4 h-4" /> Plan a Trip
      </Link>
    </div>
  );
}

function SkeletonCard() { return <div className="bg-white rounded-2xl border border-slate-100 h-60 animate-pulse" />; }
function Loader() { return <div className="min-h-screen flex items-center justify-center"><Globe className="w-8 h-8 text-blue-500 animate-spin" /></div>; }
