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

const PostTaskForm = ({ onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', category: 'Dev', token_reward: 100, minimum_skill_score: 0, deadline: ''
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 20 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Maximum file size is 20MB', variant: 'destructive' });
      return;
    }
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('token_reward', form.token_reward);
      formData.append('minimum_skill_score', form.minimum_skill_score);
      formData.append('deadline', form.deadline);
      formData.append('employer_id', currentUser.id);
      formData.append('status', 'open');
      formData.append('submission_count', 0);
      if (file) formData.append('file_attachment', file);

      await pb.collection('tasks').create(formData, { $autoCancel: false });
      toast({ title: 'Task posted successfully!' });
      onSuccess();
      onClose();
    } catch (error) {
      toast({ title: 'Error posting task', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="space-y-2">
        <Label className="text-gray-900">Title</Label>
        <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Task title" className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900" required />
      </div>
      <div className="space-y-2">
        <Label className="text-gray-900">Description</Label>
        <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Task description" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900" required />
      </div>
      <div className="space-y-2">
        <Label className="text-gray-900">Attach File (Optional)</Label>
        <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-400 transition-colors">
          <div className="text-center">
            <FileText className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <span className="text-sm text-gray-500">
              {file ? file.name : 'Click to attach a file (PDF, images, max 20MB)'}
            </span>
          </div>
          <input type="file" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx" className="hidden" />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-900">Category</Label>
          <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900">
            <option>Dev</option>
            <option>Design</option>
            <option>Marketing</option>
            <option>Writing</option>
            <option>Other</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label className="text-gray-900">Token Reward</Label>
          <input type="number" value={form.token_reward} onChange={e => setForm({...form, token_reward: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-900">Min Skill Score</Label>
          <input type="number" value={form.minimum_skill_score} onChange={e => setForm({...form, minimum_skill_score: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900" />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-900">Deadline</Label>
          <input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900" />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white">
          {loading ? 'Posting...' : 'Post Task'}
        </Button>
      </DialogFooter>
    </form>
  );
};

const EmployerDashboard = () => {
  const { currentUser, refreshUser } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [postTaskOpen, setPostTaskOpen] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const myTasks = await pb.collection('tasks').getFullList({
        filter: `employer_id = "${currentUser.id}"`,
        $autoCancel: false
      });

      if (myTasks.length === 0) {
        setSubmissions([]);
        setLoading(false);
        return;
      }

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

      if (!task || !freelancer) throw new Error('Missing task or freelancer data');

      await pb.collection('users').update(currentUser.id, {
        totalTokensSpent: (currentUser.totalTokensSpent || 0) + task.token_reward
      }, { $autoCancel: false });

      await pb.collection('users').update(freelancer.id, {
        totalTokensEarned: (freelancer.totalTokensEarned || 0) + task.token_reward,
        skillScore: (freelancer.skillScore || 0) + Math.floor(task.token_reward / 10)
      }, { $autoCancel: false });

      await pb.collection('badges').create({
        user_id: freelancer.id,
        company_name: currentUser.company_name || currentUser.username,
        badge_title: `${task.category} Expert`,
        earned_from_task_id: task.id,
        earned_at: new Date().toISOString()
      }, { $autoCancel: false });

      await pb.collection('tasks').update(task.id, { status: 'completed' }, { $autoCancel: false });

      await pb.collection('transactions').create({
        from_user_id: currentUser.id,
        to_user_id: freelancer.id,
        task_id: task.id,
        amount: task.token_reward,
        category: task.category,
        description: `Payment for: ${task.title}`
      }, { $autoCancel: false });

      await pb.collection('submissions').update(submission.id, {
        status: 'accepted',
        reviewed_at: new Date().toISOString()
      }, { $autoCancel: false });

      toast({ title: 'Submission accepted!', description: `${task.token_reward} tokens awarded to ${freelancer.username}` });
      await refreshUser();
      await fetchSubmissions();
    } catch (error) {
      toast({ title: 'Error accepting submission', description: error.message, variant: 'destructive' });
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
      await pb.collection('submissions').update(selectedSubmission.id, {
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        rejection_reason: rejectionReason
      }, { $autoCancel: false });

      if (freelancer) {
        await pb.collection('users').update(freelancer.id, {
          rejectionCount: (freelancer.rejectionCount || 0) + 1
        }, { $autoCancel: false });
      }

      toast({ title: 'Submission rejected', description: 'Freelancer has been notified' });
      setRejectModalOpen(false);
      setRejectionReason('');
      setSelectedSubmission(null);
      await fetchSubmissions();
    } catch (error) {
      toast({ title: 'Error rejecting submission', description: error.message, variant: 'destructive' });
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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Employer Dashboard</h1>
              <p className="text-gray-400">Review submissions and manage your tasks</p>
            </div>
            <Button
              onClick={() => setPostTaskOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white"
            >
              + Post New Task
            </Button>
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
                        <h3 className="text-xl font-bold text-white mb-2">{submission.expand?.task_id?.title}</h3>
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
                      <a href={submission.submission_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-400 hover:text-blue-300 transition-colors">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Submission
                      </a>
                      {submission.file_upload && (
                        <a href={pb.files.getUrl(submission, submission.file_upload)} target="_blank" rel="noopener noreferrer" className="flex items-center text-purple-400 hover:text-purple-300 transition-colors">
                          <FileText className="w-4 h-4 mr-2" />
                          Download File
                        </a>
                      )}
                    </div>

                    <div className="flex space-x-3">
                      <Button onClick={() => handleAccept(submission)} disabled={processingId === submission.id} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {processingId === submission.id ? 'Processing...' : 'Accept & Award Tokens'}
                      </Button>
                      <Button onClick={() => handleRejectClick(submission)} disabled={processingId === submission.id} variant="outline" className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10">
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
                        <h3 className="text-xl font-bold text-white mb-2">{submission.expand?.task_id?.title}</h3>
                        <p className="text-sm text-gray-400 mb-2">By: {submission.expand?.freelancer_id?.username}</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(submission.status)}`}>
                          {submission.status}
                        </span>
                      </div>
                    </div>
                    {submission.rejection_reason && (
                      <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-sm text-red-400"><strong>Rejection reason:</strong> {submission.rejection_reason}</p>
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

      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
            <DialogDescription>Please provide feedback to help the freelancer improve</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejection_reason" className="text-gray-900">Reason for rejection</Label>
              <textarea id="rejection_reason" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Explain what needs to be improved..." rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" required />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
            <Button onClick={handleRejectSubmit} disabled={!rejectionReason.trim() || processingId} className="bg-red-600 hover:bg-red-700 text-white">
              {processingId ? 'Processing...' : 'Reject Submission'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={postTaskOpen} onOpenChange={setPostTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post a New Task</DialogTitle>
            <DialogDescription>Fill in the details for your new task</DialogDescription>
          </DialogHeader>
          <PostTaskForm onClose={() => setPostTaskOpen(false)} onSuccess={fetchSubmissions} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmployerDashboard;