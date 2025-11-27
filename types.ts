
// types.ts

export interface SearchSource {
  title: string;
  uri: string;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  webSearchQueries?: string[];
}

export interface SearchResult {
  text: string;
  sources: SearchSource[];
  relatedQueries?: string[];
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: SearchSource[];
  isLoading?: boolean;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  createdAt: number;
  lastChecked?: number;
}

export interface PriceData {
  symbol: string;
  price: number;
}

// Replaced simple MarketSentiment with sophisticated OmegaMetrics
export interface OmegaComponent {
  value: number; // 0-100
  label: string; // e.g., "High Divergence"
  desc: string; // e.g., "Price decoupling from volume"
}

export interface OmegaMetrics {
  omeiScore: number; // -100 to 100
  omeiLabel: string; // e.g., "System Unstable", "Equilibrium", "Deep Value"
  deltaJ: {
    trend: 'SPIKING' | 'RISING' | 'NEUTRAL' | 'FALLING' | 'COLLAPSING';
    prediction: string; // e.g., "Volatility Shock Imminent"
    isOmegaPoint: boolean; // The special bottom signal
  };
  components: {
    d_kl: OmegaComponent;        // Narrative Divergence
    volatility: OmegaComponent;  // Energy Cost (S/h)
    liquidity: OmegaComponent;   // Liquidity Stress
    awareness: OmegaComponent;   // Market Coherence (A)
  };
}

export interface TradeSetup {
  symbol: string;
  name: string;
  direction: 'LONG' | 'SHORT';
  confidence: number;
  timeframe: string;
  entry: string;
  target: string;
  stopLoss: string;
  catalyst: string;
  prediction: string;
  physicsRationale: string; // Specific rationale based on Delta J (e.g., "D_KL collapse")
  // New simplified fields for beginners
  simplifiedAnalysis: {
    action: 'STRONG BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG SELL';
    score: number; // 0-100 Simple Probability
    humanReason: string; // "Whales are buying, safe to enter"
  };
}

export interface IntelligenceEvent {
  time: string;
  type: 'WHALE' | 'NEWS' | 'ON-CHAIN' | 'EXCHANGE' | 'OMEGA_SIGNAL';
  message: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface MarketOverview {
  omegaMetrics: OmegaMetrics;
  topOpportunities: TradeSetup[];
  liveFeed: IntelligenceEvent[];
  marketDrivers: string[];
  timestamp: number;
}

// --- Portfolio Types ---

export interface PortfolioPosition {
  symbol: string;
  quantity: number;
  averageEntryPrice: number;
}

export interface PortfolioTransaction {
  id: string;
  type: 'BUY' | 'SELL';
  symbol: string;
  quantity: number;
  price: number;
  total: number;
  timestamp: number;
}

export interface UserPortfolio {
  cash: number;
  positions: PortfolioPosition[];
  transactions: PortfolioTransaction[];
}
