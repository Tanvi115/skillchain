import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import SubmissionModal from '@/components/SubmissionModal.jsx';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { Coins, Search, Calendar, TrendingUp, Briefcase } from 'lucide-react';

const TaskMarketplace = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [tokenRange, setTokenRange] = useState([0, 1000]);
  const [minSkillScore, setMinSkillScore] = useState(0);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = ['Dev', 'Design', 'Marketing', 'Writing', 'Other'];

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const records = await pb.collection('tasks').getFullList({
        filter: 'status = "open"',
        expand: 'employer_id',
        sort: '-created',
        $autoCancel: false
      });
      setTasks(records);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error loading tasks',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const filteredTasks = tasks.filter(task => {
    // Search filter
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !task.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Category filter
    if (selectedCategories.length > 0 && !selectedCategories.includes(task.category)) {
      return false;
    }

    // Token range filter
    if (task.token_reward < tokenRange[0] || task.token_reward > tokenRange[1]) {
      return false;
    }

    // Skill score filter
    if (task.minimum_skill_score && task.minimum_skill_score > (currentUser?.skillScore || 0)) {
      return false;
    }

    return true;
  });

  const handleApply = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const getCategoryColor = (category) => {
    const colors = {
      Dev: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      Design: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      Marketing: 'bg-green-500/10 text-green-400 border-green-500/20',
      Writing: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      Other: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    };
    return colors[category] || colors.Other;
  };

  return (
    <>
      <Helmet>
        <title>Task Marketplace - SkillChain</title>
        <meta name="description" content="Browse and apply to open tasks on SkillChain marketplace" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Header />

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Task Marketplace</h1>
            <p className="text-gray-400">Browse open tasks and start earning tokens</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 sticky top-24">
                <h2 className="text-xl font-bold text-white mb-6">Filters</h2>

                {/* Search */}
                <div className="mb-6">
                  <Label className="text-gray-200 mb-2 block">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tasks..."
                      className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <Label className="text-gray-200 mb-3 block">Categories</Label>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => handleCategoryToggle(category)}
                        />
                        <label htmlFor={category} className="text-sm text-gray-300 cursor-pointer">
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Token Range */}
                <div className="mb-6">
                  <Label className="text-gray-200 mb-3 block">
                    Token Reward: {tokenRange[0]} - {tokenRange[1]}
                  </Label>
                  <Slider
                    min={0}
                    max={1000}
                    step={10}
                    value={tokenRange}
                    onValueChange={setTokenRange}
                  />
                </div>

                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategories([]);
                    setTokenRange([0, 1000]);
                  }}
                  variant="outline"
                  className="w-full border-slate-700 text-gray-300 hover:bg-slate-700"
                >
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Tasks Grid */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="text-center py-12">
                  <div className="text-white text-xl">Loading tasks...</div>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
                  <Briefcase className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No tasks found matching your filters</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredTasks.map(task => (
                    <div
                      key={task.id}
                      className="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:border-blue-500/50 transition-all hover:shadow-xl"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">{task.title}</h3>
                          <p className="text-sm text-gray-400 mb-3 line-clamp-2">{task.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(task.category)}`}>
                          {task.category}
                        </span>
                        {task.expand?.employer_id?.company_name && (
                          <span className="text-xs text-gray-400">
                            by {task.expand.employer_id.company_name}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-300">
                          <Coins className="w-4 h-4 text-yellow-400 mr-2" />
                          <span className="font-semibold">{task.token_reward} tokens</span>
                        </div>
                        {task.deadline && (
                          <div className="flex items-center text-sm text-gray-400">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                        {task.minimum_skill_score > 0 && (
                          <div className="flex items-center text-sm text-gray-400">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            <span>Min. Score: {task.minimum_skill_score}</span>
                          </div>
                        )}
                        {task.submission_count > 0 && (
                          <div className="text-sm text-gray-400">
                            {task.submission_count} submission{task.submission_count !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={() => handleApply(task)}
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white"
                      >
                        Apply Now
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedTask && (
        <SubmissionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTask(null);
            fetchTasks(); // Refresh to update submission counts
          }}
          task={selectedTask}
        />
      )}
    </>
  );
};

export default TaskMarketplace;