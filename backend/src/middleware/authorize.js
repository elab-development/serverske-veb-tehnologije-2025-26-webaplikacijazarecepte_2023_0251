const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Pristup nije dozvoljen. Potrebna je autentifikacija.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Nemate dozvolu za ovu akciju.' });
    }

    next();
  };
};

module.exports = authorize;
