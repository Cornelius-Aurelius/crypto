
import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  TrendingUp, 
  Activity, 
  Newspaper, 
  ArrowRight,
  Cpu,
  Zap,
  Loader2,
  Menu,
  X,
  Bell,
  Trash2,
  Plus,
  LayoutDashboard,
  Brain,
  Fish,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Radio,
  Target,
  ShieldAlert,
  Clock,
  Atom,
  Waves,
  Scale,
  Eye,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  AlertCircle,
  CircleHelp,
  Briefcase,
  RefreshCw,
  DollarSign,
  Flame
} from 'lucide-react';
import { searchCryptoInfo, checkCryptoPrices, getMarketOverview } from './services/gemini';
import { ChatMessage, SearchResult, PriceAlert, MarketOverview, TradeSetup, IntelligenceEvent, OmegaComponent, UserPortfolio, PortfolioTransaction } from './types';
import MarkdownRenderer from './components/MarkdownRenderer';
import SourceCard from './components/SourceCard';

const SUGGESTED_QUERIES = [
  "Is Bitcoin safe to buy right now?",
  "What are the top 3 undervalued coins?",
  "Analyze Solana's risk level",
  "Explain why ETH is moving",
  "Show me the safest assets to hold"
];

const ADVISOR_QUESTIONS = [
  "Which coin should I buy today for the highest 24-hour profit probability?",
  "Which coin has the best chance of doubling in the next 7 days?",
  "Which micro-cap has the highest breakout probability this week?",
  "What is the safest high-ROI coin for small capital right now?",
  "Which coin is most likely to pump next due to narrative momentum?",
  "Which chart is showing the strongest reversal signal today?",
  "Which coin is underpriced and most likely to rebound?",
  "Where can £100 grow the fastest this week?",
  "Which coin has the lowest risk of losing money today?",
  "Which coin is most likely to explode due to whales accumulating?"
];

const TOP_CRYPTOS = [
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "USDT", name: "Tether" },
  { symbol: "BNB", name: "Binance Coin" },
  { symbol: "SOL", name: "Solana" },
  { symbol: "USDC", name: "USDC" },
  { symbol: "XRP", name: "XRP" },
  { symbol: "DOGE", name: "Dogecoin" },
  { symbol: "TON", name: "Toncoin" },
  { symbol: "ADA", name: "Cardano" },
  { symbol: "SHIB", name: "Shiba Inu" },
  { symbol: "AVAX", name: "Avalanche" },
  { symbol: "DOT", name: "Polkadot" },
  { symbol: "TRX", name: "TRON" },
  { symbol: "BCH", name: "Bitcoin Cash" },
  { symbol: "LINK", name: "Chainlink" },
  { symbol: "MATIC", name: "Polygon" },
  { symbol: "NEAR", name: "NEAR Protocol" },
  { symbol: "LTC", name: "Litecoin" },
  { symbol: "ICP", name: "Internet Computer" },
  { symbol: "DAI", name: "Dai" },
  { symbol: "UNI", name: "Uniswap" },
  { symbol: "APT", name: "Aptos" },
  { symbol: "RNDR", name: "Render" },
  { symbol: "ATOM", name: "Cosmos" },
  { symbol: "HBAR", name: "Hedera" },
  { symbol: "STX", name: "Stacks" },
  { symbol: "FIL", name: "Filecoin" },
  { symbol: "CRO", name: "Cronos" },
  { symbol: "ARB", name: "Arbitrum" },
  { symbol: "VET", name: "VeChain" },
  { symbol: "MKR", name: "Maker" },
  { symbol: "IMX", name: "Immutable" },
  { symbol: "WIF", name: "dogwifhat" },
  { symbol: "OP", name: "Optimism" },
  { symbol: "GRT", name: "The Graph" },
  { symbol: "INJ", name: "Injective" },
  { symbol: "KAS", name: "Kaspa" },
  { symbol: "PEPE", name: "Pepe" },
  { symbol: "THETA", name: "Theta Network" },
  { symbol: "RUNE", name: "THORChain" },
  { symbol: "FTM", name: "Fantom" },
  { symbol: "FET", name: "Fetch.ai" },
  { symbol: "AAVE", name: "Aave" },
  { symbol: "ALGO", name: "Algorand" },
  { symbol: "FLOKI", name: "Floki" },
  { symbol: "BONK", name: "Bonk" },
  { symbol: "TIA", name: "Celestia" },
  { symbol: "SUI", name: "Sui" },
  { symbol: "SEI", name: "Sei" },
  { symbol: "FLOW", name: "Flow" },
  { symbol: "EGLD", name: "MultiversX" },
  { symbol: "QNT", name: "Quant" },
  { symbol: "GALA", name: "Gala" },
  { symbol: "EOS", name: "EOS" },
  { symbol: "ASTR", name: "Astar" },
  { symbol: "LDO", name: "Lido DAO" },
  { symbol: "SNX", name: "Synthetix" },
  { symbol: "XTZ", name: "Tezos" },
  { symbol: "BEAM", name: "Beam" },
  { symbol: "SAND", name: "The Sandbox" },
  { symbol: "MANA", name: "Decentraland" },
  { symbol: "AXS", name: "Axie Infinity" }
];

type Tab = 'dashboard' | 'search' | 'trending' | 'news' | 'alerts' | 'portfolio';
type ViewMode = 'SIMPLE' | 'PRO';

function App() {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [viewMode, setViewMode] = useState<ViewMode>('SIMPLE');
  
  // Dashboard State
  const [marketOverview, setMarketOverview] = useState<MarketOverview | null>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(false);

  // Alerts State
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [newAlertSymbol, setNewAlertSymbol] = useState('');
  const [newAlertTarget, setNewAlertTarget] = useState('');
  const [newAlertCondition, setNewAlertCondition] = useState<'above' | 'below'>('above');
  const [triggeredAlerts, setTriggeredAlerts] = useState<string[]>([]);

  // Portfolio State
  const [portfolio, setPortfolio] = useState<UserPortfolio>({
    cash: 100000,
    positions: [],
    transactions: []
  });
  const [portfolioPrices, setPortfolioPrices] = useState<{[key: string]: number}>({});
  const [tradeSymbol, setTradeSymbol] = useState('');
  const [tradeAmount, setTradeAmount] = useState('');
  const [isTradeLoading, setIsTradeLoading] = useState(false);
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');

  const bottomRef = useRef<HTMLDivElement>(null);

  // Load Saved Data
  useEffect(() => {
    const savedAlerts = localStorage.getItem('crypto_alerts');
    if (savedAlerts) {
      try {
        setAlerts(JSON.parse(savedAlerts));
      } catch (e) {
        console.error("Failed to parse saved alerts");
      }
    }
    
    const savedPortfolio = localStorage.getItem('crypto_portfolio');
    if (savedPortfolio) {
      try {
        setPortfolio(JSON.parse(savedPortfolio));
      } catch (e) {
        console.error("Failed to parse saved portfolio");
      }
    }

    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoadingOverview(true);
    const data = await getMarketOverview();
    setMarketOverview(data);
    setIsLoadingOverview(false);
  };

  // Persist Data
  useEffect(() => {
    localStorage.setItem('crypto_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('crypto_portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    if (activeTab === 'search' && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isSearching, activeTab]);

  // Background Alert Checker
  useEffect(() => {
    const checkPrices = async () => {
      const activeAlerts = alerts.filter(a => a.isActive);
      if (activeAlerts.length === 0) return;

      const symbolsToCheck = Array.from(new Set(activeAlerts.map(a => a.symbol))) as string[];
      if (symbolsToCheck.length === 0) return;

      try {
        const prices = await checkCryptoPrices(symbolsToCheck);
        
        let alertsUpdated = false;
        const updatedAlerts = alerts.map(alert => {
          if (!alert.isActive) return alert;

          const priceData = prices.find(p => p.symbol.toUpperCase() === alert.symbol.toUpperCase());
          if (!priceData) return alert;

          const price = priceData.price;
          const isTriggered = 
            (alert.condition === 'above' && price >= alert.targetPrice) ||
            (alert.condition === 'below' && price <= alert.targetPrice);

          if (isTriggered) {
            alertsUpdated = true;
            if (!triggeredAlerts.includes(alert.id)) {
              setTriggeredAlerts(prev => [...prev, alert.id]);
            }
            return { ...alert, isActive: false, lastChecked: Date.now() };
          }
          return { ...alert, lastChecked: Date.now() };
        });

        if (alertsUpdated) {
          setAlerts(updatedAlerts);
        }
      } catch (error) {
        console.error("Background price check failed", error);
      }
    };

    const intervalId = setInterval(checkPrices, 60000);
    return () => clearInterval(intervalId);
  }, [alerts, triggeredAlerts]);

  // Portfolio Price Checker
  useEffect(() => {
    const updatePortfolioPrices = async () => {
      if (activeTab !== 'portfolio') return;
      const symbols = portfolio.positions.map(p => p.symbol);
      if (symbols.length === 0) return;

      try {
        const prices = await checkCryptoPrices(symbols);
        const priceMap: {[key: string]: number} = {};
        prices.forEach(p => {
          priceMap[p.symbol.toUpperCase()] = p.price;
        });
        setPortfolioPrices(priceMap);
      } catch (error) {
        console.error("Failed to update portfolio prices", error);
      }
    };

    if (activeTab === 'portfolio') {
      updatePortfolioPrices();
      const interval = setInterval(updatePortfolioPrices, 30000);
      return () => clearInterval(interval);
    }
  }, [activeTab, portfolio.positions]);


  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim() || isSearching) return;

    setActiveTab('search');
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: searchQuery.replace(/\[SYSTEM:.*?\]/g, '').trim() // Clean display msg
    };

    setChatHistory(prev => [...prev, userMsg]);
    setIsSearching(true);
    setQuery('');

    try {
      const result: SearchResult = await searchCryptoInfo(searchQuery);
      
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.text,
        sources: result.sources
      };
      
      setChatHistory(prev => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I encountered an error calculating. Please retry."
      };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdvisorAsk = (question: string) => {
    const prompt = `[SYSTEM: Answer the following question in exactly ONE sentence. Format: 'Buy [Symbol] — [Reason]'. Use data from Google Search.] Question: ${question}`;
    handleSearch(prompt);
  };

  const handleNavigation = (tab: Tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);

    if (tab === 'news') {
      setActiveTab('search'); 
      handleSearch("What are the most important crypto news stories from the last 24 hours? Explain simply.");
    } else if (tab === 'trending') {
      setActiveTab('search');
      handleSearch("Which crypto assets are trending today and why? Keep it simple.");
    }
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlertSymbol || !newAlertTarget) return;

    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      symbol: newAlertSymbol.toUpperCase(),
      targetPrice: parseFloat(newAlertTarget),
      condition: newAlertCondition,
      isActive: true,
      createdAt: Date.now()
    };

    setAlerts([...alerts, newAlert]);
    setNewAlertSymbol('');
    setNewAlertTarget('');
  };

  const handlePortfolioTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeSymbol || !tradeAmount) return;
    
    setIsTradeLoading(true);
    const symbol = tradeSymbol.toUpperCase();
    const amount = parseFloat(tradeAmount);

    try {
      // Fetch current price just for this trade
      const prices = await checkCryptoPrices([symbol]);
      const currentPrice = prices.find(p => p.symbol.toUpperCase() === symbol)?.price;

      if (!currentPrice) {
        alert("Could not fetch price for " + symbol);
        setIsTradeLoading(false);
        return;
      }

      const newPortfolio = { ...portfolio };
      const timestamp = Date.now();

      if (tradeType === 'BUY') {
        // Validation: Enough cash?
        if (amount > newPortfolio.cash) {
          alert("Insufficient cash balance.");
          setIsTradeLoading(false);
          return;
        }

        const quantity = amount / currentPrice;

        // Update Cash
        newPortfolio.cash -= amount;

        // Update Position
        const existingPosIndex = newPortfolio.positions.findIndex(p => p.symbol === symbol);
        if (existingPosIndex >= 0) {
          const pos = newPortfolio.positions[existingPosIndex];
          const totalCost = (pos.quantity * pos.averageEntryPrice) + amount;
          const totalQuantity = pos.quantity + quantity;
          newPortfolio.positions[existingPosIndex] = {
            ...pos,
            quantity: totalQuantity,
            averageEntryPrice: totalCost / totalQuantity
          };
        } else {
          newPortfolio.positions.push({
            symbol,
            quantity,
            averageEntryPrice: currentPrice
          });
        }

        // Add Transaction
        newPortfolio.transactions.unshift({
          id: timestamp.toString(),
          type: 'BUY',
          symbol,
          quantity,
          price: currentPrice,
          total: amount,
          timestamp
        });

      } else {
        // SELL
        const posIndex = newPortfolio.positions.findIndex(p => p.symbol === symbol);
        if (posIndex === -1) {
          alert("You do not own this asset.");
          setIsTradeLoading(false);
          return;
        }

        const pos = newPortfolio.positions[posIndex];
        // For sell, amount is treated as USD value to sell. 
        // Or we could do quantity. Let's assume input is USD amount to sell.
        const quantityToSell = amount / currentPrice;

        if (quantityToSell > pos.quantity) {
          alert("Insufficient holdings.");
          setIsTradeLoading(false);
          return;
        }

        // Update Cash
        newPortfolio.cash += amount;

        // Update Position
        const remainingQty = pos.quantity - quantityToSell;
        if (remainingQty <= 0.00000001) { // Floating point safety
          newPortfolio.positions.splice(posIndex, 1);
        } else {
          newPortfolio.positions[posIndex] = {
            ...pos,
            quantity: remainingQty
          };
        }

        // Add Transaction
        newPortfolio.transactions.unshift({
          id: timestamp.toString(),
          type: 'SELL',
          symbol,
          quantity: quantityToSell,
          price: currentPrice,
          total: amount,
          timestamp
        });
      }

      setPortfolio(newPortfolio);
      setTradeAmount('');
      setTradeSymbol('');
      // Trigger price update
      setPortfolioPrices(prev => ({...prev, [symbol]: currentPrice}));

    } catch (err) {
      console.error(err);
      alert("Trade failed.");
    } finally {
      setIsTradeLoading(false);
    }
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const dismissTriggered = (id: string) => {
    setTriggeredAlerts(prev => prev.filter(tid => tid !== id));
  };

  const getOmeiColor = (score: number) => {
    if (score > 50) return 'text-red-500'; // High Risk
    if (score < -30) return 'text-emerald-400'; // Safe/Undervalued
    return 'text-slate-200'; // Neutral
  };
  
  const renderOmegaComponentBar = (comp: OmegaComponent, color: string, icon: React.ReactNode) => (
    <div className="mb-4 last:mb-0 group">
      <div className="flex justify-between items-end mb-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 group-hover:text-white transition-colors">
          {icon}
          {comp.label}
        </div>
        <span className={`text-xs font-bold font-mono ${color}`}>{comp.value.toFixed(1)}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${color.replace('text-', 'bg-')}`} 
          style={{ width: `${comp.value}%` }}
        ></div>
      </div>
      <p className="text-[10px] text-slate-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {comp.desc}
      </p>
    </div>
  );

  const renderSimpleSignalCard = (setup: TradeSetup) => {
    // Fallback
    const { action, score, humanReason } = setup.simplifiedAnalysis || { 
      action: 'HOLD', score: 50, humanReason: 'Data insufficient' 
    };

    // Determine colors based on Score (assuming 0-100 scale: 0=Sell, 100=Buy)
    let colorClass = 'text-slate-200';
    let bgClass = 'bg-slate-800';
    let barColor = 'bg-slate-500';
    let Icon = Activity;
    
    // We trust the LLM to sync Action and Score, but let's derive styling from Score for the bar
    if (score >= 60) {
      colorClass = 'text-emerald-400';
      bgClass = 'bg-emerald-500/10';
      barColor = 'bg-emerald-500';
      Icon = TrendingUp;
    } else if (score <= 40) {
      colorClass = 'text-red-400';
      bgClass = 'bg-red-500/10';
      barColor = 'bg-red-500';
      Icon = TrendingUp; // rotated later
    } else {
        colorClass = 'text-amber-400';
        bgClass = 'bg-amber-500/10';
        barColor = 'bg-amber-500';
        Icon = Activity;
    }

    return (
      <div key={`simple-${setup.symbol}`} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 relative overflow-hidden shadow-lg hover:shadow-emerald-900/10 transition-all hover:scale-[1.01] flex flex-col h-full group">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
           <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgClass} border border-white/5 text-xl font-bold text-white shadow-inner`}>
              {setup.symbol[0]}
           </div>
           <div>
             <h3 className="text-lg font-bold text-white">{setup.name}</h3>
             <span className="text-xs font-mono text-slate-500">{setup.symbol}</span>
           </div>
           <div className="ml-auto flex flex-col items-end">
               <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Score</span>
               <span className={`text-2xl font-black ${colorClass} font-mono leading-none`}>{score}<span className="text-sm opacity-50">/100</span></span>
           </div>
        </div>

        {/* Progress Bar Visualization */}
        <div className="mb-6 relative">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 font-sans">
                <span>Sell</span>
                <span>Hold</span>
                <span>Buy</span>
            </div>
            
            {/* Track */}
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden relative">
                {/* Zones Background (Optional, subtle) */}
                <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-red-500 via-slate-500 to-emerald-500"></div>
                
                {/* Fill Bar */}
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${barColor}`}
                    style={{ width: `${score}%` }}
                ></div>
            </div>
            
            {/* Dynamic Label under bar */}
            <div className="mt-2 flex justify-end">
                 <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${bgClass} ${colorClass} border border-white/5`}>
                    {Icon === TrendingUp && score <= 40 ? <TrendingUp className="w-3.5 h-3.5 transform rotate-180" /> : <Icon className="w-3.5 h-3.5" />}
                    {action}
                 </div>
            </div>
        </div>

        {/* Reason Box */}
        <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50 mt-auto">
            <div className="flex items-start gap-2">
                <Brain className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-300 font-medium leading-relaxed italic">
                    "{humanReason}"
                </p>
            </div>
        </div>

        {/* "Why this asset?" button */}
        <button 
           onClick={(e) => {
             e.stopPropagation();
             handleSearch(`Explain simply why you recommended ${setup.symbol}. What is the main reason?`);
           }}
           className="w-full mt-3 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold rounded-lg transition-colors border border-slate-700/50 hover:border-slate-600 flex items-center justify-center gap-2 group/btn"
        >
          <CircleHelp className="w-3.5 h-3.5 group-hover/btn:text-emerald-400 transition-colors" />
          Why this asset?
        </button>
      </div>
    );
  };

  const renderTradeSetupCard = (setup: TradeSetup) => {
    const isLong = setup.direction === 'LONG';
    const borderColor = isLong ? 'border-emerald-500/30' : 'border-red-500/30';
    const bgColor = isLong ? 'bg-emerald-500/5' : 'bg-red-500/5';
    const textColor = isLong ? 'text-emerald-400' : 'text-red-400';
    const icon = isLong ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />;

    // Get score for the meter from simplifiedAnalysis, default to 50 if missing
    const analysisScore = setup.simplifiedAnalysis?.score ?? 50;
    // Determine colors based on Score
    const meterColor = analysisScore >= 60 ? 'bg-emerald-500' : analysisScore <= 40 ? 'bg-red-500' : 'bg-amber-500';
    const meterTextColor = analysisScore >= 60 ? 'text-emerald-400' : analysisScore <= 40 ? 'text-red-400' : 'text-amber-400';

    return (
      <div key={setup.symbol} className={`rounded-2xl border ${borderColor} ${bgColor} p-5 relative overflow-hidden transition-all hover:border-opacity-50 group`}>
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isLong ? 'bg-emerald-500/20' : 'bg-red-500/20'} text-white font-bold text-lg`}>
            {setup.symbol.substring(0, 1)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white tracking-tight">{setup.name}</h3>
              <span className="text-xs font-mono text-slate-500">{setup.symbol}</span>
            </div>
            <div className={`flex items-center gap-1 text-sm font-bold ${textColor}`}>
              {icon}
              {setup.direction}
            </div>
          </div>
        </div>

        {/* AI Conviction Meter */}
        <div className="mb-5 bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
           <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">AI Conviction Score</span>
              <span className={`text-lg font-bold font-mono ${meterTextColor}`}>{analysisScore}<span className="text-xs text-slate-500">/100</span></span>
           </div>
           <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden relative">
              {/* Optional Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-amber-500/20 to-emerald-500/20"></div>
              <div 
                 className={`h-full rounded-full transition-all duration-1000 ${meterColor} shadow-[0_0_10px_rgba(0,0,0,0.3)]`}
                 style={{ width: `${analysisScore}%` }}
              ></div>
           </div>
           <div className="flex justify-between mt-1 text-[9px] font-bold text-slate-600 uppercase tracking-widest font-mono">
              <span>Sell Risk</span>
              <span>Buy Signal</span>
           </div>
        </div>

        {/* The Logic */}
        <div className="bg-slate-900/60 rounded-xl p-4 mb-4 border border-slate-700/50">
           <div className="mb-3">
             <div className="flex items-center gap-2 text-xs text-indigo-400 uppercase tracking-wider font-bold mb-1 font-sans">
               <Scale className="w-3 h-3" />
               Analysis
             </div>
             <p className="text-sm text-slate-200 leading-snug font-light italic">
               "{setup.physicsRationale}"
             </p>
           </div>
           
           <div>
             <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider font-bold mb-1 font-sans">
               <Target className="w-3 h-3" />
               Prediction
             </div>
             <p className={`text-sm font-medium ${textColor} leading-snug`}>
               "{setup.prediction}"
             </p>
           </div>
        </div>

        {/* Trade Levels */}
        <div className="grid grid-cols-3 gap-2 mb-4 font-mono">
          <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50 text-center">
            <div className="text-[10px] text-slate-500 uppercase mb-1">Entry</div>
            <div className="text-sm text-white">{setup.entry}</div>
          </div>
          <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50 text-center relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-0.5 ${isLong ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
            <div className="text-[10px] text-slate-500 uppercase mb-1">Target</div>
            <div className={`text-sm font-bold ${isLong ? 'text-emerald-400' : 'text-red-400'}`}>{setup.target}</div>
          </div>
          <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50 text-center">
            <div className="text-[10px] text-slate-500 uppercase mb-1">Stop</div>
            <div className="text-sm text-slate-300">{setup.stopLoss}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-700/50 pt-3 mt-4">
          <div className="flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3" />
            {setup.timeframe}
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleSearch(`Explain simply why you recommended ${setup.symbol}. What is the main reason?`);
                }}
                className="hover:text-emerald-400 transition-colors flex items-center gap-1"
             >
               <CircleHelp className="w-3 h-3" />
               Why this asset?
             </button>
             <button 
                onClick={() => handleSearch(`Simulate what happens if I buy ${setup.symbol} now.`)}
                className="hover:text-white transition-colors flex items-center gap-1"
             >
               Analyze <ArrowRight className="w-3 h-3" />
             </button>
          </div>
        </div>
      </div>
    );
  };

  const renderLiveFeedItem = (item: IntelligenceEvent, idx: number) => {
    const getIcon = () => {
      switch (item.type) {
        case 'WHALE': return <Fish className="w-4 h-4 text-indigo-400" />;
        case 'NEWS': return <Newspaper className="w-4 h-4 text-emerald-400" />;
        case 'ON-CHAIN': return <Activity className="w-4 h-4 text-amber-400" />;
        case 'EXCHANGE': return <Wallet className="w-4 h-4 text-purple-400" />;
        case 'OMEGA_SIGNAL': return <Atom className="w-4 h-4 text-cyan-400 animate-pulse" />;
      }
    };
    
    return (
      <div key={idx} className={`flex gap-3 p-3 rounded-lg border transition-colors ${item.type === 'OMEGA_SIGNAL' ? 'bg-cyan-900/10 border-cyan-500/30' : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50'}`}>
        <div className="mt-1 flex-shrink-0">{getIcon()}</div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-slate-500">{item.time}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold font-mono ${
              item.impact === 'HIGH' ? 'bg-red-500/20 text-red-400' : 
              item.impact === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-600/20 text-slate-400'
            }`}>
              {item.impact}
            </span>
          </div>
          <p className="text-sm text-slate-200 leading-snug">{item.message}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-emerald-500/30">
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed md:relative z-50 w-64 h-full bg-[#0B1120] border-r border-slate-800
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8 text-emerald-400">
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white leading-none">CRYPTO PULSE</h1>
              <span className="text-[10px] text-emerald-500/60 font-mono tracking-widest">AI MARKET INTEL</span>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
              { id: 'search', label: 'Deep Search', icon: Search },
              { id: 'trending', label: 'Trending Assets', icon: TrendingUp },
              { id: 'news', label: 'News Feed', icon: Newspaper },
              { id: 'alerts', label: 'Smart Alerts', icon: Bell },
              { id: 'portfolio', label: 'Paper Trading', icon: Briefcase }
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => handleNavigation(item.id as Tab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? 'bg-slate-900 text-emerald-400 border border-emerald-500/20 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-900">
          <div className="bg-slate-900 rounded-xl p-4 text-white relative overflow-hidden group border border-slate-800">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Cpu className="w-16 h-16 transform rotate-12" />
            </div>
            <p className="text-[10px] font-mono text-slate-400 mb-1 uppercase tracking-wider">System Status</p>
            <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Online
            </h3>
            <div className="text-[10px] text-slate-500 font-mono">
              AI Analysis: Active
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full relative w-full bg-[#0f172a] overflow-hidden">
        <header className="md:hidden flex items-center justify-between p-4 bg-[#0B1120] border-b border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400">
            <Activity className="w-5 h-5" />
            <span className="font-bold text-white">CryptoPulse</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-slate-400 hover:text-white"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Triggered Alerts Toast */}
        <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
          {triggeredAlerts.map(id => {
            const alert = alerts.find(a => a.id === id);
            if (!alert) return null;
            return (
              <div key={id} className="pointer-events-auto bg-slate-800 border-l-4 border-emerald-500 shadow-xl rounded-r-lg p-4 animate-slide-in-right flex items-start justify-between">
                <div>
                  <h4 className="text-emerald-400 font-bold flex items-center gap-2">
                    <Bell className="w-4 h-4 fill-emerald-400" />
                    Target Hit
                  </h4>
                  <p className="text-sm text-slate-300 mt-1">
                    <span className="font-bold text-white">{alert.symbol}</span> crossed ${alert.targetPrice.toLocaleString()}
                  </p>
                </div>
                <button 
                  onClick={() => dismissTriggered(id)}
                  className="text-slate-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto scroll-smooth">
          
          {activeTab === 'dashboard' && (
            <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
              {/* Dashboard Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Market Overview</h2>
                  <p className="text-slate-400 font-sans text-sm">
                    Real-time market analysis and risk assessment powered by AI.
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="bg-slate-900 border border-slate-800 p-1 rounded-lg flex mr-4">
                    <button 
                      onClick={() => setViewMode('SIMPLE')}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${
                        viewMode === 'SIMPLE' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Zap className="w-3 h-3" />
                      SIMPLE
                    </button>
                    <button 
                      onClick={() => setViewMode('PRO')}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${
                        viewMode === 'PRO' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Activity className="w-3 h-3" />
                      DETAILED
                    </button>
                  </div>

                  <button 
                    onClick={() => handleSearch("Simulate a market crash scenario for Bitcoin. Is it likely?")}
                    className="hidden md:flex px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors items-center gap-2 text-sm font-medium border border-indigo-400/20 shadow-lg shadow-indigo-500/10"
                  >
                    <Brain className="w-4 h-4" />
                    Simulate Scenario
                  </button>
                  <button 
                    onClick={loadDashboard}
                    disabled={isLoadingOverview}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors disabled:opacity-50 border border-slate-700"
                    title="Refresh Data"
                  >
                    <Radio className={`w-5 h-5 ${isLoadingOverview ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {isLoadingOverview && !marketOverview ? (
                <div className="flex items-center justify-center h-96">
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Activity className="w-6 h-6 text-emerald-500" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-emerald-400 font-bold text-sm mb-1">ANALYZING MARKET DATA...</p>
                      <p className="text-slate-500 text-xs">Scanning Trends, Volatility & Sentiment</p>
                    </div>
                  </div>
                </div>
              ) : marketOverview ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* LEFT COLUMN: Risk & Components (3 cols) - Only visible in PRO mode, or simplified in Simple */}
                  <div className={`lg:col-span-3 space-y-6 ${viewMode === 'SIMPLE' ? 'hidden lg:block lg:opacity-60 grayscale-[50%]' : ''}`}>
                    
                    {/* Risk Gauge */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl shadow-black/50">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                        <ShieldAlert className="w-40 h-40 text-white" />
                      </div>
                      
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-slate-400 font-bold font-sans text-xs uppercase tracking-wider flex items-center gap-2">
                          <Scale className="w-4 h-4 text-emerald-500" />
                          Market Risk Meter
                        </h3>
                        {marketOverview.omegaMetrics.deltaJ.isOmegaPoint && (
                          <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded text-[10px] font-bold font-sans animate-pulse">
                            MARKET BOTTOM
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col items-center py-2">
                        <div className="relative w-full h-32 flex items-center justify-center mb-2">
                           {/* Gauge Background */}
                           <div className="absolute w-48 h-24 border-[12px] border-slate-800 rounded-t-full top-4 border-b-0"></div>
                           {/* Gauge Needle/Fill */}
                           <div 
                             className={`absolute w-48 h-24 border-[12px] border-t-transparent border-l-transparent border-r-transparent rounded-t-full top-4 border-b-0 transition-all duration-1000 origin-bottom`}
                             style={{ 
                               borderColor: marketOverview.omegaMetrics.omeiScore > 0 ? '#ef4444' : '#10b981', // Red vs Emerald
                               transform: `rotate(${(marketOverview.omegaMetrics.omeiScore / 100) * 90}deg)` // Simple rotation logic
                             }}
                           ></div>
                           
                           <div className="absolute bottom-6 flex flex-col items-center">
                             <span className={`text-4xl font-bold ${getOmeiColor(marketOverview.omegaMetrics.omeiScore)} font-mono tracking-tighter`}>
                               {marketOverview.omegaMetrics.omeiScore > 0 ? '+' : ''}{marketOverview.omegaMetrics.omeiScore}
                             </span>
                             <span className="text-[10px] text-slate-500 font-sans uppercase">Safety Score</span>
                           </div>
                        </div>
                        <h4 className={`text-lg font-bold ${getOmeiColor(marketOverview.omegaMetrics.omeiScore)} text-center`}>
                          {marketOverview.omegaMetrics.omeiLabel}
                        </h4>
                      </div>
                      
                      {/* Trend Indicator */}
                      <div className="mt-4 bg-[#0B1120] rounded-lg p-3 border border-slate-800">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] text-slate-500 uppercase font-bold">Market Momentum</span>
                          <span className={`text-xs font-sans font-bold ${
                            marketOverview.omegaMetrics.deltaJ.trend.includes('RISING') ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {marketOverview.omegaMetrics.deltaJ.trend}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-snug italic">
                          "{marketOverview.omegaMetrics.deltaJ.prediction}"
                        </p>
                      </div>
                    </div>

                    {/* Component Monitors */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                      <h3 className="text-slate-400 font-bold font-sans text-xs uppercase tracking-wider mb-5 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-indigo-500" />
                        Key Market Factors
                      </h3>
                      <div className="space-y-5">
                        {renderOmegaComponentBar(
                          marketOverview.omegaMetrics.components.d_kl, 
                          'text-amber-400', 
                          <Waves className="w-3 h-3" />
                        )}
                        {renderOmegaComponentBar(
                          marketOverview.omegaMetrics.components.volatility, 
                          'text-red-400', 
                          <Zap className="w-3 h-3" />
                        )}
                        {renderOmegaComponentBar(
                          marketOverview.omegaMetrics.components.liquidity, 
                          'text-cyan-400', 
                          <Activity className="w-3 h-3" />
                        )}
                        {renderOmegaComponentBar(
                          marketOverview.omegaMetrics.components.awareness, 
                          'text-emerald-400', 
                          <Eye className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* CENTER COLUMN: Top Opportunities (6 cols) */}
                  <div className="lg:col-span-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {viewMode === 'SIMPLE' ? <Zap className="w-5 h-5 text-yellow-400" /> : <Target className="w-5 h-5 text-emerald-400" />}
                        {viewMode === 'SIMPLE' ? 'Smart Signals (AI)' : 'Deep Dive Opportunities'}
                      </h3>
                      <span className="text-xs text-slate-500 font-mono">LIVE FEED</span>
                    </div>

                    {/* Trade Cards - Switch based on mode */}
                    <div className="space-y-4">
                      {marketOverview.topOpportunities.map(setup => (
                        viewMode === 'SIMPLE' 
                          ? renderSimpleSignalCard(setup)
                          : renderTradeSetupCard(setup)
                      ))}
                    </div>
                    
                    <div className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-blue-400">Disclaimer</h4>
                        <p className="text-xs text-slate-400 leading-relaxed mt-1">
                          This AI analysis is for informational purposes only. Cryptocurrency trading involves high risk. Always do your own research.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Live Intel (3 cols) */}
                  <div className="lg:col-span-3">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-400 font-bold font-sans text-xs uppercase tracking-wider flex items-center gap-2">
                          <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                          Live Market Feed
                        </h3>
                      </div>
                      <div className="space-y-3 overflow-y-auto pr-2 max-h-[600px] scrollbar-thin scrollbar-thumb-slate-700">
                        {marketOverview.liveFeed.map((item, idx) => renderLiveFeedItem(item, idx))}
                      </div>
                      
                      <div className="mt-6 pt-6 border-t border-slate-800">
                        <h3 className="text-slate-500 font-bold font-sans text-xs uppercase tracking-wider mb-3">
                          Market Drivers
                        </h3>
                        <ul className="space-y-2">
                          {marketOverview.marketDrivers.map((driver, idx) => (
                            <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                              <span className="mt-1 w-1 h-1 bg-indigo-500 rounded-full"></span>
                              {driver}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center py-20 bg-slate-800/30 rounded-3xl border border-slate-800 border-dashed">
                  <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500">System Offline. Please refresh to re-initialize.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'alerts' && (
             <div className="p-4 md:p-8 max-w-5xl mx-auto">
               <div className="mb-8">
                 <h2 className="text-3xl font-bold text-white mb-2">Smart Price Alerts</h2>
                 <p className="text-slate-400">Set real-time monitoring targets for your favorite assets.</p>
               </div>
               {/* Alert logic maintained from previous version... */}
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-1">
                   <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                     <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                       <Plus className="w-5 h-5 text-emerald-500" />
                       Create New Alert
                     </h3>
                     <form onSubmit={handleCreateAlert} className="space-y-4">
                       <div>
                         <label className="block text-xs font-medium text-slate-400 mb-1">Asset Symbol</label>
                         <input 
                            type="text" 
                            list="crypto-list"
                            placeholder="e.g. BTC"
                            value={newAlertSymbol}
                            onChange={(e) => setNewAlertSymbol(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none uppercase"
                         />
                       </div>
                       <div>
                         <label className="block text-xs font-medium text-slate-400 mb-1">Target Price (USD)</label>
                         <input 
                            type="number" 
                            placeholder="50000"
                            value={newAlertTarget}
                            onChange={(e) => setNewAlertTarget(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                         />
                       </div>
                       <div>
                         <label className="block text-xs font-medium text-slate-400 mb-1">Condition</label>
                         <div className="grid grid-cols-2 gap-2">
                           <button
                             type="button"
                             onClick={() => setNewAlertCondition('above')}
                             className={`px-4 py-2 rounded-lg text-sm border ${
                               newAlertCondition === 'above' 
                               ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                               : 'bg-slate-900 border-slate-700 text-slate-400'
                             }`}
                           >
                             Above
                           </button>
                           <button
                             type="button"
                             onClick={() => setNewAlertCondition('below')}
                             className={`px-4 py-2 rounded-lg text-sm border ${
                               newAlertCondition === 'below' 
                               ? 'bg-red-500/20 border-red-500 text-red-400' 
                               : 'bg-slate-900 border-slate-700 text-slate-400'
                             }`}
                           >
                             Below
                           </button>
                         </div>
                       </div>
                       <button 
                         type="submit"
                         disabled={!newAlertSymbol || !newAlertTarget}
                         className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                       >
                         Set Alert
                       </button>
                     </form>
                   </div>
                 </div>

                 <div className="lg:col-span-2">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                      <div className="p-4 bg-slate-950/50 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-200">Active Alerts</h3>
                        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                          Checked every 60s
                        </span>
                      </div>
                      
                      {alerts.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                          <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                          <p>No alerts set yet.</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-800">
                          {alerts.map(alert => (
                            <div key={alert.id} className={`p-4 flex items-center justify-between ${!alert.isActive ? 'opacity-50 bg-slate-900/50' : 'hover:bg-slate-800/50'}`}>
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  !alert.isActive ? 'bg-slate-800 text-slate-500' :
                                  alert.condition === 'above' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                }`}>
                                  {alert.condition === 'above' ? <TrendingUp className="w-5 h-5" /> : <TrendingUp className="w-5 h-5 transform rotate-180" />}
                                </div>
                                <div>
                                  <div className="font-bold text-white flex items-center gap-2">
                                    {alert.symbol}
                                    {!alert.isActive && <span className="text-xs font-normal text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded">Triggered</span>}
                                  </div>
                                  <div className="text-sm text-slate-400">
                                    Target: {alert.condition === 'above' ? '>' : '<'} <span className="text-slate-200 font-mono">${alert.targetPrice.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                              <button 
                                onClick={() => deleteAlert(alert.id)}
                                className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                 </div>
               </div>
             </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="p-4 md:p-8 max-w-[1200px] mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Paper Trading Portfolio</h2>
                <p className="text-slate-400">Practice trading with $100,000 in virtual funds.</p>
              </div>

              {/* Net Worth Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Briefcase className="w-16 h-16 text-emerald-500" />
                  </div>
                  <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Net Worth</h3>
                  <div className="text-3xl font-bold text-white font-mono mb-1">
                    ${(portfolio.cash + portfolio.positions.reduce((acc, pos) => acc + (pos.quantity * (portfolioPrices[pos.symbol] || pos.averageEntryPrice)), 0)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Includes Cash + Assets</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                   <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Available Cash</h3>
                   <div className="text-3xl font-bold text-emerald-400 font-mono mb-1">
                     ${portfolio.cash.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                   </div>
                   <div className="text-xs text-slate-500">Buying Power</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                   <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Return</h3>
                   {(() => {
                      const currentVal = portfolio.positions.reduce((acc, pos) => acc + (pos.quantity * (portfolioPrices[pos.symbol] || pos.averageEntryPrice)), 0);
                      const costBasis = portfolio.positions.reduce((acc, pos) => acc + (pos.quantity * pos.averageEntryPrice), 0);
                      const pnl = currentVal - costBasis;
                      const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
                      const isProfit = pnl >= 0;

                      return (
                        <>
                          <div className={`text-3xl font-bold font-mono mb-1 ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isProfit ? '+' : ''}{pnl.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </div>
                          <div className={`text-xs font-bold ${isProfit ? 'text-emerald-500' : 'text-red-500'}`}>
                            {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}% All Time
                          </div>
                        </>
                      );
                   })()}
                </div>
              </div>

              {/* AI Advisor Section (NEW) */}
              <div className="mb-8 bg-slate-900/50 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Brain className="w-32 h-32 text-emerald-500" />
                </div>
                
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  AI Trade Strategy (Cheat Codes)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                   {ADVISOR_QUESTIONS.map((q, idx) => (
                     <button
                       key={idx}
                       onClick={() => handleAdvisorAsk(q)}
                       className="text-left p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/50 transition-all text-xs text-slate-300 hover:text-white flex items-center justify-between group"
                     >
                       <span className="line-clamp-2">{q}</span>
                       <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400 flex-shrink-0 ml-2" />
                     </button>
                   ))}
                </div>

                <button
                  onClick={() => handleAdvisorAsk("What is the highest-probability move I can make right now with £50? Answer in one sentence.")}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2"
                >
                  <Flame className="w-5 h-5 text-yellow-300" />
                  MILLIONAIRE SWITCH: Best £50 Move Right Now
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Trade Terminal */}
                <div className="lg:col-span-1">
                   <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                     <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                       <RefreshCw className="w-5 h-5 text-indigo-500" />
                       Trade Terminal
                     </h3>
                     
                     <div className="flex bg-slate-800 rounded-lg p-1 mb-6">
                       <button 
                         onClick={() => setTradeType('BUY')}
                         className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${
                           tradeType === 'BUY' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                         }`}
                       >
                         BUY
                       </button>
                       <button 
                         onClick={() => setTradeType('SELL')}
                         className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${
                           tradeType === 'SELL' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                         }`}
                       >
                         SELL
                       </button>
                     </div>

                     <form onSubmit={handlePortfolioTrade} className="space-y-4">
                       <div>
                         <label className="block text-xs font-medium text-slate-400 mb-1">Asset Symbol</label>
                         <input 
                           type="text" 
                           list="crypto-list"
                           placeholder="BTC or Select..."
                           value={tradeSymbol}
                           onChange={(e) => setTradeSymbol(e.target.value.toUpperCase())}
                           className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 focus:outline-none uppercase font-mono"
                         />
                         <p className="text-[10px] text-slate-500 mt-1 ml-1">Or type any other symbol</p>
                       </div>
                       
                       <div>
                         <label className="block text-xs font-medium text-slate-400 mb-1">Amount (USD)</label>
                         <div className="relative">
                           <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                           <input 
                             type="number" 
                             placeholder="5000"
                             value={tradeAmount}
                             onChange={(e) => setTradeAmount(e.target.value)}
                             className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-3 text-white focus:border-indigo-500 focus:outline-none font-mono"
                           />
                         </div>
                       </div>

                       <div className="pt-2">
                          <button 
                             type="submit"
                             disabled={isTradeLoading || !tradeSymbol || !tradeAmount}
                             className={`w-full py-3 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 ${
                               isTradeLoading ? 'opacity-50 cursor-not-allowed' : ''
                             } ${
                               tradeType === 'BUY' ? 'bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20' : 'bg-red-500 hover:bg-red-400 shadow-lg shadow-red-500/20'
                             }`}
                          >
                            {isTradeLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {tradeType} {tradeSymbol || 'ASSET'}
                          </button>
                       </div>
                     </form>
                   </div>
                </div>

                {/* Holdings Table */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
                      <h3 className="font-bold text-white">Current Holdings</h3>
                    </div>
                    
                    {portfolio.positions.length === 0 ? (
                      <div className="p-12 text-center text-slate-500">
                        <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Your portfolio is empty.</p>
                        <p className="text-xs mt-1">Start trading to see your assets here.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase font-semibold">
                            <tr>
                              <th className="px-6 py-3">Asset</th>
                              <th className="px-6 py-3 text-right">Qty</th>
                              <th className="px-6 py-3 text-right">Avg Price</th>
                              <th className="px-6 py-3 text-right">Current Price</th>
                              <th className="px-6 py-3 text-right">Value</th>
                              <th className="px-6 py-3 text-right">Return</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {portfolio.positions.map((pos) => {
                              const currentPrice = portfolioPrices[pos.symbol] || pos.averageEntryPrice;
                              const currentValue = pos.quantity * currentPrice;
                              const costBasis = pos.quantity * pos.averageEntryPrice;
                              const pnl = currentValue - costBasis;
                              const pnlPercent = (pnl / costBasis) * 100;
                              const isProfit = pnl >= 0;

                              return (
                                <tr key={pos.symbol} className="hover:bg-slate-800/30 transition-colors">
                                  <td className="px-6 py-4 font-bold text-white">{pos.symbol}</td>
                                  <td className="px-6 py-4 text-right font-mono text-slate-300">{pos.quantity.toFixed(4)}</td>
                                  <td className="px-6 py-4 text-right font-mono text-slate-400">${pos.averageEntryPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                  <td className="px-6 py-4 text-right font-mono text-white">${currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                  <td className="px-6 py-4 text-right font-mono font-bold text-white">${currentValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                  <td className={`px-6 py-4 text-right font-mono font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  
                  {/* Transaction History (Collapsed/Small) */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                     <div className="p-4 border-b border-slate-800 bg-slate-950/30">
                       <h3 className="font-bold text-slate-400 text-sm">Recent Transactions</h3>
                     </div>
                     <div className="max-h-48 overflow-y-auto">
                        {portfolio.transactions.length === 0 ? (
                           <div className="p-4 text-center text-slate-600 text-xs">No transactions yet</div>
                        ) : (
                          <table className="w-full text-xs text-left">
                            <thead className="bg-slate-950/50 text-slate-500 uppercase">
                              <tr>
                                <th className="px-4 py-2">Time</th>
                                <th className="px-4 py-2">Type</th>
                                <th className="px-4 py-2">Asset</th>
                                <th className="px-4 py-2 text-right">Price</th>
                                <th className="px-4 py-2 text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                              {portfolio.transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-800/30">
                                  <td className="px-4 py-2 text-slate-500 font-mono">
                                    {new Date(tx.timestamp).toLocaleDateString()}
                                  </td>
                                  <td className="px-4 py-2">
                                    <span className={`px-1.5 py-0.5 rounded font-bold ${tx.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                      {tx.type}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2 font-bold text-slate-300">{tx.symbol}</td>
                                  <td className="px-4 py-2 text-right font-mono text-slate-400">${tx.price.toLocaleString()}</td>
                                  <td className="px-4 py-2 text-right font-mono text-slate-300">${tx.total.toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                     </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'search' && (
            <div className="flex flex-col h-full">
              <div className="flex-1 p-4 md:p-8 pb-32">
                <div className="max-w-4xl mx-auto space-y-8">
                  {chatHistory.length === 0 && (
                    <div className="text-center py-12 md:py-20 animate-fade-in">
                      <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 rounded-full mb-6 ring-1 ring-emerald-500/20">
                        <Activity className="w-10 h-10 text-emerald-400" />
                      </div>
                      <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                        Deep Market Search
                      </h2>
                      <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Ask our AI about any crypto asset, market trends, or risk factors.
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
                        {SUGGESTED_QUERIES.map((q) => (
                          <button
                            key={q}
                            onClick={() => handleSearch(q)}
                            className="group p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/30 rounded-xl transition-all flex items-center justify-between"
                          >
                            <span className="text-sm text-slate-300 group-hover:text-emerald-300">{q}</span>
                            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-500 transition-colors opacity-0 group-hover:opacity-100" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {chatHistory.map((msg) => (
                    <div key={msg.id} className={`flex gap-4 md:gap-6 ${msg.role === 'assistant' ? 'animate-fade-in-up' : ''}`}>
                      <div className={`
                        flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center
                        ${msg.role === 'assistant' 
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-900/20' 
                          : 'bg-slate-700'}
                      `}>
                        {msg.role === 'assistant' ? <Activity className="w-5 h-5 text-white" /> : <div className="w-5 h-5 rounded-full bg-slate-400" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-sm md:text-base text-white">
                            {msg.role === 'assistant' ? 'CryptoPulse AI' : 'You'}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            {new Date(parseInt(msg.id)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {msg.role === 'user' ? (
                          <p className="text-lg md:text-xl text-slate-200 leading-relaxed">{msg.content}</p>
                        ) : (
                          <div className="space-y-6">
                            <div className="prose prose-invert prose-emerald max-w-none">
                              <MarkdownRenderer content={msg.content} />
                            </div>

                            {msg.sources && msg.sources.length > 0 && (
                              <div className="pt-4 border-t border-slate-800/50">
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                  <Search className="w-3 h-3" />
                                  Sources
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                  {msg.sources.map((source, idx) => (
                                    <SourceCard key={`${msg.id}-source-${idx}`} source={source} index={idx} />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isSearching && (
                    <div className="flex gap-6 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                      </div>
                      <div className="space-y-3 flex-1">
                        <div className="h-4 bg-slate-800 rounded w-1/4"></div>
                        <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={bottomRef} />
                </div>
              </div>

              <div className="p-4 md:p-6 bg-[#0f172a]/95 backdrop-blur-sm border-t border-slate-800 sticky bottom-0 w-full z-10">
                <div className="max-w-4xl mx-auto relative">
                  <div className="relative group">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about Bitcoin, Solana, or any crypto asset..."
                      className="w-full bg-[#0B1120] text-slate-100 placeholder-slate-500 rounded-2xl py-4 pl-5 pr-14 
                              border border-slate-700 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 
                              transition-all shadow-lg shadow-black/20 outline-none text-base md:text-lg font-sans"
                      disabled={isSearching}
                    />
                    <button
                      onClick={() => handleSearch()}
                      disabled={!query.trim() || isSearching}
                      className="absolute right-2 top-2 p-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl 
                              transition-all disabled:opacity-50 disabled:hover:bg-emerald-500 disabled:cursor-not-allowed
                              shadow-lg shadow-emerald-500/20 active:scale-95"
                    >
                      {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
        
        {/* Global Datalist for Crypto Selection */}
        <datalist id="crypto-list">
          {TOP_CRYPTOS.map(c => (
            <option key={c.symbol} value={c.symbol}>{c.name}</option>
          ))}
        </datalist>
      </main>
    </div>
  );
}

export default App;
