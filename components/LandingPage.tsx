import React, { useEffect, useState } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, Shield, TrendingUp, Play, Check, X, Star, Lock, AlertTriangle, CheckCircle } from 'lucide-react';

interface LandingPageProps {
  onSelectTier: (tier: 'foundation' | 'professional' | 'elite') => void;
}

const AnimatedCandles: React.FC<{ direction: 'bull' | 'bear' }> = ({ direction }) => {
  const candles = direction === 'bull' 
    ? [30, 25, 40, 35, 55, 48, 70, 85, 110] 
    : [110, 100, 90, 80, 65, 50, 40, 30, 15];

  return (
    <div className="flex items-end justify-center h-48 gap-2">
      {candles.map((height, i) => (
        <motion.div
          key={i}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: `${height}%`, opacity: 1 }}
          transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
          className={`relative w-8 rounded-sm shadow-2xl ${
            direction === 'bull' 
              ? 'bg-green-500 shadow-green-500/50' 
              : 'bg-red-500 shadow-red-500/50'
          }`}
        >
          {/* Wick */}
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-0.5 ${
            direction === 'bull' ? 'bg-green-400' : 'bg-red-400'
          }`} style={{ height: '120%' }} />
          <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 ${
            direction === 'bull' ? 'bg-green-400' : 'bg-red-400'
          }`} style={{ height: '120%' }} />
        </motion.div>
      ))}
    </div>
  );
};

const LandingPage: React.FC<LandingPageProps> = ({ onSelectTier }) => {
  const [showBear, setShowBear] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    const interval = setInterval(() => {
      setShowBear(prev => !prev);
      controls.start({ scale: [1, 1.05, 1], transition: { duration: 0.6 } });
    }, 5000);
    return () => clearInterval(interval);
  }, [controls]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  return (
    <>
      <div className="min-h-screen bg-black text-white overflow-x-hidden relative font-sans">
        {/* Animated Background Particles */}
        <div className="fixed inset-0 pointer-events-none z-0">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-trade-neon rounded-full opacity-30"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: -10 
              }}
              animate={{ 
                y: window.innerHeight + 10,
                x: Math.random() * window.innerWidth
              }}
              transition={{
                duration: 15 + Math.random() * 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>

        {/* Navbar */}
        <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
          <div className="container mx-auto px-6 py-5 flex justify-between items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <TrendingUp className="h-8 w-8 text-trade-neon animate-pulse" />
              <span className="text-xl md:text-2xl font-black tracking-tighter">
                Mbauni <span className="text-trade-neon">Protocol</span>
              </span>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectTier('professional')}
              className="bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-2 md:py-3 rounded-xl font-bold backdrop-blur transition text-sm md:text-base"
            >
              Login <ArrowRight className="inline h-4 w-4 ml-1" />
            </motion.button>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-trade-neon/5 via-purple-900/10 to-black" />
          
          <motion.div 
            animate={controls}
            className="container mx-auto px-6 text-center relative z-10"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-3 bg-trade-neon/10 border border-trade-neon/30 px-6 py-3 rounded-full mb-8"
            >
              <Zap className="h-5 w-5 text-trade-neon animate-pulse" />
              <span className="font-bold text-trade-neon tracking-wider text-sm md:text-base">FUNDED TRADERS ONLY</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-8xl font-black mb-8 leading-tight tracking-tight"
            >
              STOP <span className="text-red-500 line-through decoration-4 decoration-white">GAMBLING</span><br />
              START <span className="text-trade-neon neon-text-shadow">DOMINATING</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              Alex turned $10 → $1,000 with <span className="text-trade-neon font-bold">Clean Room Trading + FVG</span>.
              Now you get the blueprint + an <span className="bg-trade-neon/20 px-2 py-1 rounded text-trade-neon font-bold">AI that blocks losing trades</span>.
            </motion.p>

            {/* Animated Bull vs Bear Market */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="relative h-64 mb-16 bg-black/50 backdrop-blur border border-white/10 rounded-3xl overflow-hidden max-w-4xl mx-auto shadow-2xl"
            >
              <AnimatePresence mode="wait">
                {!showBear ? (
                  <motion.div
                    key="bull"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-green-900/20 to-transparent"
                  >
                    <div className="text-5xl md:text-6xl font-black text-green-500 mb-4 animate-bounce">BULL MODE</div>
                    <AnimatedCandles direction="bull" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="bear"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-red-900/20 to-transparent"
                  >
                    <div className="text-5xl md:text-6xl font-black text-red-500 mb-4 animate-bounce">BEAR MODE</div>
                    <AnimatedCandles direction="bear" />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs md:text-sm text-gray-500">
                Live Market Animation • Powered by CRT Logic
              </div>
            </motion.div>

            <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectTier('elite')}
                className="group relative px-8 md:px-12 py-6 bg-trade-neon text-black font-black text-xl rounded-2xl overflow-hidden shadow-2xl shadow-trade-neon/50 w-full md:w-auto"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  Join The Elite Mentorship <ArrowRight className="group-hover:translate-x-2 transition" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition duration-300" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => onSelectTier('professional')}
                className="px-8 md:px-10 py-6 border-2 border-trade-neon/50 text-trade-neon font-bold text-lg rounded-2xl flex items-center justify-center gap-3 hover:bg-trade-neon/10 transition w-full md:w-auto"
              >
                <Play className="h-6 w-6" /> Watch Free Masterclass
              </motion.button>
            </div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-8 text-green-400 font-bold flex items-center justify-center gap-2"
            >
              <span className="h-3 w-3 bg-green-400 rounded-full animate-ping" />
              Over 1,247 students funded in 2025
            </motion.p>
          </motion.div>
        </header>

        {/* Why Traders Fail Section */}
        <section className="py-20 bg-trade-dark border-t border-gray-800">
          <div className="container mx-auto px-6">
             <motion.div 
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true }}
               variants={fadeInUp}
               className="text-center mb-16"
             >
               <h2 className="text-4xl font-black mb-4">Why 90% of Traders <span className="text-red-500">Fail</span></h2>
               <p className="text-xl text-gray-400">Most gurus teach indicators and hope. I teach <span className="text-white font-bold">Institutional Logic</span>.</p>
             </motion.div>

             <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: AlertTriangle, title: "Retail Logic", desc: "Trading support & resistance lines that banks use to trap liquidity.", color: "text-red-500" },
                  { icon: Shield, title: "Institutional Logic", desc: "We trade WITH the banks, targeting liquidity sweeps & fair value gaps.", color: "text-trade-neon" },
                  { icon: TrendingUp, title: "Precision R:R", desc: "Minimum 1:3 Risk-to-Reward ratio enforced by our AI assistant.", color: "text-blue-400" }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.2 }}
                    className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800 hover:border-trade-neon/30 transition"
                  >
                    <item.icon className={`h-12 w-12 ${item.color} mb-6`} />
                    <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
             </div>
          </div>
        </section>

        {/* AI Trade Guard Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black to-trade-dark/50" />
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2">
                <div className="inline-block bg-trade-neon text-black font-bold px-4 py-1 rounded-full mb-6 text-sm">
                  EXCLUSIVE TECHNOLOGY
                </div>
                <h2 className="text-5xl font-black mb-6 leading-tight">
                  The Only Program With An <span className="text-trade-neon">AI That Says "NO"</span>
                </h2>
                <p className="text-xl text-gray-400 mb-8">
                  You paste your setup → AI runs my exact 6-point checklist.
                  <br/><br/>
                  <span className="text-green-400 font-bold">✅ Green Light:</span> Trade is valid. High probability.<br/>
                  <span className="text-red-500 font-bold">❌ Red Light:</span> STOP. You are about to lose money.
                </p>
                <button 
                  onClick={() => onSelectTier('professional')}
                  className="bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition flex items-center gap-2"
                >
                  Try AI Trade Guard <ArrowRight className="h-5 w-5" />
                </button>
              </div>

              <div className="lg:w-1/2">
                 <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-trade-neon/10 transform rotate-2 hover:rotate-0 transition duration-500">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                      <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                      <div className="font-bold">AI Analysis: EURUSD Buy Setup</div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-green-400">
                        <CheckCircle className="h-5 w-5" /> <span>Liquidity grabbed from PD Low</span>
                      </div>
                      <div className="flex items-center gap-3 text-green-400">
                        <CheckCircle className="h-5 w-5" /> <span>Unmitigated FVG Identified</span>
                      </div>
                      <div className="flex items-center gap-3 text-green-400">
                        <CheckCircle className="h-5 w-5" /> <span>Market Structure Shift (MSS) confirmed</span>
                      </div>
                      <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg mt-4">
                        <p className="font-bold text-green-400 mb-1">✅ TRADE APPROVED</p>
                        <p className="text-sm text-gray-300">All confluence factors met. Risk 1% and set TP at 1.0950.</p>
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 bg-black">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black mb-4">Choose Your Transformation</h2>
              <p className="text-gray-400">One-time payment. Lifetime access. No hidden fees.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Starter */}
              <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 flex flex-col">
                 <h3 className="text-xl font-bold text-gray-400 mb-2">Foundation</h3>
                 <div className="text-4xl font-black mb-6">$297</div>
                 <ul className="space-y-4 mb-8 flex-1">
                   <li className="flex gap-3 text-gray-300"><Check className="text-trade-neon h-5 w-5" /> Modules 1-4 (Core CRT)</li>
                   <li className="flex gap-3 text-gray-300"><Check className="text-trade-neon h-5 w-5" /> Private Community</li>
                   <li className="flex gap-3 text-gray-300"><Check className="text-trade-neon h-5 w-5" /> Monthly Group Q&A</li>
                 </ul>
                 <button onClick={() => onSelectTier('foundation')} className="w-full py-4 border border-gray-600 rounded-xl font-bold hover:bg-gray-800 transition">
                   Select Plan
                 </button>
              </div>

              {/* Professional */}
              <div className="bg-gray-900 border-2 border-trade-neon rounded-3xl p-8 flex flex-col relative transform md:-translate-y-4 shadow-2xl shadow-trade-neon/20">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-trade-neon text-black font-bold px-4 py-1 rounded-full text-sm">
                   MOST POPULAR
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2">Professional</h3>
                 <div className="text-4xl font-black mb-6 text-trade-neon">$697</div>
                 <ul className="space-y-4 mb-8 flex-1">
                   <li className="flex gap-3 text-white"><Check className="text-trade-neon h-5 w-5" /> <strong>Everything in Foundation</strong></li>
                   <li className="flex gap-3 text-white"><Check className="text-trade-neon h-5 w-5" /> <strong>AI Trade Guard Access</strong></li>
                   <li className="flex gap-3 text-white"><Check className="text-trade-neon h-5 w-5" /> Full Course (Modules 1-6)</li>
                   <li className="flex gap-3 text-white"><Check className="text-trade-neon h-5 w-5" /> Advanced Journal & Analytics</li>
                   <li className="flex gap-3 text-white"><Check className="text-trade-neon h-5 w-5" /> Weekly Live Trading Room</li>
                 </ul>
                 <button onClick={() => onSelectTier('professional')} className="w-full py-4 bg-trade-neon text-black rounded-xl font-black hover:bg-green-400 transition">
                   Get Started
                 </button>
              </div>

              {/* Elite */}
              <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 flex flex-col">
                 <h3 className="text-xl font-bold text-purple-400 mb-2">Elite Mentorship</h3>
                 <div className="text-4xl font-black mb-6">$1,997</div>
                 <ul className="space-y-4 mb-8 flex-1">
                   <li className="flex gap-3 text-gray-300"><Check className="text-purple-500 h-5 w-5" /> <strong>Everything in Pro</strong></li>
                   <li className="flex gap-3 text-gray-300"><Check className="text-purple-500 h-5 w-5" /> 2x Monthly 1-on-1 Calls</li>
                   <li className="flex gap-3 text-gray-300"><Check className="text-purple-500 h-5 w-5" /> Private Signal Group</li>
                   <li className="flex gap-3 text-gray-300"><Check className="text-purple-500 h-5 w-5" /> Lifetime Updates</li>
                 </ul>
                 <button onClick={() => onSelectTier('elite')} className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition">
                   Apply Now
                 </button>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-trade-dark border-t border-gray-800">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-black mb-12">Real Results from <span className="text-trade-neon">Real Students</span></h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: "James K.", result: "Passed FTMO in 19 days", quote: "I was failing challenges for 2 years. Alex's FVG strategy clicked instantly." },
                { name: "Sarah T.", result: "$27k Payout Last Month", quote: "The AI Assistant saved me from 5 losing trades last week alone. It pays for itself." },
                { name: "Mike R.", result: "Quit 9-5 Job", quote: "This isn't just a course, it's a complete career change system. Forever grateful." }
              ].map((t, i) => (
                <div key={i} className="bg-black p-6 rounded-xl border border-gray-800 text-left">
                   <div className="flex text-yellow-500 mb-4"><Star className="fill-current h-4 w-4" /><Star className="fill-current h-4 w-4" /><Star className="fill-current h-4 w-4" /><Star className="fill-current h-4 w-4" /><Star className="fill-current h-4 w-4" /></div>
                   <p className="text-gray-300 mb-6 italic">"{t.quote}"</p>
                   <div>
                     <div className="font-bold text-white">{t.name}</div>
                     <div className="text-trade-neon text-sm font-bold">{t.result}</div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Quick CTA Footer */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="py-24 bg-gradient-to-t from-trade-neon/10 to-black text-center border-t border-gray-900"
        >
          <div className="container mx-auto px-6">
            <h2 className="text-4xl md:text-6xl font-black mb-6">This Is The Last Trading Course You'll Ever Buy</h2>
            <p className="text-xl text-gray-400 mb-10">Because after the AI Trade Guard — you won’t need another one.</p>
            
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <button 
                onClick={() => onSelectTier('elite')}
                className="px-10 md:px-16 py-6 md:py-8 bg-trade-neon text-black text-xl md:text-2xl font-black rounded-3xl shadow-2xl shadow-trade-neon/50 hover:shadow-trade-neon/70 transition"
              >
                Secure Your Spot Before Price Increase <Lock className="inline ml-3" />
              </button>
            </motion.div>

            <p className="mt-8 text-red-400 font-bold text-lg">
              ⏰ Price increases to $2,997 on January 1st, 2026
            </p>
            
            <div className="mt-16 text-gray-600 text-sm">
              &copy; 2025 Mbauni Protocol. All rights reserved. Trading involves risk.
            </div>
          </div>
        </motion.section>
      </div>

      <style>{`
        :root {
          --trade-neon: #00ff94;
        }
        .text-trade-neon { color: var(--trade-neon); }
        .bg-trade-neon { background-color: var(--trade-neon); }
        .neon-text-shadow { text-shadow: 0 0 10px rgba(0, 255, 148, 0.5); }
      `}</style>
    </>
  );
}

export default LandingPage;