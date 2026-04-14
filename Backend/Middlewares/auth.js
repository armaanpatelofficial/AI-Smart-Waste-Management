const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  // Bypass for mock tokens
  if (token && token.startsWith('mock-token-')) {
    const role = token.replace('mock-token-', '');
    req.user = { 
        id: 'mock-id-' + role, 
        role: role, 
        name: role.charAt(0).toUpperCase() + role.slice(1) + ' User' 
    };
    return next();
  }

  if (!token) return res.status(401).json({ message: 'Not authorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const municipalOnly = (req, res, next) => {
  if (req.user?.role !== 'municipal') return res.status(403).json({ message: 'Municipal access only' });
  next();
};

const vahanOnly = (req, res, next) => {
  if (req.user?.role !== 'vahan') return res.status(403).json({ message: 'Vahan Chalak access only' });
  next();
};

module.exports = { protect, municipalOnly, vahanOnly };

