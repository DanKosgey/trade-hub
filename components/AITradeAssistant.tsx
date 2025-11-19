import React, { useState, useRef } from 'react';
import { validateTradeWithGemini } from '../services/geminiService';
import { Send, Upload, AlertTriangle, CheckCircle, XCircle, Loader2, BookOpen } from 'lucide-react';
import { ChatMessage, TradeRule, TradeEntry, TradeValidationStatus } from '../types';

interface AITradeAssistantProps {
  userRules: TradeRule[];
  onLogTrade: (entry: Partial<TradeEntry>) => void;
}

const AITradeAssistant: React.FC<AITradeAssistantProps> = ({ userRules, onLogTrade }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! I am your AI Risk Manager. Tell me about the trade you want to take. Is it a Buy or Sell?', timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // State to track the context of the last trade discussed
  const [lastAnalyzedTrade, setLastAnalyzedTrade] = useState<Partial<TradeEntry> | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && !selectedImage) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = inputText; // Capture for draft trade
    setInputText('');
    setIsAnalyzing(true);
    setLastAnalyzedTrade(null); // Reset previous analysis context

    // Prepare rules text
    const activeRules = userRules.map(r => r.text);

    // Call Gemini
    const aiResponseText = await validateTradeWithGemini(
      currentInput,
      activeRules,
      selectedImage || undefined
    );

    const aiMsg: ChatMessage = {
      role: 'model',
      text: aiResponseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsAnalyzing(false);
    
    // Heuristic parsing to create a draft trade entry
    // In a production app, we would ask the AI to return JSON data alongside the text
    const lowerResponse = aiResponseText.toLowerCase();
    const validationResult: TradeValidationStatus = 
      lowerResponse.includes('approved') ? 'approved' :
      lowerResponse.includes('rejected') ? 'rejected' :
      'warning';

    const type = currentInput.toLowerCase().includes('sell') ? 'sell' : 'buy';
    
    setLastAnalyzedTrade({
        notes: `AI Analysis Request: ${currentInput}`,
        validationResult: validationResult,
        type: type,
        screenshotUrl: selectedImage || undefined,
        date: new Date().toISOString()
    });

    setSelectedImage(null); // Clear image after send
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-trade-dark rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
          <h2 className="font-bold text-lg">AI Trade Validator</h2>
        </div>
        <span className="text-xs text-gray-400 uppercase tracking-wider border border-gray-600 px-2 py-1 rounded">Gemini 2.5 Flash</span>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-trade-accent text-white rounded-tr-none' 
                : 'bg-gray-700 text-gray-100 rounded-tl-none border border-gray-600'
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
              <div className="text-[10px] opacity-50 mt-2 text-right">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            
            {/* Show 'Log Trade' button only after AI response if it exists and is the latest message */}
            {msg.role === 'model' && idx === messages.length - 1 && lastAnalyzedTrade && (
              <button 
                onClick={() => onLogTrade(lastAnalyzedTrade)}
                className="mt-2 flex items-center gap-2 bg-gray-800 hover:bg-gray-600 border border-gray-600 text-gray-300 text-xs px-3 py-2 rounded-lg transition"
              >
                <BookOpen className="h-3 w-3" /> Log this Trade to Journal
              </button>
            )}
          </div>
        ))}
        {isAnalyzing && (
          <div className="flex justify-start">
            <div className="bg-gray-700 rounded-2xl p-4 flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-trade-accent" />
              <span className="text-sm text-gray-300">Analyzing liquidity & structure...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        {selectedImage && (
          <div className="mb-3 relative inline-block">
            <img src={selectedImage} alt="Upload preview" className="h-20 rounded border border-gray-600" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600"
            >
              <XCircle className="h-3 w-3 text-white" />
            </button>
          </div>
        )}
        
        <div className="flex gap-3">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition"
            title="Upload Chart Screenshot"
          >
            <Upload className="h-5 w-5" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
          
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Example: Buy EURUSD. Price swept Asian Lows, entered FVG..."
            className="flex-1 bg-gray-900 text-white border border-gray-600 rounded-lg px-4 focus:outline-none focus:border-trade-accent"
          />
          
          <button 
            onClick={handleSendMessage}
            disabled={isAnalyzing || (!inputText && !selectedImage)}
            className="bg-trade-accent text-white p-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
          Use <span className="text-yellow-500">screenshots</span> for better AI accuracy.
        </div>
      </div>
    </div>
  );
};

export default AITradeAssistant;