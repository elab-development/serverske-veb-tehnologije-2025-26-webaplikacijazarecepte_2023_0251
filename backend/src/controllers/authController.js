const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

const secret = process.env.JWT_SECRET || 'steh-recepti-secret-key';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email, role: user.role },
    secret,
    { expiresIn: '24h' }
  );
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Korisnik sa tim korisničkim imenom ili email-om već postoji.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const maxUser = await User.findOne().sort({ id: -1 });
    const newId = maxUser ? maxUser.id + 1 : 1;

    const user = new User({
      id: newId,
      username,
      email,
      password: hashedPassword,
      role: 'user'
    });

    await user.save();

    const token = generateToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // true in production with HTTPS
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24h
    });

    res.status(201).json({
      message: 'Registracija uspešna',
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({
      $or: [{ username: username }, { email: username }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Pogrešno korisničko ime ili lozinka' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Pogrešno korisničko ime ili lozinka' });
    }

    const token = generateToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'Uspešna prijava',
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/logout
const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Uspešna odjava' });
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Korisnik sa tom email adresom nije pronađen.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 3600000; // 1 sat
    await user.save();

    // U produkciji bi ovde išao nodemailer za slanje email-a
    // Za demo svrhe, vraćamo token u odgovoru
    res.json({
      message: 'Token za resetovanje lozinke je generisan.',
      resetToken, // U produkciji se NE vraća klijentu, već se šalje email-om
      note: 'U produkciji bi ovaj token bio poslat email-om.'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token je nevažeći ili je istekao.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    res.json({ message: 'Lozinka je uspešno promenjena.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me - provera trenutnog korisnika
const me = async (req, res) => {
  try {
    const user = await User.findOne({ id: req.user.id }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Korisnik nije pronađen' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, logout, forgotPassword, resetPassword, me };
