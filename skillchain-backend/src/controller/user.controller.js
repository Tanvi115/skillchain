const supabase = require('../../config/db');

const getLeaderboard = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('name, total_skill_score')
      .eq('role', 'freelancer')
      .order('total_skill_score', { ascending: false })
      .limit(10);
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('*').eq('id', req.params.id).single();
    if (error || !data) return res.status(404).json({ error: 'User not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getLeaderboard, getUserProfile };