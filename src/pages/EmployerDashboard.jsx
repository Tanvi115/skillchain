import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, ExternalLink, FileText, Clock, Award } from 'lucide-react';

const EmployerDashboard = () => {
  const { currentUser, refreshUser } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      // Get all tasks by this employer
      const myTasks = await pb.collection('tasks').getFullList({
        filter: `employer_id = "${currentUser.id}"`,
        $autoCancel: false
      });

      if (myTasks.length === 0) {
        setSubmissions([]);
        setLoading(false);
        return;
      }

      // Get all submissions for these tasks
      const taskIds = myTasks.map(t => t.id);
      const filter = taskIds.map(id => `task_id = "${id}"`).join(' || ');
      
      const records = await pb.collection('submissions').getFullList({
        filter,
        expand: 'task_id,freelancer_id',
        sort: '-created',
        $autoCancel: false
      });

      setSubmissions(records);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: 'Error loading submissions',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (submission) => {
    setProcessingId(submission.id);

    try {
      const task = submission.expand?.task_id;
      const freelancer = submission.expand?.freelancer_id;

      if (!task || !freelancer) {
        throw new Error('Missing task or freelancer data');
      }

      // 1. Update employer's totalTokensSpent
      await pb.collection('users').update(currentUser.id, {
        totalTokensSpent: (currentUser.totalTokensSpent || 0) + task.token_reward
      }, { $autoCancel: false });

      // 2. Update freelancer's totalTokensEarned and skillScore
      await pb.collection('users').update(freelancer.id, {
        totalTokensEarned: (freelancer.totalTokensEarned || 0) + task.token_reward,
        skillScore: (freelancer.skillScore || 0) + Math.floor(task.token_reward / 10)
      }, { $autoCancel: false });

      // 3. Create badge record
      await pb.collection('badges').create({
        user_id: freelancer.id,
        company_name: currentUser.company_name || currentUser.username,
        badge_title: `${task.category} Expert`,
        earned_from_task_id: task.id,
        earned_at: new Date().toISOString()
      }, { $autoCancel: false });

      // 4. Update task status
      await pb.collection('tasks').update(task.id, {
        status: 'completed'
      }, { $autoCancel: false });

      // 5. Create transaction record
      await pb.collection('transactions').create({
        from_user_id: currentUser.id,
        to_user_id: freelancer.id,
        task_id: task.id,
        amount: task.token_reward,
        transaction_type: 'task_completion',
        category: task.category,
        timestamp: new Date().toISOString(),
        description: `Payment for: ${task.title}`
      }, { $autoCancel: false });

      // 6. Update submission status
      await pb.collection('submissions').update(submission.id, {
        status: 'accepted',
        reviewed_at: new Date().toISOString()
      }, { $autoCancel: false });

      toast({
        title: 'Submission accepted!',
        description: `${task.token_reward} tokens awarded to ${freelancer.username}`
      });

      // Refresh data
      await refreshUser();
      await fetchSubmissions();
    } catch (error) {
      console.error('Error accepting submission:', error);
      toast({
        title: 'Error accepting submission',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClick = (submission) => {
    setSelectedSubmission(submission);
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedSubmission) return;

    setProcessingId(selectedSubmission.id);

    try {
      const freelancer = selectedSubmission.expand?.freelancer_id;

      // Update submission with rejection
      await pb.collection('submissions').update(selectedSubmission.id, {
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        rejection_reason: rejectionReason
      }, { $autoCancel: false });

      // Increment freelancer's rejection count
      if (freelancer) {
        await pb.collection('users').update(freelancer.id, {
          rejectionCount: (freelancer.rejectionCount || 0) + 1
        }, { $autoCancel: false });
      }

      toast({
        title: 'Submission rejected',
        description: 'Freelancer has been notified'
      });

      setRejectModalOpen(false);
      setRejectionReason('');
      setSelectedSubmission(null);
      await fetchSubmissions();
    } catch (error) {
      console.error('Error rejecting submission:', error);
      toast({
        title: 'Error rejecting submission',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      accepted: 'bg-green-500/10 text-green-400 border-green-500/20',
      rejected: 'bg-red-500/10 text-red-400 border-red-500/20'
    };
    return badges[status] || badges.pending;
  };

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const reviewedSubmissions = submissions.filter(s => s.status !== 'pending');

  return (
    <>
      <Helmet>
        <title>Employer Dashboard - SkillChain</title>
        <meta name="description" content="Review and manage submissions from freelancers" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Header />

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Employer Dashboard</h1>
            <p className="text-gray-400">Review submissions and manage your tasks</p>
          </div>

          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList className="bg-slate-800 border border-slate-700">
              <TabsTrigger value="pending" className="data-[state=active]:bg-slate-700">
                Pending ({pendingSubmissions.length})
              </TabsTrigger>
              <TabsTrigger value="reviewed" className="data-[state=active]:bg-slate-700">
                Reviewed ({reviewedSubmissions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="text-white text-xl">Loading submissions...</div>
                </div>
              ) : pendingSubmissions.length === 0 ? (
                <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
                  <Clock className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No pending submissions</p>
                </div>
              ) : (
                pendingSubmissions.map(submission => (
                  <div key={submission.id} className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">
                          {submission.expand?.task_id?.title}
                        </h3>
                        <p className="text-sm text-gray-400 mb-2">
                          Submitted by: <span className="text-blue-400">{submission.expand?.freelancer_id?.username}</span>
                        </p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(submission.status)}`}>
                          {submission.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-yellow-400 font-bold text-lg">
                          <Award className="w-5 h-5 mr-1" />
                          {submission.expand?.task_id?.token_reward} tokens
                        </div>
                      </div>
                    </div>

                    {submission.submission_text && (
                      <div className="mb-4 p-4 bg-slate-900 rounded-lg">
                        <p className="text-sm text-gray-300">{submission.submission_text}</p>
                      </div>
                    )}

                    <div className="flex items-center space-x-4 mb-4">
                      <a
                        href={submission.submission_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Submission
                      </a>
                      {submission.file_upload && (
                        <a
                          href={pb.files.getUrl(submission, submission.file_upload)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Download File
                        </a>
                      )}
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        onClick={() => handleAccept(submission)}
                        disabled={processingId === submission.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {processingId === submission.id ? 'Processing...' : 'Accept & Award Tokens'}
                      </Button>
                      <Button
                        onClick={() => handleRejectClick(submission)}
                        disabled={processingId === submission.id}
                        variant="outline"
                        className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="reviewed" className="space-y-4">
              {reviewedSubmissions.length === 0 ? (
                <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
                  <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No reviewed submissions yet</p>
                </div>
              ) : (
                reviewedSubmissions.map(submission => (
                  <div key={submission.id} className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">
                          {submission.expand?.task_id?.title}
                        </h3>
                        <p className="text-sm text-gray-400 mb-2">
                          By: {submission.expand?.freelancer_id?.username}
                        </p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(submission.status)}`}>
                          {submission.status}
                        </span>
                      </div>
                    </div>

                    {submission.rejection_reason && (
                      <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-sm text-red-400">
                          <strong>Rejection reason:</strong> {submission.rejection_reason}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>Reviewed: {new Date(submission.reviewed_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Rejection Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
            <DialogDescription>
              Please provide feedback to help the freelancer improve
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejection_reason" className="text-gray-900">Reason for rejection</Label>
              <textarea
                id="rejection_reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain what needs to be improved..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRejectSubmit}
              disabled={!rejectionReason.trim() || processingId}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {processingId ? 'Processing...' : 'Reject Submission'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmployerDashboard;