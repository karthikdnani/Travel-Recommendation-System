'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Globe, Sparkles, Map, DollarSign, Hotel, Lightbulb, ArrowRight, CheckCircle2, Star, Users, Clock } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!loading && user) router.push('/dashboard'); }, [user, loading]);
  if (loading) return <Loader />;

  const features = [
    { icon: Sparkles, title: 'Smart Itineraries', desc: 'Advanced algorithms generate unique itineraries for any city in the world — not templates.', color: 'bg-blue-50 text-blue-600' },
    { icon: Map, title: 'Precise Maps', desc: 'Every attraction is pinned at its exact GPS location on an interactive OpenStreetMap.', color: 'bg-green-50 text-green-600' },
    { icon: Hotel, title: 'Hotel Suggestions', desc: 'Real hotel recommendations matching your budget with booking tips and ratings.', color: 'bg-purple-50 text-purple-600' },
    { icon: DollarSign, title: 'Budget Planning', desc: 'Full cost breakdown across accommodation, food, activities and transport.', color: 'bg-yellow-50 text-yellow-600' },
    { icon: Lightbulb, title: 'Local Tips', desc: 'Insider tips for every attraction and destination-specific travel advice.', color: 'bg-orange-50 text-orange-600' },
    { icon: Clock, title: 'Day-by-Day Plan', desc: 'Morning, afternoon and evening activities with restaurant recommendations every day.', color: 'bg-red-50 text-red-600' },
  ];

  const stats = [
    { icon: Globe, value: '200+', label: 'Cities worldwide' },
    { icon: Star, value: '100%', label: 'Personalized' },
    { icon: Users, value: 'Free', label: 'Forever' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-800 text-lg">Travel Recommendation System</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-slate-600 hover:text-slate-800 px-4 py-2 transition">Sign In</Link>
          <Link href="/register" className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
          Plan Any Trip with<br />
          <span className="text-blue-600">Smart Recommendations</span>
        </h1>
        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Enter any destination worldwide. Get instant personalized itineraries with real places, precise maps, hotels and restaurants.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-lg transition shadow-lg shadow-blue-100">
            Start Planning Free <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/login" className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-lg transition">
            Sign In
          </Link>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-10 mt-16 pt-10 border-t border-slate-100">
          {stats.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="text-center">
                <Icon className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-slate-800">{s.value}</div>
                <div className="text-sm text-slate-500">{s.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Enter Details', desc: 'Tell us your destination, dates, budget and what you love to do.', icon: Globe },
              { step: '2', title: 'Get Recommendations', desc: 'Personalized itinerary created with real places, restaurants and hotels.', icon: Sparkles },
              { step: '3', title: 'Explore the Map', desc: 'Every attraction is pinned at its precise GPS location on an interactive map.', icon: Map },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="text-center">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Step {item.step}</div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">Everything You Need</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-md transition">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-20 px-6 text-white text-center">
        <Globe className="w-12 h-12 mx-auto mb-4 text-blue-200" />
        <h2 className="text-3xl font-bold mb-3">Ready to Plan Your Next Adventure?</h2>
        <p className="text-blue-200 mb-8 text-lg">100% free. No credit card. Works for any city worldwide.</p>
        <Link href="/register" className="inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition">
          Create Free Account <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      <footer className="text-center py-8 text-sm text-slate-400 border-t border-slate-100">
        Travel Recommendation System · Final Year CS Project · Built with Next.js, Node.js & OpenStreetMap
      </footer>
    </div>
  );
}

function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Globe className="w-10 h-10 text-blue-500 animate-spin" />
    </div>
  );
}
