// Static area data (replace with DB if needed)
const areas = {
  'lajpat-nagar': { name: 'Lajpat Nagar', binLevel: 82, wasteDNA: { Plastic: 42, Organic: 35, Paper: 23 }, collectionsToday: 12 },
  'defence-colony': { name: 'Defence Colony', binLevel: 45, wasteDNA: { Plastic: 30, Organic: 46, Paper: 24 }, collectionsToday: 8 },
  'krishna-market': { name: 'Krishna Market', binLevel: 91, wasteDNA: { Plastic: 52, Organic: 26, Paper: 22 }, collectionsToday: 6 },
  'south-extension': { name: 'South Extension', binLevel: 58, wasteDNA: { Plastic: 37, Organic: 40, Paper: 23 }, collectionsToday: 10 },
};

const getArea = (req, res) => {
  const area = areas[req.params.name];
  if (!area) return res.status(404).json({ message: 'Area not found' });
  res.json(area);
};

const getAllAreas = (req, res) => res.json(areas);

module.exports = { getArea, getAllAreas };
