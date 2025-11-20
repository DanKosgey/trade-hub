import React, { useEffect, useState } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, Shield, TrendingUp, Play, Check, X, Star, Lock, AlertTriangle, CheckCircle } from 'lucide-react';
import { socialMediaService } from '../services/socialMediaService';
import { SubscriptionPlan } from '../types';

interface LandingPageProps {
  onSelectTier: (tier: 'free' | 'foundation' | 'professional' | 'elite') => void;
}

const AnimatedCandles: React.FC<{ direction: 'bull' | 'bear' }> = ({ direction }) => {
  const candles = direction === 'bull'
    ? [30, 25, 40, 35, 55, 48, 70, 85, 110]
    : [110, 100, 90, 80, 65, 50, 40, 30, 15];

  return (
    <div className="flex items-end justify-center h-32 sm:h-48 gap-1 sm:gap-2">
      {candles.map((height, i) => (
        <motion.div
          key={i}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: `${height}%`, opacity: 1 }}
          transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
          className={`relative w-2 sm:w-8 rounded-sm shadow-2xl ${direction === 'bull'
            ? 'bg-green-500 shadow-green-500/50'
            : 'bg-red-500 shadow-red-500/50'
            }`}
        >
          {/* Wick */}
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-px sm:w-0.5 ${direction === 'bull' ? 'bg-green-400' : 'bg-red-400'
            }`} style={{ height: '120%' }} />
          <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-px sm:w-0.5 ${direction === 'bull' ? 'bg-green-400' : 'bg-red-400'
            }`} style={{ height: '120%' }} />
        </motion.div>
      ))}
    </div>
  );
};

const LandingPage: React.FC<LandingPageProps> = ({ onSelectTier }) => {
  const [showBear, setShowBear] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const controls = useAnimation();

  // Fetch subscription plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plans = await socialMediaService.getSubscriptionPlans();
        setSubscriptionPlans(plans);
      } catch (error) {
        console.error('Error fetching subscription plans:', error);
        // Fallback to default plans if fetch fails
        setSubscriptionPlans([
          {
            id: 'free',
            name: 'Free Plan',
            description: 'Basic access to the platform',
            price: 0,
            interval: 'one-time',
            features: ['Live Signals from Premium Groups', 'Basic Market Updates', 'Community Access'],
            isActive: true,
            sortOrder: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'foundation',
            name: 'Foundation',
            description: 'Core course modules and community access',
            price: 45,
            interval: 'one-time',
            features: ['Modules 1-4 (Core CRT)', 'Private Community', 'Monthly Group Q&A'],
            isActive: true,
            sortOrder: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'professional',
            name: 'Professional',
            description: 'Full course access with AI Trade Guard',
            price: 60,
            interval: 'one-time',
            features: ['Everything in Foundation', 'AI Trade Guard Access', 'Full Course (Modules 1-6)', 'Advanced Journal & Analytics', 'Weekly Live Trading Room'],
            isActive: true,
            sortOrder: 2,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'elite',
            name: 'Elite Mentorship',
            description: 'Premium mentorship with personalized support',
            price: 100,
            interval: 'one-time',
            features: ['Everything in Pro', '2x Monthly 1-on-1 Calls', 'Private Signal Group', 'Lifetime Updates'],
            isActive: true,
            sortOrder: 3,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]);
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, []);

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
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-5 flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 sm:space-x-3"
            >
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-trade-neon animate-pulse" />
              <span className="text-lg sm:text-xl md:text-2xl font-black tracking-tighter">
                Mbauni <span className="text-trade-neon">Protocol</span>
              </span>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectTier('professional')}
              className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-1.5 sm:px-6 sm:py-2 md:py-3 rounded-lg sm:rounded-xl font-bold backdrop-blur transition text-xs sm:text-sm md:text-base"
            >
              Login <ArrowRight className="inline h-3 w-3 sm:h-4 sm:w-4 ml-1" />
            </motion.button>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-trade-neon/5 via-purple-900/10 to-black" />

          <motion.div
            animate={controls}
            className="container mx-auto px-4 sm:px-6 text-center relative z-10"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 sm:gap-3 bg-trade-neon/10 border border-trade-neon/30 px-4 py-2 sm:px-6 sm:py-3 rounded-full mb-6 sm:mb-8"
            >
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-trade-neon animate-pulse" />
              <span className="font-bold text-trade-neon tracking-wider text-xs sm:text-sm md:text-base">FUNDED TRADERS ONLY</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 sm:mb-8 leading-tight tracking-tight"
            >
              STOP <span className="text-red-500 line-through decoration-2 xs:decoration-3 sm:decoration-4 decoration-white">GAMBLING</span><br />
              START <span className="text-trade-neon neon-text-shadow">DOMINATING</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-2xl sm:max-w-3xl md:max-w-4xl mx-auto leading-relaxed"
            >
              Alex's work speaks for itself. Institutional strategies turned <span className="text-trade-neon font-bold">Confusion into Clarity</span>.
              Now you get the blueprint + an <span className="bg-trade-neon/20 px-1 py-0.5 sm:px-2 sm:py-1 rounded text-trade-neon font-bold">AI that blocks losing trades</span>.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="relative h-48 sm:h-64 mb-10 sm:mb-16 bg-black/50 backdrop-blur border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden max-w-2xl sm:max-w-3xl md:max-w-4xl mx-auto shadow-2xl"
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
                    <div className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-green-500 mb-3 sm:mb-4 animate-bounce">BULL MODE</div>
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
                    <div className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-red-500 mb-3 sm:mb-4 animate-bounce">BEAR MODE</div>
                    <AnimatedCandles direction="bear" />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 text-[10px] xs:text-xs sm:text-sm text-gray-500">
                Live Market Animation • Powered by CRT Logic
              </div>
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectTier('elite')}
                className="group relative px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 bg-trade-neon text-black font-black text-base sm:text-lg md:text-xl rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-trade-neon/50 w-full sm:w-auto"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                  Join The Elite Mentorship <ArrowRight className="group-hover:translate-x-1 sm:group-hover:translate-x-2 transition h-4 w-4 sm:h-5 sm:w-5" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition duration-300" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => onSelectTier('professional')}
                className="px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 border-2 border-trade-neon/50 text-trade-neon font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 sm:gap-3 hover:bg-trade-neon/10 transition w-full sm:w-auto"
              >
                <Play className="h-4 w-4 sm:h-6 sm:w-6" /> Watch Free Masterclass
              </motion.button>
            </div>


          </motion.div>
        </header>

        {/* Why Traders Fail Section */}
        <section className="py-12 sm:py-20 bg-trade-dark border-t border-gray-800">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-10 sm:mb-16"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 sm:mb-4">Why 90% of Traders <span className="text-red-500">Fail</span></h2>
              <p className="text-base sm:text-xl text-gray-400">Most gurus teach indicators and hope. I teach <span className="text-white font-bold">Institutional Logic</span>.</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
                  className="bg-gray-900/50 p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-gray-800 hover:border-trade-neon/30 transition"
                >
                  <item.icon className={`h-8 w-8 sm:h-12 sm:w-12 ${item.color} mb-4 sm:mb-6`} />
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">{item.title}</h3>
                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Trade Guard Section */}
        <section className="py-12 sm:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black to-trade-dark/50" />
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-16">
              <div className="lg:w-1/2">
                <div className="inline-block bg-trade-neon text-black font-bold px-3 py-1 sm:px-4 sm:py-1 rounded-full mb-4 sm:mb-6 text-xs sm:text-sm">
                  EXCLUSIVE TECHNOLOGY
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 leading-tight">
                  The Only Program With An <span className="text-trade-neon">AI That Says "NO"</span>
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-6 sm:mb-8">
                  You paste your setup → AI runs my exact 6-point checklist.
                  <br /><br />
                  <span className="text-green-400 font-bold">✅ Green Light:</span> Trade is valid. High probability.<br />
                  <span className="text-red-500 font-bold">❌ Red Light:</span> STOP. You are about to lose money.
                </p>
                <button
                  onClick={() => onSelectTier('professional')}
                  className="bg-white text-black px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:bg-gray-200 transition flex items-center gap-2"
                >
                  Try AI Trade Guard <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              <div className="lg:w-1/2">
                <div className="bg-gray-900 border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl shadow-trade-neon/10 transform rotate-1 sm:rotate-2 hover:rotate-0 transition duration-500">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 border-b border-gray-800 pb-3 sm:pb-4">
                    <div className="h-2 w-2 sm:h-3 sm:w-3 bg-green-500 rounded-full animate-pulse" />
                    <div className="font-bold text-sm sm:text-base">AI Analysis: EURUSD Buy Setup</div>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start gap-2 sm:gap-3 text-green-400">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" /> <span className="text-sm sm:text-base">Liquidity grabbed from PD Low</span>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3 text-green-400">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" /> <span className="text-sm sm:text-base">Unmitigated FVG Identified</span>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3 text-green-400">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" /> <span className="text-sm sm:text-base">Market Structure Shift (MSS) confirmed</span>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 p-3 sm:p-4 rounded-lg mt-3 sm:mt-4">
                      <p className="font-bold text-green-400 mb-1 text-sm sm:text-base">✅ TRADE APPROVED</p>
                      <p className="text-xs sm:text-sm text-gray-300">All confluence factors met. Risk 1% and set TP at 1.0950.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-12 sm:py-24 bg-black">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 sm:mb-4">Choose Your Transformation</h2>
              <p className="text-gray-400 text-sm sm:text-base">One-time payment. Lifetime access. No hidden fees.</p>
            </div>

            {loadingPlans ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-trade-neon"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto">
                {subscriptionPlans.map((plan, index) => {
                  // Determine styling based on plan position
                  const isPopular = plan.name === 'Professional';
                  const isElite = plan.name === 'Elite Mentorship';
                  const isFree = plan.name === 'Free Plan';
                  
                  return (
                    <div 
                      key={plan.id}
                      className={`bg-gray-900 border rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col ${
                        isPopular 
                          ? 'border-2 border-trade-neon relative shadow-2xl shadow-trade-neon/20 md:my-0 my-4 md:scale-100 scale-[1.02]' 
                          : isElite 
                            ? 'border border-gray-800' 
                            : 'border border-gray-800'
                      }`}
                    >
                      {isPopular && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-trade-neon text-black font-bold px-3 py-1 sm:px-4 sm:py-1 rounded-full text-xs sm:text-sm">
                          MOST POPULAR
                        </div>
                      )}
                      
                      <h3 className={`text-lg sm:text-xl font-bold mb-2 ${
                        isElite ? 'text-purple-400' : isFree ? 'text-gray-400' : 'text-white'
                      }`}>
                        {plan.name}
                      </h3>
                      
                      <div className={`text-3xl sm:text-4xl font-black mb-4 sm:mb-6 ${
                        isPopular ? 'text-trade-neon' : isElite ? 'text-purple-400' : 'text-white'
                      }`}>
                        ${plan.price}
                      </div>
                      
                      <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-1">
                        {plan.features.map((feature, idx) => (
                          <li 
                            key={idx} 
                            className={`flex gap-2 sm:gap-3 ${
                              isPopular || (isElite && idx === 0) 
                                ? 'text-white' 
                                : 'text-gray-300'
                            }`}
                          >
                            <Check className={`h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0 ${
                              isElite 
                                ? 'text-purple-500' 
                                : isPopular || (isFree && idx === 0)
                                  ? 'text-trade-neon' 
                                  : 'text-trade-neon'
                            }`} /> 
                            <span className={isPopular || (isElite && idx === 0) ? 'font-bold' : ''}>
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                      
                      <button 
                        onClick={() => onSelectTier(plan.id as any)}
                        className={`w-full py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold transition text-sm sm:text-base ${
                          isPopular 
                            ? 'bg-trade-neon text-black hover:bg-green-400' 
                            : isElite 
                              ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                              : 'border border-gray-600 hover:bg-gray-800 text-white'
                        }`}
                      >
                        {isFree ? 'Join for Free' : isElite ? 'Apply Now' : 'Get Started'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-12 sm:py-20 bg-trade-dark border-t border-gray-800">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-black mb-8 sm:mb-12">Real Results from <span className="text-trade-neon">Real Students</span></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                { name: "James K.", result: "Passed FTMO in 19 days", quote: "I was failing challenges for 2 years. Alex's FVG strategy clicked instantly." },
                { name: "Sarah T.", result: "$27k Payout Last Month", quote: "The AI Assistant saved me from 5 losing trades last week alone. It pays for itself." },
                { name: "Mike R.", result: "Quit 9-5 Job", quote: "This isn't just a course, it's a complete career change system. Forever grateful." }
              ].map((t, i) => (
                <div key={i} className="bg-black p-5 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-800 text-left">
                  <div className="flex text-yellow-500 mb-3 sm:mb-4"><Star className="fill-current h-3 w-3 sm:h-4 sm:w-4" /><Star className="fill-current h-3 w-3 sm:h-4 sm:w-4" /><Star className="fill-current h-3 w-3 sm:h-4 sm:w-4" /><Star className="fill-current h-3 w-3 sm:h-4 sm:w-4" /><Star className="fill-current h-3 w-3 sm:h-4 sm:w-4" /></div>
                  <p className="text-gray-300 mb-4 sm:mb-6 italic text-sm sm:text-base">"{t.quote}"</p>
                  <div>
                    <div className="font-bold text-white text-sm sm:text-base">{t.name}</div>
                    <div className="text-trade-neon text-xs sm:text-sm font-bold mt-1">{t.result}</div>
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
          className="py-12 sm:py-24 bg-gradient-to-t from-trade-neon/10 to-black text-center border-t border-gray-900"
        >
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-4 sm:mb-6">This Is The Last Trading Course You'll Ever Buy</h2>
            <p className="text-base sm:text-xl text-gray-400 mb-6 sm:mb-10">Because after the AI Trade Guard — you won’t need another one.</p>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <button
                onClick={() => onSelectTier('elite')}
                className="px-6 sm:px-10 md:px-16 py-4 sm:py-5 md:py-6 sm:py-7 bg-trade-neon text-black text-lg sm:text-xl md:text-2xl font-black rounded-2xl sm:rounded-3xl shadow-2xl shadow-trade-neon/50 hover:shadow-trade-neon/70 transition w-full sm:w-auto max-w-md sm:max-w-lg mx-auto"
              >
                Secure Your Spot Before Price Increase <Lock className="inline ml-2 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              </button>
            </motion.div>

            <p className="mt-6 sm:mt-8 text-red-400 font-bold text-base sm:text-lg">
              ⏰ Price increases to $100 on January 1st, 2026
            </p>

            <div className="mt-10 sm:mt-16 text-gray-600 text-xs sm:text-sm">
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
  
        /* Custom breakpoints */
        @media (min-width: 475px) {
          .xs\\:text-4xl {
            font-size: 2.25rem;
            line-height: 2.5rem;
          }
          
          .xs\\:decoration-3 {
            text-decoration-thickness: 3px;
          }
        }
      `}</style>
    </>
  );
}

export default LandingPage;
