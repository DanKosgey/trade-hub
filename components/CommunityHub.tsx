import React from 'react';
import { Youtube, Twitter, Instagram, MessageCircle, Shield, Zap, Users, ArrowRight } from 'lucide-react';

const CommunityHub: React.FC = () => {
  return (
    <div className="text-white pb-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-gray-900 to-black border border-gray-800 p-8 md:p-12 shadow-2xl">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-trade-neon/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-purple-600/10 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-trade-neon/10 border border-trade-neon/20 text-trade-neon text-xs font-bold mb-4">
            <Users className="h-3 w-3" /> GLOBAL COMMUNITY
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
            Welcome to the <span className="text-white">Inner Circle</span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed mb-8">
            The Mbauni Protocol isn't just a course—it's a movement. You are now part of an elite network of traders committed to institutional logic, data-driven decisions, and disciplined execution.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl font-bold flex items-center gap-2 transition shadow-lg shadow-[#5865F2]/20">
              <MessageCircle className="h-5 w-5" /> Join Discord Server
            </button>
            <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold flex items-center gap-2 transition border border-gray-700">
              Explore Events
            </button>
          </div>
        </div>
      </div>

      {/* About Protocol Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-trade-dark p-8 rounded-2xl border border-gray-700 flex flex-col">
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6">
            <Shield className="h-6 w-6 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-gray-400 leading-relaxed mb-6 flex-1">
            To strip away retail trading myths and empower individuals with the same tools, data, and logic used by institutional algorithms. We believe that with the right education (CRT + FVG) and the right guardrails (AI Risk Management), anyone can become profitable.
          </p>
          <div className="flex items-center gap-8 border-t border-gray-700/50 pt-6">
            <div>
              <div className="text-3xl font-black text-white">12k+</div>
              <div className="text-xs text-gray-500 uppercase font-bold">Active Students</div>
            </div>
            <div>
              <div className="text-3xl font-black text-trade-neon">$50M+</div>
              <div className="text-xs text-gray-500 uppercase font-bold">Funded Capital</div>
            </div>
          </div>
        </div>

        <div className="bg-trade-dark p-8 rounded-2xl border border-gray-700 flex flex-col">
          <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-6">
            <Zap className="h-6 w-6 text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4">The Core Philosophy</h2>
          <ul className="space-y-4 flex-1">
            {[
              "Trade with the banks, not against them.",
              "Risk management is more important than entry models.",
              "Data over emotions. Use the AI to validate your bias.",
              "Consistent 1% growth beats lucky 50% flips."
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0 border border-gray-700 mt-0.5">
                  {i + 1}
                </div>
                <span className="text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Social Platforms */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Connect Across Platforms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Discord */}
          <a href="#" className="group p-6 bg-[#5865F2]/5 border border-[#5865F2]/20 hover:bg-[#5865F2]/10 rounded-2xl transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#5865F2] rounded-xl text-white group-hover:scale-110 transition-transform">
                <MessageCircle className="h-6 w-6" />
              </div>
              <ArrowRight className="h-5 w-5 text-[#5865F2] opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Discord</h3>
            <p className="text-sm text-gray-400 mb-4">Private signals, live trading voice chat, and community analysis.</p>
            <div className="text-xs font-bold text-[#5865F2] uppercase tracking-wider">Join Server</div>
          </a>

          {/* YouTube */}
          <a href="#" className="group p-6 bg-[#FF0000]/5 border border-[#FF0000]/20 hover:bg-[#FF0000]/10 rounded-2xl transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#FF0000] rounded-xl text-white group-hover:scale-110 transition-transform">
                <Youtube className="h-6 w-6" />
              </div>
              <ArrowRight className="h-5 w-5 text-[#FF0000] opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">YouTube</h3>
            <p className="text-sm text-gray-400 mb-4">Free educational content, weekly market recaps, and interviews.</p>
            <div className="text-xs font-bold text-[#FF0000] uppercase tracking-wider">Subscribe</div>
          </a>

          {/* Twitter / X */}
          <a href="#" className="group p-6 bg-gray-800/30 border border-gray-600 hover:bg-gray-800/60 rounded-2xl transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-black border border-gray-700 rounded-xl text-white group-hover:scale-110 transition-transform">
                <Twitter className="h-6 w-6" />
              </div>
              <ArrowRight className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Twitter / X</h3>
            <p className="text-sm text-gray-400 mb-4">Real-time market commentary, news updates, and quick tips.</p>
            <div className="text-xs font-bold text-white uppercase tracking-wider">Follow</div>
          </a>

          {/* Instagram */}
          <a href="#" className="group p-6 bg-pink-500/5 border border-pink-500/20 hover:bg-pink-500/10 rounded-2xl transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white group-hover:scale-110 transition-transform">
                <Instagram className="h-6 w-6" />
              </div>
              <ArrowRight className="h-5 w-5 text-pink-500 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Instagram</h3>
            <p className="text-sm text-gray-400 mb-4">Behind the scenes, lifestyle, and student success stories.</p>
            <div className="text-xs font-bold text-pink-400 uppercase tracking-wider">Follow</div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default CommunityHub;