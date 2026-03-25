const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../../config/db');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, companyName } = req.body;
    
    const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
    if (existing) return res.status(409).json({ error: 'Email exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const userData = {
      name, email, password: hashedPassword, role,
      company_name: role === 'company' ? companyName : null,
      token_reserve_dev: role === 'company' ? 1000 : 0,
      token_reserve_design: role === 'company' ? 1000 : 0,
      total_skill_score: 0
    };

    const { data: user, error } = await supabase.from('users').insert(userData).select().single();
    if (error) throw error;

    res.status(201).json({
      ...user,
      token: generateToken(user.id)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data: user } = await supabase.from('users').select('*').eq('email', email).single();
    
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...userWithoutPassword } = user;
      res.json({ ...userWithoutPassword, token: generateToken(user.id) });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMe = (req, res) => {
  const { password, ...user } = req.user;
  res.json(user);
};