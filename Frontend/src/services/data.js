// ─────────────────────────────────────────────
//  Dummy / Static Data  –  No backend required
// ─────────────────────────────────────────────

export const dummyData = {
  user: {
    name: 'Rajesh Kumar',
    points: 1250,
    pointsThisMonth: 320,
    level: 'Gold Member',
  },

  rewards: [
    {
      icon: '⚡', title: 'Electricity Bill',
      description: 'Save on monthly electricity bills',
      amount: '₹150 saved', color: '#f59e0b',
      benefit: 'You can save ₹150 on your next electricity bill using 500 points.',
    },
    {
      icon: '💧', title: 'Water Bill',
      description: 'Discount on water usage charges',
      amount: '₹80 saved', color: '#3b82f6',
      benefit: 'Redeem 300 points for ₹80 off on your water bill.',
    },
    {
      icon: '🔥', title: 'LPG Subsidy',
      description: 'Extra LPG cylinder subsidy',
      amount: '₹120 saved', color: '#ef4444',
      benefit: 'Get ₹120 LPG subsidy enhancement with 450 points.',
    },
  ],

  rewardHistory: [
    { date: '2026-03-15', points: 200, type: 'Electricity Bill', amount: '₹60' },
    { date: '2026-03-01', points: 150, type: 'Water Bill',       amount: '₹40' },
    { date: '2026-02-20', points: 300, type: 'LPG Subsidy',      amount: '₹90' },
    { date: '2026-02-10', points: 100, type: 'Electricity Bill', amount: '₹30' },
    { date: '2026-01-28', points: 250, type: 'Water Bill',       amount: '₹70' },
  ],

  complaints: [
    { id: 'CMP001', issue: 'Overflowing bin near market',    location: 'Lajpat Nagar Main Rd',    status: 'Resolved', date: '2026-03-18', priority: 'High'   },
    { id: 'CMP002', issue: 'Vahan not arriving on time',     location: 'Defence Colony Block A',   status: 'Pending',  date: '2026-03-19', priority: 'Medium' },
    { id: 'CMP003', issue: 'Littering by shopkeepers',       location: 'Krishna Market, Gate 2',   status: 'Pending',  date: '2026-03-20', priority: 'Low'    },
    { id: 'CMP004', issue: 'Broken bin lid',                 location: 'South Extension II',       status: 'Resolved', date: '2026-03-15', priority: 'Low'    },
    { id: 'CMP005', issue: 'Mixed waste dumping issue',      location: 'Lajpat Nagar C-Block',     status: 'Pending',  date: '2026-03-21', priority: 'High'   },
  ],

  areas: {
    'lajpat-nagar': {
      name: 'Lajpat Nagar', hindi: 'लाजपत नगर', emoji: '🏪',
      description: "A bustling commercial hub in South Delhi, famous for its vibrant markets, textile shops, and food stalls. One of Delhi's oldest and most popular shopping destinations with heavy footfall throughout the day.",
      population: '~85,000 residents', area: '4.2 km²', type: 'Commercial + Residential',
      bins: [
        { area: 'Main Market',       level: 87, waste: { Plastic: 45, Organic: 30, Paper: 25 } },
        { area: 'C-Block',           level: 62, waste: { Plastic: 35, Organic: 40, Paper: 25 } },
        { area: 'Metro Station Area',level: 74, waste: { Plastic: 50, Organic: 20, Paper: 30 } },
      ],
      wasteDNA: { Plastic: 42, Organic: 35, Paper: 23 },
      insight: 'High plastic percentage due to extensive food delivery packaging and market waste. Morning peaks on weekends. Immediate plastic management campaign recommended.',
      collectionsToday: 12, wasteCollected: '4.8 tonnes', color: '#4CAF50',
      landmarks: ['Lajpat Nagar Market', 'Metro Station', 'Central Market', 'Jal Vihar'],
    },
    'defence-colony': {
      name: 'Defence Colony', hindi: 'डिफेन्स कॉलोनी', emoji: '🏘️',
      description: 'An upscale residential colony in South Delhi, originally developed for defence personnel. Known for its wide tree-lined streets, affluent households, and well-maintained infrastructure.',
      population: '~42,000 residents', area: '3.8 km²', type: 'Residential',
      bins: [
        { area: 'Block A',     level: 55, waste: { Plastic: 30, Organic: 45, Paper: 25 } },
        { area: 'Block C',     level: 40, waste: { Plastic: 25, Organic: 50, Paper: 25 } },
        { area: 'Market Area', level: 68, waste: { Plastic: 40, Organic: 35, Paper: 25 } },
      ],
      wasteDNA: { Plastic: 30, Organic: 46, Paper: 24 },
      insight: 'Predominantly organic waste from residential cooking and green gardens. Better segregation compliance observed. Model area for Swachh Bharat implementation.',
      collectionsToday: 8, wasteCollected: '2.1 tonnes', color: '#3b82f6',
      landmarks: ['DDA Market', 'Community Centre', 'Arjun Marg', 'Bhishma Pitamah Marg'],
    },
    'krishna-market': {
      name: 'Krishna Market', hindi: 'कृष्णा मार्केट', emoji: '🛒',
      description: 'A popular wholesale and retail market in the Lajpat Nagar area, known for affordable clothing, textiles, and daily essentials. High footfall throughout the day with significant commercial waste.',
      population: '~28,000 in vicinity', area: '1.2 km²', type: 'Commercial',
      bins: [
        { area: 'Gate 1 Area',     level: 91, waste: { Plastic: 55, Organic: 25, Paper: 20 } },
        { area: 'Gate 2 Area',     level: 78, waste: { Plastic: 50, Organic: 28, Paper: 22 } },
        { area: 'Interior Market', level: 83, waste: { Plastic: 52, Organic: 26, Paper: 22 } },
      ],
      wasteDNA: { Plastic: 52, Organic: 26, Paper: 22 },
      insight: 'Critically high plastic levels from packaging waste. Immediate intervention needed. Commercial activity peaks 10am–8pm. Extra collection rounds strongly recommended.',
      collectionsToday: 6, wasteCollected: '1.9 tonnes', color: '#ef4444',
      landmarks: ['Krishna Market Complex', 'F Block', 'Birbal Road'],
    },
    'south-extension': {
      name: 'South Extension', hindi: 'साउथ एक्सटेंशन', emoji: '🏬',
      description: 'A premier shopping and residential area in South Delhi comprising South Extension Part I and II. Home to high-end retail outlets, restaurants, and upscale residences.',
      population: '~56,000 residents', area: '5.1 km²', type: 'Mixed Commercial + Residential',
      bins: [
        { area: 'Part I Market',          level: 72, waste: { Plastic: 40, Organic: 35, Paper: 25 } },
        { area: 'Part II Residential',    level: 45, waste: { Plastic: 28, Organic: 48, Paper: 24 } },
        { area: 'Outer Ring Road Area',   level: 60, waste: { Plastic: 38, Organic: 38, Paper: 24 } },
      ],
      wasteDNA: { Plastic: 37, Organic: 40, Paper: 23 },
      insight: 'Balanced waste mix. Residential areas showing good composting habits. Market areas need better plastic disposal enforcement near food courts. Weekend increase advised.',
      collectionsToday: 10, wasteCollected: '3.2 tonnes', color: '#8b5cf6',
      landmarks: ['South Ex Part I', 'South Ex Part II', 'Bhishma Pitamah Marg', 'Outer Ring Road'],
    },
    'andrews-ganj': {
      name: 'Andrews Ganj', hindi: 'एंड्रयूज गंज', emoji: '🏘️',
      description: 'A central residential area in South Delhi, home to various government colonies and institutional areas. Known for its quiet atmosphere and green cover.',
      population: '~15,000 residents', area: '1.8 km²', type: 'Residential',
      bins: [
        { area: 'HUDCO Place', level: 35, waste: { Plastic: 20, Organic: 60, Paper: 20 } },
        { area: 'Sector 1',     level: 42, waste: { Plastic: 25, Organic: 55, Paper: 20 } },
      ],
      wasteDNA: { Plastic: 22, Organic: 58, Paper: 20 },
      insight: 'High organic waste concentration. Recommended for local decentralized composting units.',
      collectionsToday: 4, wasteCollected: '1.2 tonnes', color: '#10b981',
      landmarks: ['HUDCO Place', 'Ansal Plaza', 'South Extension I'],
    },
    'moolchand': {
      name: 'Moolchand Area', hindi: 'मूलचंद क्षेत्र', emoji: '🏥',
      description: 'The area surrounding the iconic Moolchand Medcity. It serves as a major transit point between South and Central Delhi with significant healthcare activity.',
      population: 'N/A (Healthcare Zone)', area: '0.9 km²', type: 'Healthcare + Transit',
      bins: [
        { area: 'Hospital Gate', level: 85, waste: { Plastic: 30, Organic: 10, Hazardous: 60 } },
        { area: 'Metro Plaza',   level: 78, waste: { Plastic: 60, Organic: 20, Paper: 20 } },
      ],
      wasteDNA: { Plastic: 45, Organic: 15, Hazardous: 40 },
      insight: 'Significant hazardous waste monitoring required. Specialized medical waste collection strictly enforced.',
      collectionsToday: 9, wasteCollected: '2.5 tonnes', color: '#f43f5e',
      landmarks: ['Moolchand Medcity', 'Moolchand Metro Station', 'Lajpat Nagar IV'],
    },
    'jangpura': {
      name: 'Jangpura', hindi: 'जंगपुरा', emoji: '🏘️',
      description: 'A historic residential neighborhood in South East Delhi. It is known for its diverse community and proximity to the Nizamuddin Railway Station.',
      population: '~48,000 residents', area: '2.4 km²', type: 'Residential',
      bins: [
        { area: 'Jangpura Extension', level: 56, waste: { Plastic: 35, Organic: 40, Paper: 25 } },
        { area: 'Bhogal Market',      level: 82, waste: { Plastic: 50, Organic: 25, Paper: 25 } },
      ],
      wasteDNA: { Plastic: 40, Organic: 35, Paper: 25 },
      insight: 'High density residential area. Bhogal market needs extra collection capacity on evenings.',
      collectionsToday: 7, wasteCollected: '2.1 tonnes', color: '#6366f1',
      landmarks: ['Bhogal Market', 'Jangpura Metro Station', 'Sanatan Dharam Mandir'],
    },
    'sewa-nagar': {
      name: 'Sewa Nagar', hindi: 'सेवा नगर', emoji: '🏠',
      description: 'A railway colony and residential area in South Delhi. Characterized by government housing and community-centric living.',
      population: '~18,000 residents', area: '1.5 km²', type: 'Residential',
      bins: [
        { area: 'Railway Colony', level: 34, waste: { Plastic: 20, Organic: 65, Paper: 15 } },
        { area: 'Transit Camp',   level: 48, waste: { Plastic: 30, Organic: 50, Paper: 20 } },
      ],
      wasteDNA: { Plastic: 25, Organic: 60, Paper: 15 },
      insight: 'Strong organic waste presence. Residents show high participation in community cleanliness drives.',
      collectionsToday: 5, wasteCollected: '1.4 tonnes', color: '#84cc16',
      landmarks: ['Sewa Nagar Rly Station', 'Sunehari Pullah', 'Pragati Vihar'],
    },
    'kotla-mubarakpur': {
      name: 'Kotla Mubarakpur', hindi: 'कोटला मुबारकपुर', emoji: '🏬',
      description: 'A dense urban village and major market area in South Delhi. Known for its narrow lanes and heavy commercial activity mixed with residential dwellings.',
      population: '~1.2 Lakh residents', area: '3.1 km²', type: 'Dense Residential + Commercial',
      bins: [
        { area: 'Main Market',     level: 94, waste: { Plastic: 55, Organic: 30, Paper: 15 } },
        { area: 'Gurudwara Road',  level: 81, waste: { Plastic: 45, Organic: 40, Paper: 15 } },
      ],
      wasteDNA: { Plastic: 50, Organic: 35, Paper: 15 },
      insight: 'Critically high waste generation. Narrow lanes require smaller collection vehicles (Vahan Nano) for effective clearance.',
      collectionsToday: 14, wasteCollected: '5.2 tonnes', color: '#ec4899',
      landmarks: ['Kotla Market', 'Bapu Park', 'South Ex Metro Station'],
    },
  },

  chatReplies: [
    "Please segregate your waste into Dry, Wet, and Hazardous categories before the vahan arrives! ♻️",
    "The kachra vahan visits your area every morning between 7AM–10AM. Keep waste ready at the designated collection point.",
    "You can earn Swachh Points by uploading images of properly segregated waste in the Swachh AI section!",
    "For hazardous waste like batteries, medicines, and electronics — use the dedicated drop points at ward offices.",
    "Plastic bottles and cardboard should be cleaned before disposal to increase recycling value. 📦",
    "Report any missed collection directly from the 'Report Issue' section. We resolve within 24 hours!",
    "Composting organic waste at home earns you 50 bonus points per month. Ask me how to start! 🌱",
    "Your area's waste DNA shows 42% plastic. Reducing single-use plastics improves your community score. 🌍",
  ],

  routes: [
    {
      id: 'R1', name: 'Route Alpha', color: '#ef4444',
      zones: ['Lajpat Nagar Main', 'Krishna Market', 'Lajpat Nagar C-Block'],
      distance: '8.4 km', eta: '42 min', fuel: '3.2 L',
      status: 'Active', driver: 'Ramesh Singh', vehicle: 'DL-01-GC-4421',
      stops: 6, collected: '4.8 T',
    },
    {
      id: 'R2', name: 'Route Beta', color: '#3b82f6',
      zones: ['Defence Colony Block A', 'Defence Colony Block C', 'DDA Market'],
      distance: '6.1 km', eta: '31 min', fuel: '2.3 L',
      status: 'Active', driver: 'Suresh Kumar', vehicle: 'DL-01-GC-3312',
      stops: 5, collected: '2.1 T',
    },
    {
      id: 'R3', name: 'Route Gamma', color: '#4CAF50',
      zones: ['South Extension Part I', 'South Extension Part II'],
      distance: '7.8 km', eta: '38 min', fuel: '2.9 L',
      status: 'Completed', driver: 'Mohan Lal', vehicle: 'DL-01-GC-2290',
      stops: 7, collected: '3.2 T',
    },
  ],
}
