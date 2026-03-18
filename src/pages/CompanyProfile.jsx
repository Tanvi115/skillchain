import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Coins, Briefcase, CheckCircle, Clock, Calendar } from 'lucide-react';

const CompanyProfile = () => {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    fetchProfileData();
  }, [userId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      // Fetch user data
      const userData = await pb.collection('users').getOne(userId, { $autoCancel: false });
      setUser(userData);

      // Fetch tasks
      const taskRecords = await pb.collection('tasks').getFullList({
        filter: `employer_id = "${userId}"`,
        sort: '-created',
        $autoCancel: false
      });
      setTasks(taskRecords);

      // Fetch submissions (only if own profile)
      if (isOwnProfile) {
        const taskIds = taskRecords.map(t => t.id);
        if (taskIds.length > 0) {
          const filter = taskIds.map(id => `task_id = "${id}"`).join(' || ');
          const submissionRecords = await pb.collection('submissions').getFullList({
            filter,
            expand: 'freelancer_id,task_id',
            sort: '-created',
            $autoCancel: false
          });
          setSubmissions(submissionRecords);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error loading profile',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      in_progress: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      completed: 'bg-green-500/10 text-green-400 border-green-500/20'
    };
    return badges[status] || badges.open;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-white text-xl">Loading profile...</div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-white text-xl">Company not found</div>
        </div>
      </>
    );
  }

  const tokenBalance = (user.totalTokensEarned || 0) - (user.totalTokensSpent || 0);
  const activeTasks = tasks.filter(t => t.status === 'open').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;

  return (
    <>
      <Helmet>
        <title>{`${user.company_name || user.username} - SkillChain Company Profile`}</title>
        <meta name="description" content={`View ${user.company_name || user.username}'s posted tasks and company profile on SkillChain`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Header />

        <div className="container mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 mb-8">
            <div className="flex items-start space-x-6">
              <Avatar className="w-24 h-24">
                <AvatarImage 
                  src={user.avatar ? pb.files.getUrl(user, user.avatar) : user.avatar_url} 
                  alt={user.company_name || user.username} 
                />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-400 text-white text-3xl">
                  {(user.company_name || user.username)?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">{user.company_name || user.username}</h1>
                {user.bio && <p className="text-gray-400 mb-4">{user.bio}</p>}
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-slate-900 rounded-lg p-4">
                    <div className="flex items-center text-yellow-400 mb-1">
                      <Coins className="w-4 h-4 mr-2" />
                      <span className="text-sm">Token Balance</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{tokenBalance}</p>
                  </div>

                  <div className="bg-slate-900 rounded-lg p-4">
                    <div className="flex items-center text-blue-400 mb-1">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-sm">Active Tasks</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{activeTasks}</p>
                  </div>

                  <div className="bg-slate-900 rounded-lg p-4">
                    <div className="flex items-center text-green-400 mb-1">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span className="text-sm">Completed</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{completedTasks}</p>
                  </div>
                </div>
              </div>

              {isOwnProfile && (
                <Button
                  onClick={() => toast({ title: '🚧 This feature isn\'t implemented yet—but don\'t worry! You can request it in your next prompt! 🚀' })}
                  variant="outline"
                  className="border-purple-400 text-purple-400 hover:bg-purple-400/10"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          <Tabs defaultValue="tasks" className="space-y-6">
            <TabsList className="bg-slate-800 border border-slate-700">
              <TabsTrigger value="tasks" className="data-[state=active]:bg-slate-700">
                Posted Tasks ({tasks.length})
              </TabsTrigger>
              {isOwnProfile && (
                <TabsTrigger value="submissions" className="data-[state=active]:bg-slate-700">
                  Submissions ({submissions.length})
                </TabsTrigger>
              )}
            </TabsList>

            {/* Tasks Tab */}
            <TabsContent value="tasks">
              {tasks.length === 0 ? (
                <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
                  <Briefcase className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No tasks posted yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map(task => (
                    <div key={task.id} className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">{task.title}</h3>
                          <p className="text-sm text-gray-400 mb-3 line-clamp-2">{task.description}</p>
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(task.status)}`}>
                              {task.status}
                            </span>
                            <span className="text-sm text-gray-500">{task.category}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-yellow-400 font-bold text-lg mb-2">
                            <Coins className="w-5 h-5 mr-1" />
                            {task.token_reward}
                          </div>
                          {task.submission_count > 0 && (
                            <p className="text-sm text-gray-400">
                              {task.submission_count} submission{task.submission_count !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                      {task.deadline && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-2" />
                          Deadline: {new Date(task.deadline).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Submissions Tab */}
            {isOwnProfile && (
              <TabsContent value="submissions">
                {submissions.length === 0 ? (
                  <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
                    <CheckCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No submissions received yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.map(submission => (
                      <div key={submission.id} className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-2">
                              {submission.expand?.task_id?.title}
                            </h3>
                            <p className="text-sm text-gray-400 mb-2">
                              By: {submission.expand?.freelancer_id?.username}
                            </p>
                            <div className="flex items-center space-x-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                                submission.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                submission.status === 'accepted' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                'bg-red-500/10 text-red-400 border-red-500/20'
                              }`}>
                                {submission.status}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(submission.created).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default CompanyProfile;