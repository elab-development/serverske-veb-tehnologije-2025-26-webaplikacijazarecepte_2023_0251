const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: 'Pristup nije dozvoljen. Potrebna je autentifikacija.' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'cloud-recepti-secret-key';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Nevažeći ili istekli token.' });
  }
};

module.exports = authenticate;
