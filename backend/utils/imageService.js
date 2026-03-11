const axios = require('axios');

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;

// Cache to avoid repeat API calls for same query
const imageCache = new Map();

// ── Fetch one image from Unsplash ─────────────────────────────────────────────
async function getImage(query) {
  if (!UNSPLASH_KEY) return getFallbackImage(query);

  const cacheKey = query.toLowerCase().trim();
  if (imageCache.has(cacheKey)) return imageCache.get(cacheKey);

  try {
    const response = await axios.get('https://api.unsplash.com/search/photos', {
      params: { query, per_page: 1, orientation: 'landscape' },
      headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
      timeout: 5000,
    });

    const photo = response.data?.results?.[0];
    const url = photo?.urls?.regular || getFallbackImage(query);
    imageCache.set(cacheKey, url);
    return url;
  } catch {
    return getFallbackImage(query);
  }
}

// ── Fallback: use Unsplash source (no key needed, random relevant photo) ──────
function getFallbackImage(query) {
  // Unsplash Source API — no API key needed, returns relevant photos
  const encoded = encodeURIComponent(query.split(' ').slice(0, 3).join(' '));
  return `https://source.unsplash.com/800x500/?${encoded}`;
}

// ── Add images to trip data ───────────────────────────────────────────────────
async function addImagesToTrip(tripData) {
  const destination = tripData.destination?.city || 'travel';

  // Cover image for the trip
  tripData.coverImage = await getImage(`${destination} city travel`);

  // Hotel images
  if (tripData.hotels) {
    for (const hotel of tripData.hotels) {
      hotel.imageUrl = await getImage(`${hotel.name} hotel ${destination}`);
    }
  }

  // Attraction images (morning/afternoon/evening for each day)
  if (tripData.itinerary) {
    for (const day of tripData.itinerary) {
      for (const period of ['morning', 'afternoon', 'evening']) {
        if (day[period]?.attraction) {
          const attr = day[period].attraction;
          attr.imageUrl = await getImage(`${attr.name} ${destination}`);
        }
      }
    }
  }

  return tripData;
}

module.exports = { getImage, addImagesToTrip, getFallbackImage };
