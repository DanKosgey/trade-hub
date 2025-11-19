import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MentorshipApplication } from '../types';
import { CheckCircle, ArrowLeft, Send, AlertCircle, ShieldCheck, Wallet, TrendingUp, Brain } from 'lucide-react';

interface EliteApplicationFormProps {
  onSubmit: (data: MentorshipApplication) => void;
  onCancel: () => void;
}

const EliteApplicationForm: React.FC<EliteApplicationFormProps> = ({ onSubmit, onCancel }) => {
  const [step, setStep] = useState<'form' | 'confirm'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<MentorshipApplication>({
    fullName: '',
    email: '',
    discordId: '',
    experienceYears: '0-1',
    currentCapital: '',
    biggestStruggle: 'Strategy',
    motivation: '',
    commitmentAgreement: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, commitmentAgreement: e.target.checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setStep('confirm');
  };

  const handleFinalize = () => {
    onSubmit(formData);
  };

  if (step === 'confirm') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-trade-neon/20 rounded-full blur-[100px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-gray-900 border border-trade-neon rounded-3xl p-8 md:p-12 text-center relative z-10 shadow-[0_0_50px_rgba(0,255,148,0.15)]"
        >
          <div className="w-20 h-20 bg-trade-neon/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="h-10 w-10 text-trade-neon" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-black mb-4">Application Received</h2>
          <p className="text-xl text-gray-300 mb-8">
            Your application for the <span className="text-purple-400 font-bold">Elite Mentorship</span> has been securely submitted.
          </p>
          
          <div className="bg-black/50 rounded-xl p-6 text-left mb-8 border border-gray-800">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="text-trade-neon h-5 w-5" /> Next Steps:
            </h3>
            <ul className="space-y-4 text-gray-400">
              <li className="flex gap-3">
                <span className="bg-gray-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <span>Alex and the team will review your trading history and goals within 48 hours.</span>
              </li>
              <li className="flex gap-3">
                <span className="bg-gray-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <span>If approved, you will receive an invitation email with a payment link and Discord access.</span>
              </li>
              <li className="flex gap-3">
                <span className="bg-gray-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <span>In the meantime, we've unlocked the <span className="text-white font-bold">Starter Dashboard</span> for you to begin reviewing the basics.</span>
              </li>
            </ul>
          </div>

          <button 
            onClick={handleFinalize}
            className="w-full bg-white text-black font-black text-lg py-4 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2"
          >
            Access Starter Dashboard <ArrowLeft className="h-5 w-5 rotate-180" />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 md:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onCancel}
          className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Options
        </button>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar Info */}
          <div className="md:col-span-1 space-y-6">
            <div>
              <h1 className="text-3xl font-black mb-2">Elite Application</h1>
              <p className="text-purple-400 font-bold">Limited Spots Available</p>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
              <h3 className="font-bold mb-4 text-sm text-gray-400 uppercase tracking-wider">Requirements</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm text-gray-300">
                  <Wallet className="h-5 w-5 text-trade-neon flex-shrink-0" />
                  Minimum $5k capital recommended (funded or personal)
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-300">
                  <TrendingUp className="h-5 w-5 text-trade-neon flex-shrink-0" />
                  Commitment to execute only A+ setups
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-300">
                  <Brain className="h-5 w-5 text-trade-neon flex-shrink-0" />
                  Willingness to unlearn "retail" bad habits
                </li>
              </ul>
            </div>

            <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
              <div className="flex gap-2 items-start">
                <AlertCircle className="h-5 w-5 text-purple-400 flex-shrink-0" />
                <p className="text-sm text-purple-200">
                  We only accept students we believe we can help scale to 6-figures. This application helps us ensure you're a good fit.
                </p>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="md:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-trade-dark border border-gray-800 rounded-3xl p-8 shadow-2xl"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Full Name</label>
                    <input 
                      type="text" 
                      name="fullName"
                      required
                      className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white focus:border-trade-neon focus:ring-1 focus:ring-trade-neon outline-none transition"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white focus:border-trade-neon focus:ring-1 focus:ring-trade-neon outline-none transition"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Discord Username</label>
                    <input 
                      type="text" 
                      name="discordId"
                      required
                      className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white focus:border-trade-neon focus:ring-1 focus:ring-trade-neon outline-none transition"
                      placeholder="trader#1234"
                      value={formData.discordId}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Current Capital ($)</label>
                    <input 
                      type="text" 
                      name="currentCapital"
                      required
                      className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white focus:border-trade-neon focus:ring-1 focus:ring-trade-neon outline-none transition"
                      placeholder="e.g. 10,000 or 100k Funded"
                      value={formData.currentCapital}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Experience Level</label>
                    <select 
                      name="experienceYears"
                      className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white focus:border-trade-neon outline-none transition"
                      value={formData.experienceYears}
                      onChange={handleChange}
                    >
                      <option value="0-1">New (0-1 Years)</option>
                      <option value="1-3">Intermediate (1-3 Years)</option>
                      <option value="3+">Advanced (3+ Years)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Biggest Struggle</label>
                    <select 
                      name="biggestStruggle"
                      className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white focus:border-trade-neon outline-none transition"
                      value={formData.biggestStruggle}
                      onChange={handleChange}
                    >
                      <option value="Strategy">Strategy & Edge</option>
                      <option value="Psychology">Psychology (FOMO/Revenge)</option>
                      <option value="Risk">Risk Management</option>
                      <option value="Discipline">Discipline & Consistency</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Why do you want to join the Elite Mentorship?</label>
                  <textarea 
                    name="motivation"
                    required
                    rows={4}
                    className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white focus:border-trade-neon outline-none transition resize-none"
                    placeholder="Tell us about your goals and why you're ready to commit..."
                    value={formData.motivation}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex items-start gap-3 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                  <input 
                    type="checkbox" 
                    id="agreement"
                    required
                    className="mt-1 w-4 h-4 accent-trade-neon"
                    checked={formData.commitmentAgreement}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="agreement" className="text-sm text-gray-400 cursor-pointer">
                    I understand that the Elite Mentorship requires roughly 5-10 hours per week of study and live chart time. I am ready to do the work.
                  </label>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting || !formData.commitmentAgreement}
                  className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition ${
                    isSubmitting || !formData.commitmentAgreement 
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-900/50'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">Processing Application...</span>
                  ) : (
                    <>Submit Application <Send className="h-5 w-5" /></>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EliteApplicationForm;
