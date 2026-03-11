'use client';
import { useEffect, useRef } from 'react';
import { MapPin, Navigation } from 'lucide-react';

export default function TripMap({ destination, itinerary, activeDay }) {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined') return;

    import('leaflet').then(async (L) => {
      // Fix default marker icons
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Remove existing map
      if (instanceRef.current) { instanceRef.current.remove(); instanceRef.current = null; }

      // Get destination coordinates via Nominatim
      let centerLat = 20, centerLng = 0;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        if (data[0]) { centerLat = parseFloat(data[0].lat); centerLng = parseFloat(data[0].lon); }
      } catch {}

      const map = L.map(mapRef.current, { zoomControl: true }).setView([centerLat, centerLng], 13);
      instanceRef.current = map;

      // OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Filter itinerary — show activeDay or all days
      const days = activeDay ? itinerary.filter(d => d.day === activeDay) : itinerary;
      const allCoords = [];
      const routeCoords = [];

      const PERIOD_COLORS = { morning: '#f97316', afternoon: '#10b981', evening: '#6366f1' };
      const PERIOD_LABELS = { morning: 'AM', afternoon: 'PM', evening: 'EVE' };

      for (const day of days) {
        const dayRouteCoords = [];

        for (const period of ['morning', 'afternoon', 'evening']) {
          const attr = day[period]?.attraction;
          if (!attr) continue;

          let lat = attr.coords?.lat;
          let lng = attr.coords?.lng;

          // If Gemini gave us invalid coords, use Nominatim to geocode
          if (!lat || !lng || Math.abs(lat) < 0.001 || Math.abs(lng) < 0.001) {
            try {
              const geoRes = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(attr.name + ' ' + destination)}&format=json&limit=1`,
                { headers: { 'Accept-Language': 'en' } }
              );
              const geoData = await geoRes.json();
              if (geoData[0]) { lat = parseFloat(geoData[0].lat); lng = parseFloat(geoData[0].lon); }
              else { lat = centerLat + (Math.random() - 0.5) * 0.02; lng = centerLng + (Math.random() - 0.5) * 0.02; }
            } catch {
              lat = centerLat + (Math.random() - 0.5) * 0.02;
              lng = centerLng + (Math.random() - 0.5) * 0.02;
            }
          }

          allCoords.push([lat, lng]);
          dayRouteCoords.push([lat, lng]);

          const color = PERIOD_COLORS[period];
          const label = PERIOD_LABELS[period];

          // Custom colored marker
          const icon = L.divIcon({
            html: `<div style="
              background:${color};
              color:white;
              width:34px;height:34px;
              border-radius:50% 50% 50% 0;
              transform:rotate(-45deg);
              display:flex;align-items:center;justify-content:center;
              border:3px solid white;
              box-shadow:0 2px 8px rgba(0,0,0,0.3);
              font-size:9px;font-weight:700;
            ">
              <span style="transform:rotate(45deg)">${label}</span>
            </div>`,
            className: '',
            iconSize: [34, 34],
            iconAnchor: [17, 34],
            popupAnchor: [0, -34],
          });

          const popupContent = `
            <div style="min-width:200px;font-family:sans-serif">
              <div style="background:${color};color:white;padding:8px 12px;margin:-1px -1px 8px;border-radius:4px 4px 0 0">
                <strong>Day ${day.day} · ${period.charAt(0).toUpperCase() + period.slice(1)}</strong>
              </div>
              <div style="padding:0 12px 12px">
                <div style="font-weight:700;font-size:14px;margin-bottom:4px">${attr.name}</div>
                <div style="color:#64748b;font-size:12px;margin-bottom:6px">${attr.area || ''}</div>
                ${attr.desc ? `<div style="font-size:12px;color:#374151;margin-bottom:6px">${attr.desc}</div>` : ''}
                <div style="display:flex;gap:8px;font-size:11px">
                  ${attr.duration ? `<span style="background:#f1f5f9;padding:2px 6px;border-radius:4px">⏱ ${attr.duration}</span>` : ''}
                  ${attr.cost > 0 ? `<span style="background:#f0fdf4;color:#16a34a;padding:2px 6px;border-radius:4px">$${attr.cost}</span>` : '<span style="background:#f0fdf4;color:#16a34a;padding:2px 6px;border-radius:4px">Free</span>'}
                </div>
                ${attr.tips ? `<div style="margin-top:8px;background:#fefce8;border-left:3px solid #eab308;padding:6px 8px;font-size:11px;color:#713f12">${attr.tips}</div>` : ''}
              </div>
            </div>
          `;

          L.marker([lat, lng], { icon }).addTo(map).bindPopup(popupContent, { maxWidth: 280 });
        }

        // Draw route line for the day
        if (dayRouteCoords.length > 1) {
          L.polyline(dayRouteCoords, { color: '#3b82f6', weight: 2, opacity: 0.6, dashArray: '6, 6' }).addTo(map);
        }
      }

      // Fit map to show all markers
      if (allCoords.length > 0) {
        map.fitBounds(allCoords, { padding: [40, 40] });
      }
    });

    return () => { if (instanceRef.current) { instanceRef.current.remove(); instanceRef.current = null; } };
  }, [destination, itinerary, activeDay]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <MapPin className="w-4 h-4 text-blue-600" />
          {destination} – {activeDay ? `Day ${activeDay}` : 'All Days'}
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          {[{ color: '#f97316', label: 'Morning' }, { color: '#10b981', label: 'Afternoon' }, { color: '#6366f1', label: 'Evening' }].map(l => (
            <span key={l.label} className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
          <span className="hidden sm:flex items-center gap-1 text-slate-400">
            <Navigation className="w-3 h-3" /> Click pins for details
          </span>
        </div>
      </div>
      <div ref={mapRef} className="flex-1" style={{ minHeight: '420px' }} />
    </div>
  );
}
