import React, { useState, useEffect } from 'react';
import { Youtube, Twitter, Instagram, MessageCircle, Shield, Zap, Users, ArrowRight, Lock, Send, Phone } from 'lucide-react';
import { socialMediaService } from '../services/socialMediaService';
import { CommunityLink } from '../types';

interface CommunityHubProps {
  subscriptionTier?: 'free' | 'foundation' | 'professional' | 'elite' | 'elite-pending' | 'foundation-pending' | 'professional-pending' | null;
  userId?: string;
  onJoinCommunity?: (platform: string) => void;
}

const CommunityHub: React.FC<CommunityHubProps> = ({ subscriptionTier, userId, onJoinCommunity }) => {
  // Only foundation, professional, and elite tiers have premium access
  // Pending users do not have premium access
  const hasPremiumAccess = (subscriptionTier === 'foundation' || 
                          subscriptionTier === 'professional' || 
                          subscriptionTier === 'elite') &&
                          subscriptionTier !== null && 
                          !subscriptionTier.includes('-pending');
  
  const isPendingUser = subscriptionTier && subscriptionTier.includes('-pending');
  
  const [communityLinks, setCommunityLinks] = useState<CommunityLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunityLinks = async () => {
      try {
        const links = await socialMediaService.getCommunityLinks();
        setCommunityLinks(links);
      } catch (error) {
        console.error('Error fetching community links:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityLinks();
  }, []);

  const handleJoinCommunity = async (platformKey: string) => {
    if (userId) {
      await socialMediaService.updateLastCommunityPlatform(userId, platformKey);
    }
    if (onJoinCommunity) {
      onJoinCommunity(platformKey);
    }
  };

  // Get premium community links
  const premiumLinks = communityLinks.filter(link => 
    link.platformKey === 'telegram' || link.platformKey === 'whatsapp'
  );

  // Get social platform links
  const socialLinks = communityLinks.filter(link => 
    link.platformKey !== 'telegram' && link.platformKey !== 'whatsapp'
  );

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
            <button 
              className="px-6 py-3 text-white rounded-xl font-bold flex items-center gap-2 transition shadow-lg"
              style={{ backgroundColor: '#229ED9', boxShadow: '0 10px 15px -3px rgba(34, 158, 217, 0.2)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e8bc3'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#229ED9'}
            >
              <Send className="h-5 w-5" /> Join Telegram Community
            </button>
            <button 
              className="px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition border"
              style={{ backgroundColor: 'transparent', borderColor: '#374151', color: 'white' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Explore Events
            </button>
          </div>
        </div>
      </div>

      {/* Application Status Notice for Pending Users */}
      {isPendingUser && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-2xl text-yellow-200">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-5 w-5" />
            <h3 className="font-bold text-lg">Application Under Review</h3>
          </div>
          <p className="text-sm">
            Your application for the {subscriptionTier?.replace('-pending', '').charAt(0).toUpperCase() + subscriptionTier?.replace('-pending', '').slice(1) || 'premium'} tier is currently being processed by our team. 
            You'll have full access to all premium features once approved. As a pending applicant, you can participate in our general community discussions.
          </p>
        </div>
      )}

      {/* Premium Groups Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold">Premium Access Groups</h2>
          {!hasPremiumAccess && (
            <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs font-bold rounded border border-gray-700 flex items-center gap-1">
              <Lock className="h-3 w-3" /> LOCKED
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-trade-neon"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {premiumLinks.map((link) => (
              <div 
                key={link.id}
                className={`relative group p-8 rounded-2xl border transition-all duration-300 ${hasPremiumAccess
                    ? `bg-[${link.iconColor}]/5 border-[${link.iconColor}]/20 hover:bg-[${link.iconColor}]/10 cursor-pointer`
                    : 'bg-gray-900/50 border-gray-800 opacity-75'
                  }`}
                onClick={() => hasPremiumAccess && handleJoinCommunity(link.platformKey)}
              >
                {!hasPremiumAccess && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center rounded-2xl text-center p-6">
                    <Lock className="h-8 w-8 text-gray-500 mb-2" />
                    <p className="text-white font-bold">
                      {isPendingUser ? 'Pending Approval' : 'Professional Tier Required'}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {isPendingUser 
                        ? 'Access will be unlocked upon approval.' 
                        : 'Upgrade to access this premium group.'}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 rounded-xl text-white shadow-lg" style={{ backgroundColor: link.iconColor }}>
                    {link.platformKey === 'telegram' && <Send className="h-8 w-8" />}
                    {link.platformKey === 'whatsapp' && <Phone className="h-8 w-8" />}
                  </div>
                  {hasPremiumAccess && (
                    <ArrowRight className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" style={{ color: link.iconColor }} />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {link.platformKey === 'telegram' ? 'Telegram Signals' : 'WhatsApp Inner Circle'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {link.description}
                </p>
                <div className={`inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider ${hasPremiumAccess ? '' : 'text-gray-600'}`} style={{ color: hasPremiumAccess ? link.iconColor : '' }}>
                  {hasPremiumAccess ? 'Join Group' : (isPendingUser ? 'Pending Approval' : 'Locked')}
                </div>
              </div>
            ))}
          </div>
        )}
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
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-trade-neon"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {socialLinks.map((link) => (
              <a 
                key={link.id}
                href={link.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-6 rounded-2xl transition-all duration-300"
                style={{
                  backgroundColor: `${link.iconColor}0D`,
                  borderColor: `${link.iconColor}33`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${link.iconColor}1A`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = `${link.iconColor}0D`;
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div 
                    className="p-3 rounded-xl text-white group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: link.iconColor }}
                  >
                    {link.platformKey === 'youtube' && <Youtube className="h-6 w-6" />}
                    {link.platformKey === 'twitter' && <Twitter className="h-6 w-6" />}
                    {link.platformKey === 'instagram' && <Instagram className="h-6 w-6" />}
                    {link.platformKey === 'tiktok' && <MessageCircle className="h-6 w-6" />}
                  </div>
                  <ArrowRight 
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" 
                    style={{ color: link.iconColor }} 
                  />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  {link.platformName}
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  {link.description}
                </p>
                <div 
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: link.iconColor }}
                >
                  Join Community
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityHub;