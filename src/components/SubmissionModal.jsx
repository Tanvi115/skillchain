import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Upload, Link as LinkIcon } from 'lucide-react';

const SubmissionModal = ({ isOpen, onClose, task }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [submissionText, setSubmissionText] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (20MB max)
      if (selectedFile.size > 20 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Maximum file size is 20MB',
          variant: 'destructive'
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!submissionUrl.trim()) {
      toast({
        title: 'URL required',
        description: 'Please provide a submission URL',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('task_id', task.id);
      formData.append('freelancer_id', currentUser.id);
      formData.append('submission_url', submissionUrl);
      formData.append('submission_text', submissionText);
      formData.append('status', 'pending');
      formData.append('submitted_at', new Date().toISOString());
      
      if (file) {
        formData.append('file_upload', file);
      }

      await pb.collection('submissions').create(formData, { $autoCancel: false });

      // Update task submission count
      await pb.collection('tasks').update(task.id, {
        submission_count: (task.submission_count || 0) + 1
      }, { $autoCancel: false });

      toast({
        title: 'Submission successful!',
        description: 'Your work has been submitted for review'
      });

      // Reset form
      setSubmissionText('');
      setSubmissionUrl('');
      setFile(null);
      onClose();
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'Submission failed',
        description: error.message || 'Failed to submit work',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Submit Your Work</DialogTitle>
          <DialogDescription>
            Submit your completed work for: {task?.title}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="submission_url" className="text-gray-900">
              Submission URL <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                id="submission_url"
                type="url"
                value={submissionUrl}
                onChange={(e) => setSubmissionUrl(e.target.value)}
                placeholder="https://github.com/yourwork or https://drive.google.com/..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              />
            </div>
            <p className="text-xs text-gray-500">Link to your GitHub repo, Google Drive, or live demo</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="submission_text" className="text-gray-900">Description (Optional)</Label>
            <textarea
              id="submission_text"
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Describe your approach, technologies used, or any notes for the reviewer..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file_upload" className="text-gray-900">Upload File (Optional)</Label>
            <div className="flex items-center space-x-2">
              <label
                htmlFor="file_upload"
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-4 h-4 mr-2 text-gray-600" />
                <span className="text-sm text-gray-700">
                  {file ? file.name : 'Choose file'}
                </span>
              </label>
              <input
                id="file_upload"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-500">PDF or images (max 20MB)</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500"
            >
              {loading ? 'Submitting...' : 'Submit Work'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionModal;