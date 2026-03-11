const Groq = require('groq-sdk');

// ── Initialize Groq ───────────────────────────────────────────────────────────
function getClient() {
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY missing in .env — get free key at console.groq.com');
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

// ── Date helper ───────────────────────────────────────────────────────────────
function getDateString(startDate, daysToAdd) {
  try {
    const d = new Date(startDate);
    d.setDate(d.getDate() + daysToAdd);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return `Day ${daysToAdd + 1}`; }
}

// ── Main Generator ────────────────────────────────────────────────────────────
async function generateItinerary({ origin, destination, days, budget, interests, travelers, startDate }) {
  const client = getClient();
  const numDays = parseInt(days);
  const totalBudget = parseFloat(budget);
  const numTravelers = parseInt(travelers) || 1;
  const interestsList = interests?.length > 0 ? interests.join(', ') : 'sightseeing, culture, food';

  const prompt = `You are an expert travel planner. Generate a detailed ${numDays}-day trip plan.

TRIP DETAILS:
- From: ${origin}
- To: ${destination}
- Days: ${numDays}
- Total Budget: $${totalBudget} USD for ${numTravelers} traveler(s)
- Interests: ${interestsList}

STRICT RULES:
1. Every attraction across ALL days must be completely DIFFERENT (no repeats ever)
2. Use REAL places that actually exist in ${destination}
3. Include real GPS coordinates (lat/lng) for every attraction
4. All costs must be realistic and add up within $${totalBudget} total
5. Return ONLY valid JSON — no markdown, no code blocks, no explanation text

Return this exact JSON structure:
{
  "title": "${numDays}-Day ${destination} Journey",
  "summary": "An exciting 2-3 sentence description of this trip tailored to the traveler's interests",
  "destination": {
    "city": "${destination}",
    "country": "actual country name",
    "coordinates": { "lat": actual_latitude, "lng": actual_longitude }
  },
  "origin": { "city": "${origin}" },
  "numberOfDays": ${numDays},
  "travelers": ${numTravelers},
  "budget": {
    "total": ${totalBudget},
    "currency": "USD",
    "perDay": ${Math.round(totalBudget / numDays)}
  },
  "costBreakdown": {
    "accommodation": realistic_number,
    "food": realistic_number,
    "activities": realistic_number,
    "transport": realistic_number,
    "misc": realistic_number
  },
  "estimatedTotalCost": ${totalBudget},
  "route": {
    "from": "${origin}",
    "to": "${destination}",
    "transportOptions": [
      { "mode": "Flight", "desc": "specific flight info from ${origin} to ${destination}", "tip": "practical booking tip" },
      { "mode": "Train", "desc": "specific train info if applicable", "tip": "booking tip" },
      { "mode": "Bus", "desc": "specific bus info if applicable", "tip": "booking tip" }
    ],
    "localTransport": "specific local transport options in ${destination} with costs"
  },
  "travelTips": [
    "tip 1 specific to ${destination}",
    "tip 2 specific to ${destination}",
    "tip 3 specific to ${destination}",
    "tip 4 specific to ${destination}",
    "tip 5 specific to ${destination}"
  ],
  "bestTimeToVisit": "specific best months to visit ${destination} and why",
  "hotels": [
    {
      "name": "real hotel name in ${destination}",
      "stars": 3,
      "pricePN": realistic_price_per_night,
      "area": "specific area/neighborhood",
      "amenities": ["WiFi", "Breakfast", "Pool"],
      "tip": "specific booking tip for this hotel"
    },
    {
      "name": "second real hotel name",
      "stars": 4,
      "pricePN": realistic_price,
      "area": "specific area",
      "amenities": ["WiFi", "Gym", "Restaurant"],
      "tip": "specific tip"
    },
    {
      "name": "third real hotel name",
      "stars": 2,
      "pricePN": budget_price,
      "area": "specific area",
      "amenities": ["WiFi", "AC"],
      "tip": "specific tip"
    }
  ],
  "itinerary": [
    ${Array.from({ length: numDays }, (_, i) => `{
      "day": ${i + 1},
      "date": "${startDate ? getDateString(startDate, i) : `Day ${i + 1}`}",
      "theme": "unique theme for day ${i + 1}",
      "travelNote": "practical note for this specific day including how to get around",
      "tips": "one specific local insider tip for day ${i + 1}",
      "dailyCost": realistic_daily_cost,
      "morning": {
        "activity": "specific activity description",
        "estimatedCost": cost_in_usd,
        "attraction": {
          "name": "UNIQUE real attraction name in ${destination}",
          "type": "landmark|culture|nature|art|history|food|shopping|adventure|beaches",
          "desc": "2 sentence description of this specific place",
          "cost": entry_cost_usd,
          "duration": "X-Y hrs",
          "area": "specific neighborhood in ${destination}",
          "coords": { "lat": precise_latitude, "lng": precise_longitude },
          "tips": "specific visitor tip for this attraction"
        }
      },
      "afternoon": {
        "activity": "specific afternoon activity",
        "estimatedCost": cost_in_usd,
        "attraction": {
          "name": "DIFFERENT unique real attraction",
          "type": "type",
          "desc": "2 sentence description",
          "cost": entry_cost_usd,
          "duration": "X-Y hrs",
          "area": "neighborhood",
          "coords": { "lat": precise_latitude, "lng": precise_longitude },
          "tips": "visitor tip"
        }
      },
      "evening": {
        "activity": "specific evening activity",
        "estimatedCost": cost_in_usd,
        "attraction": {
          "name": "DIFFERENT unique real place",
          "type": "type",
          "desc": "2 sentence description",
          "cost": entry_cost_usd,
          "duration": "X-Y hrs",
          "area": "neighborhood",
          "coords": { "lat": precise_latitude, "lng": precise_longitude },
          "tips": "visitor tip"
        }
      },
      "lunch": {
        "name": "real restaurant name in ${destination}",
        "cuisine": "cuisine type",
        "price": "$ or $$ or $$$",
        "costPP": cost_per_person,
        "area": "location area",
        "mustTry": "specific dish to order"
      },
      "dinner": {
        "name": "different real restaurant name",
        "cuisine": "cuisine type",
        "price": "$ or $$ or $$$",
        "costPP": cost_per_person,
        "area": "location area",
        "mustTry": "specific dish to order"
      }
    }`).join(',\n    ')}
  ]
}`;

  try {
    console.log(`🤖 Calling Groq AI for ${numDays}-day trip to ${destination}...`);

    const response = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are a travel planning expert. Always respond with valid JSON only. No markdown, no code blocks, no extra text — just raw JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 8000,
    });

    const text = response.choices[0]?.message?.content || '';

    // Clean response — remove markdown code blocks if model added them
    const cleaned = text
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim();

    const tripData = JSON.parse(cleaned);
    console.log(`✅ Groq generated ${tripData.itinerary?.length} days successfully`);
    return tripData;

  } catch (error) {
    console.error('❌ Groq AI error:', error.message);

    if (error instanceof SyntaxError) {
      throw new Error('AI returned invalid format. Please try again.');
    }
    if (error.message?.includes('429') || error.message?.includes('rate')) {
      throw new Error('AI rate limit reached. Please wait a moment and try again.');
    }
    throw new Error('AI generation failed: ' + error.message);
  }
}

module.exports = { generateItinerary };