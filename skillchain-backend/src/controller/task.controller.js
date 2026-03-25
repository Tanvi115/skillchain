const supabase = require('../../config/db');

const getTasks = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createTask = async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      company_id: req.user.id,
      company_name: req.user.company_name || 'Company',
      status: 'open'
    };
    
    const { data, error } = await supabase.from('tasks').insert(taskData).select().single();
    if (error) throw error;
    
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getTasks,
  createTask
};