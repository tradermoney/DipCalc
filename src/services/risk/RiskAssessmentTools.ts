export class RiskAssessmentTools {
  /**
   * 计算凯利公式建议仓位
   */
  static calculateKellyPosition(
    winRate: number,
    averageWin: number,
    averageLoss: number
  ): number {
    if (averageLoss <= 0) return 0;
    
    const winLossRatio = averageWin / averageLoss;
    const kellyPercentage = (winRate * winLossRatio - (1 - winRate)) / winLossRatio;
    
    // 限制在合理范围内
    return Math.max(0, Math.min(0.25, kellyPercentage));
  }

  /**
   * 计算最优f值（最优固定分数）
   */
  static calculateOptimalF(returns: number[]): number {
    if (returns.length === 0) return 0;
    
    let maxTWR = 0;
    let optimalF = 0;
    
    // 测试不同的f值
    for (let f = 0.01; f <= 0.5; f += 0.01) {
      let twr = 1; // Terminal Wealth Relative
      
      for (const ret of returns) {
        const hpr = 1 + (ret * f); // Holding Period Return
        twr *= Math.max(0.01, hpr); // 防止破产
      }
      
      if (twr > maxTWR) {
        maxTWR = twr;
        optimalF = f;
      }
    }
    
    return optimalF;
  }

  /**
   * 计算风险调整收益率
   */
  static calculateRiskAdjustedReturn(
    totalReturn: number,
    volatility: number,
    maxDrawdown: number,
    riskFreeRate: number = 0
  ): {
    sharpeRatio: number;
    calmarRatio: number;
    sortinoRatio: number;
  } {
    const excessReturn = totalReturn - riskFreeRate;
    
    // 夏普比率
    const sharpeRatio = volatility > 0 ? excessReturn / volatility : 0;
    
    // 卡尔马比率
    const calmarRatio = maxDrawdown > 0 ? totalReturn / maxDrawdown : 0;
    
    // 索提诺比率（使用下行波动率）
    const sortinoRatio = volatility > 0 ? excessReturn / volatility : 0; // 简化计算
    
    return {
      sharpeRatio,
      calmarRatio,
      sortinoRatio
    };
  }

  /**
   * 计算相关性矩阵
   */
  static calculateCorrelationMatrix(
    returns1: number[],
    returns2: number[]
  ): number {
    if (returns1.length !== returns2.length || returns1.length === 0) {
      return 0;
    }
    
    const mean1 = returns1.reduce((sum, r) => sum + r, 0) / returns1.length;
    const mean2 = returns2.reduce((sum, r) => sum + r, 0) / returns2.length;
    
    let numerator = 0;
    let sum1Sq = 0;
    let sum2Sq = 0;
    
    for (let i = 0; i < returns1.length; i++) {
      const diff1 = returns1[i] - mean1;
      const diff2 = returns2[i] - mean2;
      
      numerator += diff1 * diff2;
      sum1Sq += diff1 * diff1;
      sum2Sq += diff2 * diff2;
    }
    
    const denominator = Math.sqrt(sum1Sq * sum2Sq);
    return denominator > 0 ? numerator / denominator : 0;
  }

  /**
   * 计算贝塔系数
   */
  static calculateBeta(
    assetReturns: number[],
    marketReturns: number[]
  ): number {
    if (assetReturns.length !== marketReturns.length || assetReturns.length === 0) {
      return 1;
    }
    
    const marketMean = marketReturns.reduce((sum, r) => sum + r, 0) / marketReturns.length;
    const assetMean = assetReturns.reduce((sum, r) => sum + r, 0) / assetReturns.length;
    
    let covariance = 0;
    let marketVariance = 0;
    
    for (let i = 0; i < assetReturns.length; i++) {
      const marketDiff = marketReturns[i] - marketMean;
      const assetDiff = assetReturns[i] - assetMean;
      
      covariance += marketDiff * assetDiff;
      marketVariance += marketDiff * marketDiff;
    }
    
    return marketVariance > 0 ? covariance / marketVariance : 1;
  }

  /**
   * 计算信息比率
   */
  static calculateInformationRatio(
    portfolioReturns: number[],
    benchmarkReturns: number[]
  ): number {
    if (portfolioReturns.length !== benchmarkReturns.length || portfolioReturns.length === 0) {
      return 0;
    }
    
    const excessReturns = portfolioReturns.map((r, i) => r - benchmarkReturns[i]);
    const meanExcess = excessReturns.reduce((sum, r) => sum + r, 0) / excessReturns.length;
    
    const trackingError = Math.sqrt(
      excessReturns.reduce((sum, r) => sum + Math.pow(r - meanExcess, 2), 0) / excessReturns.length
    );
    
    return trackingError > 0 ? meanExcess / trackingError : 0;
  }
}