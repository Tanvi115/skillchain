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
import { Coins, Award, TrendingUp, XCircle, CheckCircle, Calendar } from 'lucide-react';

const FreelancerProfile = () => {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [badges, setBadges] = useState([]);
  const [transactions, setTransactions] = useState([]);
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

      // Fetch badges
      const badgeRecords = await pb.collection('badges').getFullList({
        filter: `user_id = "${userId}"`,
        expand: 'earned_from_task_id',
        sort: '-earned_at',
        $autoCancel: false
      });
      setBadges(badgeRecords);

      // Fetch transactions (only if own profile)
      if (isOwnProfile) {
        const transactionRecords = await pb.collection('transactions').getFullList({
          filter: `to_user_id = "${userId}"`,
          expand: 'from_user_id,task_id',
          sort: '-created',
          $autoCancel: false
        });
        setTransactions(transactionRecords);
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

  const getTokensByCategory = () => {
    const categories = {};
    transactions.forEach(tx => {
      if (tx.category) {
        categories[tx.category] = (categories[tx.category] || 0) + tx.amount;
      }
    });
    return categories;
  };

  const getCategoryColor = (category) => {
    const colors = {
      Dev: 'from-blue-500 to-cyan-400',
      Design: 'from-purple-500 to-pink-400',
      Marketing: 'from-green-500 to-emerald-400',
      Writing: 'from-yellow-500 to-orange-400',
      Other: 'from-gray-500 to-slate-400'
    };
    return colors[category] || colors.Other;
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
          <div className="text-white text-xl">User not found</div>
        </div>
      </>
    );
  }

  const tokenBalance = (user.totalTokensEarned || 0) - (user.totalTokensSpent || 0);
  const tokensByCategory = getTokensByCategory();

  return (
    <>
      <Helmet>
        <title>{`${user.username} - SkillChain Profile`}</title>
        <meta name="description" content={`View ${user.username}'s profile, badges, and reputation on SkillChain`} />
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
                  alt={user.username} 
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-400 text-white text-3xl">
                  {user.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">{user.username}</h1>
                {user.bio && <p className="text-gray-400 mb-4">{user.bio}</p>}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900 rounded-lg p-4">
                    <div className="flex items-center text-yellow-400 mb-1">
                      <Coins className="w-4 h-4 mr-2" />
                      <span className="text-sm">Balance</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{tokenBalance}</p>
                  </div>

                  <div className="bg-slate-900 rounded-lg p-4">
                    <div className="flex items-center text-green-400 mb-1">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      <span className="text-sm">Skill Score</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{user.skillScore || 0}</p>
                  </div>

                  <div className="bg-slate-900 rounded-lg p-4">
                    <div className="flex items-center text-purple-400 mb-1">
                      <Award className="w-4 h-4 mr-2" />
                      <span className="text-sm">Badges</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{badges.length}</p>
                  </div>

                  <div className="bg-slate-900 rounded-lg p-4">
                    <div className="flex items-center text-red-400 mb-1">
                      <XCircle className="w-4 h-4 mr-2" />
                      <span className="text-sm">Rejections</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{user.rejectionCount || 0}</p>
                  </div>
                </div>
              </div>

              {isOwnProfile && (
                <Button
                  onClick={() => toast({ title: '🚧 This feature isn\'t implemented yet—but don\'t worry! You can request it in your next prompt! 🚀' })}
                  variant="outline"
                  className="border-blue-400 text-blue-400 hover:bg-blue-400/10"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          <Tabs defaultValue="badges" className="space-y-6">
            <TabsList className="bg-slate-800 border border-slate-700">
              <TabsTrigger value="badges" className="data-[state=active]:bg-slate-700">
                Badges ({badges.length})
              </TabsTrigger>
              {isOwnProfile && (
                <>
                  <TabsTrigger value="tokens" className="data-[state=active]:bg-slate-700">
                    Token Breakdown
                  </TabsTrigger>
                  <TabsTrigger value="history" className="data-[state=active]:bg-slate-700">
                    Task History
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            {/* Badges Tab */}
            <TabsContent value="badges">
              {badges.length === 0 ? (
                <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
                  <Award className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No badges earned yet</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {badges.map(badge => (
                    <div key={badge.id} className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center hover:border-purple-500/50 transition-all">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center">
                        <Award className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">{badge.badge_title}</h3>
                      <p className="text-sm text-gray-400 mb-2">{badge.company_name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(badge.earned_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Token Breakdown Tab */}
            {isOwnProfile && (
              <TabsContent value="tokens">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(tokensByCategory).map(([category, amount]) => (
                    <div key={category} className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getCategoryColor(category)} flex items-center justify-center mb-4`}>
                        <Coins className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">{category} Tokens</h3>
                      <p className="text-3xl font-bold text-transparent bg-gradient-to-r bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}>
                        {amount}
                      </p>
                    </div>
                  ))}
                  {Object.keys(tokensByCategory).length === 0 && (
                    <div className="col-span-full text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
                      <Coins className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg">No tokens earned yet</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            )}

            {/* Task History Tab */}
            {isOwnProfile && (
              <TabsContent value="history">
                {transactions.length === 0 ? (
                  <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
                    <CheckCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No completed tasks yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map(tx => (
                      <div key={tx.id} className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-2">
                              {tx.expand?.task_id?.title || tx.description}
                            </h3>
                            <p className="text-sm text-gray-400 mb-2">
                              From: {tx.expand?.from_user_id?.company_name || tx.expand?.from_user_id?.username}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(tx.created).toLocaleDateString()}
                              </span>
                              {tx.category && (
                                <span className="px-2 py-1 rounded-full bg-slate-700 text-xs">
                                  {tx.category}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-green-400 font-bold text-xl">
                              <Coins className="w-5 h-5 mr-1" />
                              +{tx.amount}
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

export default FreelancerProfile;