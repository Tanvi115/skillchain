import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Coins, Shield, Users, TrendingUp, Award, Zap } from 'lucide-react';
import Header from '@/components/Header.jsx';
import { Button } from '@/components/ui/button';

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>SkillChain - Decentralized Freelance Reputation Platform</title>
        <meta name="description" content="Build your on-chain reputation through verified work. Earn tokens, collect badges, and unlock opportunities in the decentralized freelance economy." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Header />

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-400/10" />
          <div className="container mx-auto px-4 py-20 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                    Build Your Reputation
                  </span>
                  <br />
                  <span className="text-white">On-Chain</span>
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed">
                  SkillChain is a decentralized reputation platform where freelancers earn verifiable tokens and badges through completed work. Companies post tasks, freelancers deliver, and reputation is built transparently on the blockchain.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/register">
                    <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white text-lg px-8 py-6">
                      Get Started Free
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400/10 text-lg px-8 py-6">
                      Login
                    </Button>
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl blur-3xl opacity-20" />
                <img
                  src="https://images.unsplash.com/photo-1562600484-c6ef0ffe27a2"
                  alt="Freelancer working on laptop with coffee"
                  className="relative rounded-2xl shadow-2xl border border-slate-700"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Dual Role System */}
        <section className="py-20 bg-slate-800/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-4">Two Roles, One Ecosystem</h2>
              <p className="text-xl text-gray-400">Choose your path in the decentralized economy</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 shadow-xl hover:shadow-2xl transition-shadow"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Freelancers</h3>
                </div>
                <ul className="space-y-4 text-gray-300">
                  <li className="flex items-start">
                    <Zap className="w-5 h-5 text-cyan-400 mr-3 mt-1 flex-shrink-0" />
                    <span>Browse open tasks across Dev, Design, Marketing, and Writing</span>
                  </li>
                  <li className="flex items-start">
                    <Coins className="w-5 h-5 text-yellow-400 mr-3 mt-1 flex-shrink-0" />
                    <span>Earn category-specific tokens for completed work</span>
                  </li>
                  <li className="flex items-start">
                    <Award className="w-5 h-5 text-purple-400 mr-3 mt-1 flex-shrink-0" />
                    <span>Collect company badges to build verifiable reputation</span>
                  </li>
                  <li className="flex items-start">
                    <TrendingUp className="w-5 h-5 text-green-400 mr-3 mt-1 flex-shrink-0" />
                    <span>Increase skill score to unlock higher-paying opportunities</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 shadow-xl hover:shadow-2xl transition-shadow"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Companies</h3>
                </div>
                <ul className="space-y-4 text-gray-300">
                  <li className="flex items-start">
                    <Zap className="w-5 h-5 text-cyan-400 mr-3 mt-1 flex-shrink-0" />
                    <span>Post tasks with custom token rewards and requirements</span>
                  </li>
                  <li className="flex items-start">
                    <Users className="w-5 h-5 text-blue-400 mr-3 mt-1 flex-shrink-0" />
                    <span>Review submissions in a GitHub-style interface</span>
                  </li>
                  <li className="flex items-start">
                    <Award className="w-5 h-5 text-purple-400 mr-3 mt-1 flex-shrink-0" />
                    <span>Award badges to top performers to build your brand</span>
                  </li>
                  <li className="flex items-start">
                    <Shield className="w-5 h-5 text-green-400 mr-3 mt-1 flex-shrink-0" />
                    <span>Access verified talent with transparent reputation scores</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-4">How SkillChain Works</h2>
              <p className="text-xl text-gray-400">Simple, transparent, and decentralized</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Companies Post Tasks',
                  description: 'Define requirements, set token rewards, and specify minimum skill scores',
                  icon: Shield,
                  color: 'from-blue-500 to-cyan-400'
                },
                {
                  step: '02',
                  title: 'Freelancers Submit Work',
                  description: 'Browse marketplace, apply to tasks, and submit completed work with proof',
                  icon: Users,
                  color: 'from-purple-500 to-pink-400'
                },
                {
                  step: '03',
                  title: 'Reputation Grows',
                  description: 'Earn tokens, collect badges, and build verifiable on-chain reputation',
                  icon: TrendingUp,
                  color: 'from-green-500 to-emerald-400'
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6`}>
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-5xl font-bold text-slate-700 mb-4">{item.step}</div>
                    <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-gray-400">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-500/10 to-cyan-400/10">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-white">
                Ready to Build Your Reputation?
              </h2>
              <p className="text-xl text-gray-300">
                Join SkillChain today and start earning verifiable tokens for your skills
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Link to="/register">
                  <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white text-lg px-8 py-6">
                    Create Free Account
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400/10 text-lg px-8 py-6">
                    Sign In
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-slate-700">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Coins className="w-6 h-6 text-blue-400" />
              <span className="text-xl font-bold text-white">SkillChain</span>
            </div>
            <p className="text-gray-400">
              Decentralized Reputation Platform © 2026
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomePage;