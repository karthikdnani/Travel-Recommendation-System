const mongoose = require('mongoose');

const coordinatesSchema = new mongoose.Schema({ lat: Number, lng: Number }, { _id: false });

const attractionSchema = new mongoose.Schema({
  name: String,
  type: String,
  desc: String,
  cost: Number,
  duration: String,
  area: String,
  coords: coordinatesSchema,
  tips: String,
  imageUrl: String,
}, { _id: false });

const mealSchema = new mongoose.Schema({
  name: String,
  cuisine: String,
  price: String,
  costPP: Number,
  area: String,
  mustTry: String,
}, { _id: false });

const daySchema = new mongoose.Schema({
  day: Number,
  date: String,
  theme: String,
  travelNote: String,
  tips: String,
  dailyCost: Number,
  morning: {
    activity: String,
    estimatedCost: Number,
    attraction: attractionSchema,
  },
  afternoon: {
    activity: String,
    estimatedCost: Number,
    attraction: attractionSchema,
  },
  evening: {
    activity: String,
    estimatedCost: Number,
    attraction: attractionSchema,
  },
  lunch: mealSchema,
  dinner: mealSchema,
}, { _id: false });

const hotelSchema = new mongoose.Schema({
  name: String,
  stars: Number,
  pricePN: Number,
  area: String,
  amenities: [String],
  tip: String,
  imageUrl: String,
}, { _id: false });

const tripSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  origin: { city: String },
  destination: {
    city: String,
    country: String,
    coordinates: coordinatesSchema,
  },
  startDate: String,
  numberOfDays: { type: Number, required: true },
  travelers: { type: Number, default: 1 },
  budget: {
    total: Number,
    currency: { type: String, default: 'USD' },
    perDay: Number,
  },
  interests: [String],
  itinerary: [daySchema],
  hotels: [hotelSchema],
  costBreakdown: {
    accommodation: Number,
    food: Number,
    activities: Number,
    transport: Number,
    misc: Number,
  },
  estimatedTotalCost: Number,
  route: {
    from: String,
    to: String,
    transportOptions: [{ mode: String, desc: String, tip: String }],
    localTransport: String,
  },
  summary: String,
  travelTips: [String],
  bestTimeToVisit: String,
  status: { type: String, enum: ['planned', 'ongoing', 'completed', 'cancelled'], default: 'planned' },
  coverImage: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

tripSchema.pre('save', function (next) { this.updatedAt = Date.now(); next(); });

module.exports = mongoose.model('Trip', tripSchema);
