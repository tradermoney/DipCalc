import { CalculationResult } from '../../types';

export interface RiskMetrics {
  maxDrawdown: number;
  volatility: number;
  sharpeRatio: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
}

export class RiskMetricsCalculator {
  /**
   * 计算风险指标
   */
  static calculateRiskMetrics(results: CalculationResult[]): RiskMetrics {
    if (results.length === 0) {
      return {
        maxDrawdown: 0,
        volatility: 0,
        sharpeRatio: 0,
        winRate: 0,
        averageWin: 0,
        averageLoss: 0,
        profitFactor: 0,
        riskLevel: 'low'
      };
    }

    // 计算最大回撤
    const maxDrawdown = Math.max(...results.map(r => Math.abs(r.maxDrawdown || 0)));

    // 计算收益率序列
    const returns = results
      .filter(r => r.currentPriceAnalysis?.unrealizedPnL !== undefined && r.totalInvested > 0)
      .map(r => (r.currentPriceAnalysis?.unrealizedPnL || 0) / r.totalInvested);

    // 计算波动率
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance);

    // 计算夏普比率（假设无风险利率为0）
    const sharpeRatio = volatility > 0 ? avgReturn / volatility : 0;

    // 计算胜率和盈亏比
    const wins = returns.filter(r => r > 0);
    const losses = returns.filter(r => r < 0);
    const winRate = returns.length > 0 ? wins.length / returns.length : 0;
    const averageWin = wins.length > 0 ? wins.reduce((sum, w) => sum + w, 0) / wins.length : 0;
    const averageLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, l) => sum + l, 0) / losses.length) : 0;
    const profitFactor = averageLoss > 0 ? (averageWin * wins.length) / (averageLoss * losses.length) : 0;

    // 评估风险等级
    const riskLevel = this.assessRiskLevel(maxDrawdown, volatility);

    return {
      maxDrawdown,
      volatility,
      sharpeRatio,
      winRate,
      averageWin,
      averageLoss,
      profitFactor,
      riskLevel
    };
  }

  /**
   * 评估风险等级
   */
  private static assessRiskLevel(maxDrawdown: number, volatility: number): 'low' | 'medium' | 'high' | 'extreme' {
    if (maxDrawdown > 0.5 || volatility > 0.3) {
      return 'extreme';
    } else if (maxDrawdown > 0.3 || volatility > 0.2) {
      return 'high';
    } else if (maxDrawdown > 0.15 || volatility > 0.1) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * 计算VaR（风险价值）
   */
  static calculateVaR(returns: number[], confidence: number = 0.95): number {
    if (returns.length === 0) return 0;
    
    const sortedReturns = returns.sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * sortedReturns.length);
    return Math.abs(sortedReturns[index] || 0);
  }

  /**
   * 计算最大连续亏损
   */
  static calculateMaxConsecutiveLosses(returns: number[]): number {
    let maxConsecutive = 0;
    let currentConsecutive = 0;

    for (const ret of returns) {
      if (ret < 0) {
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 0;
      }
    }

    return maxConsecutive;
  }
}