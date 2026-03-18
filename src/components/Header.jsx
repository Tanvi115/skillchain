import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Coins, LogOut, User, Briefcase, LayoutDashboard } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import pb from '@/lib/pocketbaseClient';

const Header = () => {
  const { currentUser, logout, isAuthenticated, isFreelancer, isCompany, getTokenBalance } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tokenBalance = getTokenBalance();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-700 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            SkillChain
          </span>
        </Link>

        <nav className="flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              {isFreelancer && (
                <>
                  <Link to="/marketplace" className="text-gray-300 hover:text-white transition-colors">
                    Marketplace
                  </Link>
                  <Link to="/my-tasks" className="text-gray-300 hover:text-white transition-colors">
                    My Tasks
                  </Link>
                </>
              )}
              {isCompany && (
                <>
                  <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/posted-tasks" className="text-gray-300 hover:text-white transition-colors">
                    Posted Tasks
                  </Link>
                </>
              )}

              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-semibold text-white">{tokenBalance}</span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={currentUser?.avatar ? pb.files.getUrl(currentUser, currentUser.avatar) : currentUser?.avatar_url} 
                        alt={currentUser?.username || currentUser?.name} 
                      />
                      <AvatarFallback className="bg-blue-500 text-white">
                        {currentUser?.username?.[0]?.toUpperCase() || currentUser?.name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{currentUser?.username || currentUser?.name}</p>
                      <p className="text-xs leading-none text-gray-500">{currentUser?.email}</p>
                      <p className="text-xs leading-none text-blue-400 capitalize">{currentUser?.role}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(`/profile/${currentUser?.id}`)}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  {isFreelancer && (
                    <DropdownMenuItem onClick={() => navigate('/marketplace')}>
                      <Briefcase className="mr-2 h-4 w-4" />
                      <span>Marketplace</span>
                    </DropdownMenuItem>
                  )}
                  {isCompany && (
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-gray-300 hover:text-white">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;