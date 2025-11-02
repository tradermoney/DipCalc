// 数据库配置
export const DB_CONFIG = {
  name: 'DipCalcDB',
  version: 2, // 增加版本号以支持新存储
  stores: {
    strategies: 'strategies',
    calculations: 'calculations',
    settings: 'settings',
    history: 'history',
    drafts: 'drafts' // 新增：用于存储临时输入和草稿
  }
};

// 策略类型枚举
export enum StrategyType {
  GRID_DIP = 'grid_dip',
  PYRAMID = 'pyramid',
  RSI = 'rsi',
  DCA = 'dca',
  ATR = 'atr',
  PNL = 'pnl'
}

// 现有持仓信息接口
export interface ExistingPosition {
  holdings: number;        // 已持有数量
  averageCost: number;     // 平均成本
  totalInvested: number;   // 已投入资金
}

// 基础策略参数接口
export interface BaseStrategyParams {
  id: string;
  name: string;
  type: StrategyType;
  createdAt: Date;
  updatedAt: Date;
  // 补仓模式支持
  isAddPosition?: boolean;           // 是否为补仓模式
  existingPosition?: ExistingPosition; // 现有持仓信息
}

// 等距分批策略参数
export interface GridDipParams extends BaseStrategyParams {
  type: StrategyType.GRID_DIP;
  lowerBound: number;    // 区间下限
  upperBound: number;    // 区间上限
  gridCount: number;     // 网格数量
  totalCapital: number;  // 总本金
  amountPerGrid?: number; // 每格金额（可选，会自动计算）
  stepMode: 'absolute' | 'percentage'; // 步长模式：绝对值或百分比
  stepValue?: number;    // 步长值（百分比模式下使用）
  basePrice?: number;    // 基准价格（百分比模式下使用）
}

// 金字塔策略参数
export interface PyramidParams extends BaseStrategyParams {
  type: StrategyType.PYRAMID;
  initialPosition: number;  // 起始仓位百分比
  multiplier: number;       // 加仓倍率
  maxLevels: number;        // 最大加仓次数
  priceStep: number;        // 价格跌幅步长
  stepMode: 'absolute' | 'percentage'; // 步长模式：绝对值或百分比
  totalCapital: number;     // 总本金
  basePrice?: number;       // 基准价格（百分比模式下使用）
}

// RSI策略参数
export interface RSIParams extends BaseStrategyParams {
  type: StrategyType.RSI;
  rsiThreshold: number;     // RSI阈值
  priceStep: number;        // 价格步长
  stepMode: 'absolute' | 'percentage'; // 步长模式：绝对值或百分比
  maxLevels: number;        // 最大档数
  totalCapital: number;     // 总本金
  basePrice?: number;       // 基准价格（百分比模式下使用）
}

// 定投策略参数
export interface DCAParams extends BaseStrategyParams {
  type: StrategyType.DCA;
  fixedAmount: number;      // 定投金额
  interval: string | number; // 定投间隔（'weekly', 'monthly' 或天数）
  maxPeriods: number;       // 最大期数
  startPrice: number;       // 起始价格
  totalCapital: number;     // 总本金
  amountMode?: 'fixed' | 'percentage'; // 金额模式：固定金额或按百分比
  percentageAmount?: number; // 百分比金额（总资金的百分比）
}

// ATR策略参数
export interface ATRParams extends BaseStrategyParams {
  type: StrategyType.ATR;
  baseStep: number;         // 基础步长
  stepMode: 'absolute' | 'percentage'; // 步长模式：绝对值或百分比
  atrMultiplier: number;    // ATR倍数
  atrPeriod: number;        // ATR周期
  maxLevels: number;        // 最大档数
  totalCapital: number;     // 总本金
  leverageRatio?: number;   // 杠杆倍数（可选）
  basePrice?: number;       // 基准价格（百分比模式下使用）
}

// 资金费率策略参数
// 单个现货交易记录
export interface SpotTrade {
  id: string;
  type: 'BUY' | 'SELL';
  price: number;
  amount: number;
  feeRate: number;
  timestamp: Date;
  enabled: boolean;
}

// PnL计算器参数 - 支持多仓位
export interface PnLParams extends BaseStrategyParams {
  type: StrategyType.PNL;
  symbol: string;           // 交易对符号，如 BTC/USDT
  trades: SpotTrade[];      // 多次交易记录
  currentPrice: number;     // 当前价格
}

// PnL计算结果
export interface PnLCalculationResult {
  totalInvested: number;        // 总投入资金
  totalFees: number;            // 总手续费
  holdings: number;             // 持仓数量
  currentValue: number;         // 当前市值
  unrealizedPnL: number;        // 未实现盈亏
  unrealizedPnLPercentage: number; // 未实现盈亏百分比
  realizedPnL: number;          // 已实现盈亏（如果填写了卖出信息）
  realizedPnLPercentage: number; // 已实现盈亏百分比（如果填写了卖出信息）
  breakEvenPrice: number;       // 盈亏平衡价格
  roi: number;                  // 投资回报率
  riskRewardRatio?: number;     // 风险回报比
}

// 联合策略参数类型
export type StrategyParams =
  | GridDipParams
  | PyramidParams
  | RSIParams
  | DCAParams
  | ATRParams
  | PnLParams;

// 计算结果接口
export interface CalculationResult {
  id: string;
  strategyId?: string;
  strategyName?: string;       // 策略名称
  strategyType: StrategyType;  // 策略类型
  calculatedAt: Date;
  levels: CalculationLevel[];
  totalInvested: number;
  averagePrice: number;
  totalHoldings: number;
  remainingCapital: number;    // 修正字段名
  currentPriceAnalysis?: {     // 当前价格分析
    currentPrice: number;
    unrealizedPnL: number;
    unrealizedPnLPercentage: number;
  };
  maxDrawdown?: number;
  // 补仓模式相关字段
  isAddPosition?: boolean;
  existingPosition?: ExistingPosition;
  newInvested?: number;        // 新增投入资金
  newHoldings?: number;        // 新增持仓数量
  originalAverageCost?: number; // 原始平均成本
  // ATR相关字段
  atrValue?: number;
  volatilityLevel?: string;
  // 资金费率相关字段
  currentFundingRate?: number;
  fundingPnL?: number;
  leverageRatio?: number;
}

// 单个档位计算结果
export interface CalculationLevel {
  level: number;
  triggerPrice: number;
  investAmount: number;
  holdings: number;
  cumulativeInvested: number;
  cumulativeHoldings: number;
  averageCost: number;
  triggered: boolean;
  // 动态字段
  dynamicStep?: number;
  leverageRatio?: number;
  leveragedAmount?: number;
  // RSI相关字段
  rsiThreshold?: number;
  // 金字塔相关字段
  investmentRatio?: number;
  // DCA相关字段
  investmentDate?: Date;
}

// 用户设置接口
export interface UserSettings {
  id: string;
  theme: 'light' | 'dark';
  currency: string;
  precision: number;
  autoSave: boolean;
  notifications: boolean;
}

// 历史记录接口
export interface HistoryRecord {
  id: string;
  strategyId: string;
  action: 'create' | 'update' | 'delete' | 'calculate';
  timestamp: Date;
  data: any;
}

// 临时输入/草稿接口 - 用于自动保存用户输入
export interface DraftInput {
  id: string;                    // 唯一标识，建议使用页面路径如 'pnl-calculator'
  pagePath: string;              // 页面路径，用于区分不同页面
  data: any;                     // 保存的数据（可以是任何结构）
  inputValues?: Record<string, string>; // 输入框的字符串值（防抖编辑用）
  createdAt: Date;               // 创建时间
  updatedAt: Date;               // 最后更新时间
  version: number;               // 版本号，用于迁移
}