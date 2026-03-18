import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Coins, Loader2, Users, Shield, ArrowRight, ArrowLeft } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [companyName, setCompanyName] = useState('');

  const handleStep1Submit = (e) => {
    e.preventDefault();
    
    if (password !== passwordConfirm) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are identical',
        variant: 'destructive'
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 8 characters',
        variant: 'destructive'
      });
      return;
    }

    setStep(2);
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === 'freelancer') {
      // Skip company name step for freelancers
      handleFinalSubmit(selectedRole, '');
    } else {
      setStep(3);
    }
  };

  const handleFinalSubmit = async (finalRole = role, finalCompanyName = companyName) => {
    setLoading(true);

    try {
      await register(email, password, username, finalRole, finalCompanyName);
      
      toast({
        title: 'Registration successful!',
        description: 'Your account has been created. Please login.'
      });

      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration failed',
        description: error.message || 'Failed to create account',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Register - SkillChain</title>
        <meta name="description" content="Create your SkillChain account and start building your decentralized reputation" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400">
                <Coins className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                SkillChain
              </span>
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-gray-400">Step {step} of {role === 'company' ? 3 : 2}</p>
          </div>

          <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl p-8">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <form onSubmit={handleStep1Submit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-200">Email</Label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-200">Username</Label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="johndoe"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-200">Password</Label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
                    required
                    minLength={8}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passwordConfirm" className="text-gray-200">Confirm Password</Label>
                  <input
                    id="passwordConfirm"
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
                    required
                    minLength={8}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white py-6 text-lg"
                >
                  Continue
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            )}

            {/* Step 2: Role Selection */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Choose Your Role</h2>
                  <p className="text-gray-400">Select how you want to use SkillChain</p>
                </div>

                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('freelancer')}
                    disabled={loading}
                    className="w-full p-6 bg-slate-900 border-2 border-slate-700 rounded-xl hover:border-blue-500 transition-all group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">Freelancer</h3>
                        <p className="text-sm text-gray-400">Browse tasks, submit work, earn tokens</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect('company')}
                    disabled={loading}
                    className="w-full p-6 bg-slate-900 border-2 border-slate-700 rounded-xl hover:border-purple-500 transition-all group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">Company</h3>
                        <p className="text-sm text-gray-400">Post tasks, review work, award badges</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
                    </div>
                  </button>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="w-full border-slate-700 text-gray-300 hover:bg-slate-700"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back
                </Button>
              </div>
            )}

            {/* Step 3: Company Name (only for companies) */}
            {step === 3 && (
              <form onSubmit={(e) => { e.preventDefault(); handleFinalSubmit(); }} className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Company Details</h2>
                  <p className="text-gray-400">Tell us about your company</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-gray-200">Company Name</Label>
                  <input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Inc."
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white py-6 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  disabled={loading}
                  className="w-full border-slate-700 text-gray-300 hover:bg-slate-700"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;