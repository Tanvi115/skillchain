const supabase = require('../../config/db');

const createTask = async (req, res) => {
  try {
    const { title, description, skillCategory, tokenReward, minSkillScore, deadline, tags } = req.body;
    const company = req.user;
    const reserveKey = `token_reserve_${skillCategory}`;

    if (company[reserveKey] < tokenReward)
      return res.status(400).json({ error: `Insufficient token reserve. You have ${company[reserveKey]} ${skillCategory} tokens.` });

    await supabase.from('users').update({ [reserveKey]: company[reserveKey] - tokenReward }).eq('id', company.id);

    const { data: task, error } = await supabase.from('tasks').insert({
      company_id: company.id,
      company_name: company.company_name,
      company_logo: company.company_logo,
      title, description,
      skill_category: skillCategory,
      token_reward: tokenReward,
      min_skill_score: minSkillScore || 0,
      deadline: deadline || null,
      tags: tags || [],
    }).select().single();

    if (error) throw new Error(error.message);

    await supabase.from('transactions').insert({
      type: 'task_post_lock',
      from_user: company.id,
      amount: tokenReward,
      skill_category: skillCategory,
      task_id: task.id,
      note: `Tokens locked for task: ${title}`,
      from_balance_after: company[reserveKey] - tokenReward,
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTasks = async (req, res) => {
  try {
    const { skillCategory, minReward, maxReward, status, page = 1, limit = 20 } = req.query;

    let query = supabase.from('tasks').select('*', { count: 'exact' }).eq('status', status || 'open');

    if (skillCategory) query = query.eq('skill_category', skillCategory);
    if (minReward)     query = query.gte('token_reward', Number(minReward));
    if (maxReward)     query = query.lte('token_reward', Number(maxReward));
    if (req.user.role === 'freelancer')
      query = query.lte('min_skill_score', req.user.total_skill_score);

    const from = (page - 1) * limit;
    query = query.order('created_at', { ascending: false }).range(from, from + Number(limit) - 1);

    const { data: tasks, count, error } = await query;
    if (error) throw new Error(error.message);

    res.json({ tasks, total: count, page: Number(page), pages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTask = async (req, res) => {
  try {
    const { data: task, error } = await supabase.from('tasks').select('*').eq('id', req.params.id).single();
    if (error || !task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMyTasks = async (req, res) => {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks').select('*').eq('company_id', req.user.id).order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const cancelTask = async (req, res) => {
  try {
    const { data: task, error } = await supabase.from('tasks').select('*').eq('id', req.params.id).single();
    if (error || !task) return res.status(404).json({ error: 'Task not found' });
    if (task.company_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    if (task.status !== 'open') return res.status(400).json({ error: 'Only open tasks can be cancelled' });

    await supabase.from('tasks').update({ status: 'cancelled' }).eq('id', task.id);

    const reserveKey = `token_reserve_${task.skill_category}`;
    const newReserve = req.user[reserveKey] + task.token_reward;
    await supabase.from('users').update({ [reserveKey]: newReserve }).eq('id', req.user.id);

    await supabase.from('transactions').insert({
      type: 'task_cancel_refund',
      to_user: req.user.id,
      amount: task.token_reward,
      skill_category: task.skill_category,
      task_id: task.id,
      note: `Refund for cancelled task: ${task.title}`,
      to_balance_after: newReserve,
    });

    res.json({ message: 'Task cancelled and tokens refunded', task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createTask, getTasks, getTask, getMyTasks, cancelTask };