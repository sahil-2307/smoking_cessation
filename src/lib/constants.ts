export const APP_NAME = 'QuitSmoking';
export const APP_DESCRIPTION = 'Your companion for a smoke-free life';

export const QUIT_METHODS = {
  cold_turkey: 'Cold Turkey',
  gradual: 'Gradual Reduction',
  nrt: 'Nicotine Replacement',
  prescription: 'Prescription Medication'
} as const;

export const CRAVING_TRIGGERS = [
  { id: 'stress', name: 'Stress', icon: '😰', color: 'text-red-500' },
  { id: 'social', name: 'Social', icon: '👥', color: 'text-blue-500' },
  { id: 'routine', name: 'Routine', icon: '⏰', color: 'text-yellow-500' },
  { id: 'boredom', name: 'Boredom', icon: '😴', color: 'text-gray-500' },
  { id: 'alcohol', name: 'Alcohol', icon: '🍺', color: 'text-orange-500' },
  { id: 'other', name: 'Other', icon: '❓', color: 'text-purple-500' }
] as const;

export const MOOD_OPTIONS = [
  { value: 'excellent', label: 'Excellent', emoji: '😄', color: 'text-green-600' },
  { value: 'good', label: 'Good', emoji: '😊', color: 'text-green-500' },
  { value: 'okay', label: 'Okay', emoji: '😐', color: 'text-yellow-500' },
  { value: 'difficult', label: 'Difficult', emoji: '😔', color: 'text-orange-500' },
  { value: 'terrible', label: 'Terrible', emoji: '😢', color: 'text-red-500' }
] as const;

export const DISTRACTION_ACTIVITIES = [
  {
    id: '1',
    title: '4-7-8 Breathing',
    description: 'Inhale for 4, hold for 7, exhale for 8',
    duration: 5,
    type: 'breathing'
  },
  {
    id: '2',
    title: 'Quick Walk',
    description: 'Take a 5-minute walk around the block',
    duration: 5,
    type: 'physical'
  },
  {
    id: '3',
    title: 'Memory Game',
    description: 'Play a quick memory challenge',
    duration: 3,
    type: 'mental'
  },
  {
    id: '4',
    title: 'Positive Affirmations',
    description: 'Read and repeat positive quit smoking affirmations',
    duration: 2,
    type: 'mental'
  }
] as const;

export const HEALTH_MILESTONES = [
  {
    timeframe: '20 minutes',
    title: 'Heart Rate Normalizes',
    description: 'Your heart rate and blood pressure drop to normal levels'
  },
  {
    timeframe: '12 hours',
    title: 'Carbon Monoxide Clears',
    description: 'Carbon monoxide levels in your blood return to normal'
  },
  {
    timeframe: '2 weeks',
    title: 'Circulation Improves',
    description: 'Your circulation improves and lung function increases'
  },
  {
    timeframe: '1 month',
    title: 'Coughing Decreases',
    description: 'Coughing and shortness of breath decrease significantly'
  },
  {
    timeframe: '3 months',
    title: 'Lung Function Boost',
    description: 'Your lung function begins to improve dramatically'
  },
  {
    timeframe: '1 year',
    title: 'Heart Disease Risk Halved',
    description: 'Your risk of coronary heart disease is cut in half'
  },
  {
    timeframe: '5 years',
    title: 'Stroke Risk Normalized',
    description: 'Your stroke risk is reduced to that of a non-smoker'
  }
] as const;

export const ACHIEVEMENT_TYPES = {
  FIRST_DAY: 'first_day',
  ONE_WEEK: 'one_week',
  ONE_MONTH: 'one_month',
  THREE_MONTHS: 'three_months',
  SIX_MONTHS: 'six_months',
  ONE_YEAR: 'one_year',
  CRAVING_CRUSHER_10: 'craving_crusher_10',
  CRAVING_CRUSHER_50: 'craving_crusher_50',
  CRAVING_CRUSHER_100: 'craving_crusher_100',
  COMMUNITY_HELPER: 'community_helper',
  JOURNAL_KEEPER: 'journal_keeper'
} as const;

export const ACHIEVEMENT_DEFINITIONS = {
  [ACHIEVEMENT_TYPES.FIRST_DAY]: {
    title: 'First Day Hero',
    description: 'Completed your first day smoke-free',
    icon: '🌟',
    color: 'text-yellow-500'
  },
  [ACHIEVEMENT_TYPES.ONE_WEEK]: {
    title: 'Week Warrior',
    description: 'One full week without smoking',
    icon: '⚡',
    color: 'text-blue-500'
  },
  [ACHIEVEMENT_TYPES.ONE_MONTH]: {
    title: '30-Day Champion',
    description: 'One month of being smoke-free',
    icon: '🏆',
    color: 'text-gold-500'
  },
  [ACHIEVEMENT_TYPES.CRAVING_CRUSHER_10]: {
    title: 'Craving Crusher',
    description: 'Successfully resisted 10 cravings',
    icon: '💪',
    color: 'text-red-500'
  }
} as const;

export const REASONS_FOR_QUITTING = [
  'Health concerns',
  'Save money',
  'Family pressure',
  'Pregnancy',
  'Smell/appearance',
  'Athletic performance',
  'Social stigma',
  'Medical advice',
  'Setting good example',
  'Personal challenge'
] as const;

export const MOTIVATIONAL_QUOTES = [
  "Every cigarette you don't smoke is doing you good.",
  "You're stronger than your cravings.",
  "One day at a time, one craving at a time.",
  "Your health is worth more than any cigarette.",
  "You've quit before - this craving will pass too.",
  "Think about why you started this journey.",
  "You're not giving up something, you're gaining everything.",
  "This too shall pass - cravings are temporary."
] as const;

export const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$'
} as const;

export const EQUIVALENT_PURCHASES = {
  coffee: { name: 'Coffee', price: 150 },
  meal: { name: 'Restaurant meal', price: 500 },
  movie: { name: 'Movie ticket', price: 300 },
  book: { name: 'Book', price: 400 },
  fuel: { name: 'Liter of petrol', price: 100 }
} as const;