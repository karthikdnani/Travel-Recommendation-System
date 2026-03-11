'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '../../../context/AuthContext';
import Navbar from '../../../components/shared/Navbar';
import { getTrip } from '../../../utils/api';
import { MapPin, Hotel, Lightbulb, ChevronLeft, Sunrise, Sun, Moon, UtensilsCrossed, Clock, DollarSign, Star, Globe, Navigation, Plane, Train, Bus } from 'lucide-react';

const TripMap = dynamic(() => import('../../../components/map/TripMap'), {
  ssr: false,
  loading: () => <div className="h-96 bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400 text-sm">Loading map...</div>,
});

const TABS = [
  { id: 'itinerary', label: 'Itinerary', icon: Globe },
  { id: 'map', label: 'Map', icon: MapPin },
  { id: 'hotels', label: 'Hotels', icon: Hotel },
  { id: 'route', label: 'Getting There', icon: Navigation },
  { id: 'tips', label: 'Tips', icon: Lightbulb },
];

export default function TripDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [trip, setTrip] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState('itinerary');
  const [activeDay, setActiveDay] = useState(1);

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading]);
  useEffect(() => {
    if (params.id) getTrip(params.id).then(r => setTrip(r.data.trip)).catch(() => router.push('/trips')).finally(() => setFetching(false));
  }, [params.id]);

  if (loading || fetching) return <Loader />;
  if (!trip) return null;

  const currentDay = trip.itinerary?.find(d => d.day === activeDay);

  const costItems = [
    { label: 'Accommodation', value: trip.costBreakdown?.accommodation, icon: Hotel, color: 'text-purple-600 bg-purple-50' },
    { label: 'Food', value: trip.costBreakdown?.food, icon: UtensilsCrossed, color: 'text-orange-600 bg-orange-50' },
    { label: 'Activities', value: trip.costBreakdown?.activities, icon: Star, color: 'text-green-600 bg-green-50' },
    { label: 'Transport', value: trip.costBreakdown?.transport, icon: Bus, color: 'text-blue-600 bg-blue-50' },
    { label: 'Misc', value: trip.costBreakdown?.misc, icon: DollarSign, color: 'text-slate-600 bg-slate-100' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <div className="relative h-64 md:h-80 bg-slate-200 overflow-hidden">
        {trip.coverImage && <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white max-w-7xl mx-auto">
          <Link href="/trips" className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-3 w-fit transition">
            <ChevronLeft className="w-4 h-4" /> My Trips
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">{trip.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm mt-2">
            <span className="flex items-center gap-1"><Navigation className="w-4 h-4" />{trip.origin?.city} → {trip.destination?.city}</span>
            <span className="flex items-center gap-1"><Globe className="w-4 h-4" />{trip.numberOfDays} days</span>
            <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />${trip.budget?.total?.toLocaleString()} budget</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Summary */}
        {trip.summary && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-blue-800 text-sm leading-relaxed">
            {trip.summary}
          </div>
        )}

        {/* Cost breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {costItems.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-white rounded-xl p-4 border border-slate-100 text-center">
                <div className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center mb-2 ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="font-bold text-slate-800 text-sm">${item.value?.toLocaleString() || 0}</div>
                <div className="text-xs text-slate-400 mt-0.5">{item.label}</div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-200 mb-6 overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap -mb-px ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* ITINERARY TAB */}
        {activeTab === 'itinerary' && (
          <div className="grid md:grid-cols-4 gap-5">
            {/* Day selector */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Select Day</p>
              {trip.itinerary?.map(day => (
                <button key={day.day} onClick={() => setActiveDay(day.day)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition ${activeDay === day.day ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-100 hover:border-blue-200'}`}>
                  <div className="font-semibold">Day {day.day}</div>
                  <div className={`text-xs mt-0.5 truncate ${activeDay === day.day ? 'text-blue-200' : 'text-slate-400'}`}>{day.theme}</div>
                </button>
              ))}
            </div>

            {/* Day detail */}
            <div className="md:col-span-3 space-y-4">
              {currentDay && (
                <>
                  <div className="bg-white rounded-xl p-5 border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">Day {currentDay.day}: {currentDay.theme}</h2>
                    <p className="text-slate-400 text-sm mt-0.5 mb-3">{currentDay.date}</p>
                    <p className="text-slate-600 text-sm leading-relaxed">{currentDay.travelNote}</p>
                  </div>

                  <ActivityCard period="Morning" icon={Sunrise} color="orange" data={currentDay.morning} />
                  {currentDay.lunch && <MealCard label="Lunch" meal={currentDay.lunch} />}
                  <ActivityCard period="Afternoon" icon={Sun} color="yellow" data={currentDay.afternoon} />
                  {currentDay.dinner && <MealCard label="Dinner" meal={currentDay.dinner} />}
                  <ActivityCard period="Evening" icon={Moon} color="indigo" data={currentDay.evening} />

                  {currentDay.tips && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                      <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-amber-800 text-sm">{currentDay.tips}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* MAP TAB */}
        {activeTab === 'map' && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            {/* Day filter buttons for map */}
            <div className="flex gap-2 p-4 border-b border-slate-100 overflow-x-auto">
              <button onClick={() => setActiveDay(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${!activeDay ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                All Days
              </button>
              {trip.itinerary?.map(day => (
                <button key={day.day} onClick={() => setActiveDay(day.day)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${activeDay === day.day ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  Day {day.day}
                </button>
              ))}
            </div>
            <TripMap destination={trip.destination?.city} itinerary={trip.itinerary} activeDay={activeDay} />
          </div>
        )}

        {/* HOTELS TAB */}
        {activeTab === 'hotels' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trip.hotels?.map((hotel, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                {hotel.imageUrl && (
                  <div className="h-40 bg-slate-100 overflow-hidden">
                    <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-bold text-slate-800">{hotel.name}</h3>
                    <div className="flex items-center gap-0.5 shrink-0 ml-2">
                      {Array.from({ length: hotel.stars || 3 }).map((_, j) => <Star key={j} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs flex items-center gap-1 mb-3"><MapPin className="w-3 h-3" />{hotel.area}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-blue-600">${hotel.pricePN}</span>
                    <span className="text-xs text-slate-400">per night</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {hotel.amenities?.map(a => <span key={a} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{a}</span>)}
                  </div>
                  {hotel.tip && (
                    <div className="bg-blue-50 rounded-lg p-3 flex items-start gap-2">
                      <Lightbulb className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700">{hotel.tip}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* GETTING THERE TAB */}
        {activeTab === 'route' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-600" />
                {trip.origin?.city} → {trip.destination?.city}
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {trip.route?.transportOptions?.map((opt, i) => {
                  const icons = { Flight: Plane, Train: Train, Bus: Bus };
                  const Icon = icons[opt.mode] || Bus;
                  return (
                    <div key={i} className="border border-slate-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Icon className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-semibold text-slate-800 text-sm">{opt.mode}</span>
                      </div>
                      <p className="text-xs text-slate-600 mb-2">{opt.desc}</p>
                      <p className="text-xs bg-blue-50 text-blue-700 rounded-lg p-2">{opt.tip}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <Bus className="w-4 h-4 text-blue-600" /> Local Transport in {trip.destination?.city}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">{trip.route?.localTransport}</p>
            </div>
          </div>
        )}

        {/* TIPS TAB */}
        {activeTab === 'tips' && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-6 border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" /> Travel Tips
              </h3>
              <ul className="space-y-3">
                {trip.travelTips?.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              {trip.bestTimeToVisit && (
                <div className="bg-white rounded-xl p-5 border border-slate-100">
                  <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2"><Clock className="w-4 h-4 text-blue-600" /> Best Time to Visit</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{trip.bestTimeToVisit}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityCard({ period, icon: Icon, color, data }) {
  if (!data?.attraction) return null;
  const attr = data.attraction;
  const colors = {
    orange: { bg: 'bg-orange-50', text: 'text-orange-500', img: 'border-orange-100' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-500', img: 'border-yellow-100' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-500', img: 'border-indigo-100' },
  };
  const c = colors[color];
  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
      {attr.imageUrl && (
        <div className="h-48 overflow-hidden relative">
          <img src={attr.imageUrl} alt={attr.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
            <Icon className="w-3 h-3" /> {period}
          </div>
        </div>
      )}
      <div className="p-5">
        {!attr.imageUrl && (
          <div className={`flex items-center gap-1.5 text-xs font-semibold mb-3 ${c.text}`}>
            <Icon className="w-3.5 h-3.5" /> {period}
          </div>
        )}
        <h4 className="font-bold text-slate-800 mb-1">{attr.name}</h4>
        {attr.desc && <p className="text-sm text-slate-500 mb-3 leading-relaxed">{attr.desc}</p>}
        <div className="flex flex-wrap gap-2 text-xs">
          {attr.area && <span className="flex items-center gap-1 text-slate-500"><MapPin className="w-3 h-3" />{attr.area}</span>}
          {attr.duration && <span className="flex items-center gap-1 text-slate-500"><Clock className="w-3 h-3" />{attr.duration}</span>}
          <span className={`px-2 py-0.5 rounded-full font-medium ${attr.cost > 0 ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
            {attr.cost > 0 ? `$${attr.cost}` : 'Free'}
          </span>
        </div>
        {attr.tips && (
          <div className="mt-3 bg-amber-50 border-l-2 border-amber-400 pl-3 py-2 text-xs text-amber-800">
            {attr.tips}
          </div>
        )}
      </div>
    </div>
  );
}

function MealCard({ label, meal }) {
  if (!meal) return null;
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-4">
      <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
        <UtensilsCrossed className="w-5 h-5 text-orange-500" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-slate-400 font-medium">{label}</div>
        <div className="font-semibold text-slate-800 truncate">{meal.name}</div>
        <div className="text-xs text-slate-500">{meal.cuisine} · {meal.price} · ~${meal.costPP}/person</div>
        {meal.mustTry && <div className="text-xs text-orange-600 mt-0.5">Must try: {meal.mustTry}</div>}
      </div>
    </div>
  );
}

function Loader() { return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Globe className="w-8 h-8 text-blue-500 animate-spin" /></div>; }
