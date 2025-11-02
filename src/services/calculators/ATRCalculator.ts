import { 
  ATRParams, 
  CalculationResult, 
  CalculationLevel 
} from '../../types';

export class ATRCalculator {
  /**
   * 计算动态阶梯策略
   * @param params 策略参数
   * @param currentPrice 当前价格（可选）
   * @param priceHistory 价格历史数据（用于计算ATR）
   * @returns 计算结果
   */
  static calculate(
    params: ATRParams, 
    currentPrice?: number, 
    priceHistory?: number[]
  ): CalculationResult {
    const { baseStep, atrMultiplier, maxLevels, totalCapital, atrPeriod } = params;
    
    // 验证参数
    if (baseStep <= 0 || baseStep > 50) {
      throw new Error('基础步长必须在0-50%之间');
    }
    
    if (atrMultiplier <= 0 || atrMultiplier > 10) {
      throw new Error('ATR倍数必须在0-10之间');
    }
    
    if (maxLevels <= 0) {
      throw new Error('最大档数必须大于0');
    }
    
    if (totalCapital <= 0) {
      throw new Error('总本金必须大于0');
    }

    // 假设起始价格
    const basePrice = currentPrice || 50000;
    
    // 计算ATR值
    let atrValue = 0;
    if (priceHistory && priceHistory.length >= (atrPeriod || 14)) {
      atrValue = this.calculateATR(priceHistory, atrPeriod || 14);
    } else {
      // 如果没有历史数据，使用基础价格的一个百分比作为ATR估值
      atrValue = basePrice * 0.05; // 假设5%的波动率
    }
    
    // 计算每档投入金额（平均分配）
    const amountPerLevel = totalCapital / maxLevels;
    
    const levels: CalculationLevel[] = [];
    let totalInvested = 0;
    let totalHoldings = 0;
    
    // 计算每个档位
    for (let i = 1; i <= maxLevels; i++) {
      // 动态计算档位间距：基础步长 + ATR调整
      const atrAdjustment = (atrValue / basePrice) * atrMultiplier;
      const dynamicStep = baseStep + (atrAdjustment * 100); // 转换为百分比
      
      const triggerPrice = basePrice * (1 - (i * dynamicStep) / 100);
      const investAmount = amountPerLevel;
      const holdings = investAmount / triggerPrice;
      
      // 判断是否已触发
      const triggered = currentPrice ? currentPrice <= triggerPrice : false;
      
      if (triggered) {
        totalInvested += investAmount;
        totalHoldings += holdings;
      }
      
      const level: CalculationLevel = {
        level: i,
        triggerPrice,
        investAmount,
        holdings,
        cumulativeInvested: triggered ? totalInvested : 0,
        cumulativeHoldings: triggered ? totalHoldings : 0,
        averageCost: triggered && totalHoldings > 0 ? totalInvested / totalHoldings : 0,
        triggered,
        // 添加动态步长信息
        dynamicStep
      };
      
      levels.push(level);
    }
    
    // 计算平均成本
    const averagePrice = totalHoldings > 0 ? totalInvested / totalHoldings : 0;
    const remainingCash = totalCapital - totalInvested;
    
    // 计算未实现盈亏
    let unrealizedPnL = 0;
    let maxDrawdown = 0;
    
    if (currentPrice && totalHoldings > 0) {
      const currentValue = totalHoldings * currentPrice;
      unrealizedPnL = currentValue - totalInvested;
      
      if (totalInvested > 0) {
        maxDrawdown = Math.min(0, unrealizedPnL / totalInvested);
      }
    }
    
    const result: CalculationResult = {
      id: `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      strategyId: params.id,
      strategyName: params.name,
      strategyType: params.type,
      calculatedAt: new Date(),
      levels,
      totalInvested,
      averagePrice,
      totalHoldings,
      remainingCapital: remainingCash,
      currentPriceAnalysis: currentPrice && totalHoldings > 0 ? {
        currentPrice,
        unrealizedPnL,
        unrealizedPnLPercentage: totalInvested > 0 ? unrealizedPnL / totalInvested : 0
      } : undefined,
      maxDrawdown,
      // 添加ATR相关信息
      atrValue,
      volatilityLevel: this.getVolatilityLevel(atrValue, basePrice)
    };
    
    return result;
  }
  
  /**
   * 计算ATR（平均真实波幅）
   * @param prices 价格数组 [high, low, close, high, low, close, ...]
   * @param period ATR周期
   * @returns ATR值
   */
  static calculateATR(prices: number[], period: number = 14): number {
    if (prices.length < period * 3) {
      throw new Error(`需要至少${period * 3}个价格数据来计算ATR`);
    }
    
    const trueRanges: number[] = [];
    
    // 计算真实波幅
    for (let i = 3; i < prices.length; i += 3) {
      const high = prices[i];
      const low = prices[i + 1];
      const prevClose = prices[i - 1]; // 前一个收盘价
      
      const tr1 = high - low;
      const tr2 = Math.abs(high - prevClose);
      const tr3 = Math.abs(low - prevClose);
      
      const trueRange = Math.max(tr1, tr2, tr3);
      trueRanges.push(trueRange);
    }
    
    // 计算ATR（简单移动平均）
    const recentTRs = trueRanges.slice(-period);
    const atr = recentTRs.reduce((sum, tr) => sum + tr, 0) / recentTRs.length;
    
    return atr;
  }
  
  /**
   * 获取波动率水平描述
   * @param atr ATR值
   * @param price 当前价格
   * @returns 波动率水平
   */
  private static getVolatilityLevel(atr: number, price: number): string {
    const volatilityRatio = atr / price;
    
    if (volatilityRatio >= 0.1) return '极高波动';
    if (volatilityRatio >= 0.07) return '高波动';
    if (volatilityRatio >= 0.05) return '中等波动';
    if (volatilityRatio >= 0.03) return '低波动';
    return '极低波动';
  }
  
  /**
   * 计算动态策略统计信息
   * @param params 策略参数
   * @param atrValue ATR值
   * @returns 统计信息
   */
  static calculateStatistics(params: ATRParams, atrValue: number) {
    const { baseStep, atrMultiplier, maxLevels } = params;
    
    // 计算平均档位间距
    const basePrice = 50000; // 假设价格
    const atrAdjustment = (atrValue / basePrice) * atrMultiplier;
    const averageStep = baseStep + (atrAdjustment * 100);
    
    // 计算总跌幅范围
    const totalDropRange = averageStep * maxLevels;
    
    // 风险评估
    let riskLevel: 'low' | 'medium' | 'high' | 'extreme';
    if (totalDropRange <= 40) {
      riskLevel = 'low';
    } else if (totalDropRange <= 60) {
      riskLevel = 'medium';
    } else if (totalDropRange <= 80) {
      riskLevel = 'high';
    } else {
      riskLevel = 'extreme';
    }
    
    // 适应性评分（ATR倍数越高，适应性越强）
    const adaptabilityScore = Math.min(100, atrMultiplier * 20);
    
    return {
      averageStep,
      totalDropRange,
      riskLevel,
      adaptabilityScore,
      volatilityAdjustment: atrAdjustment * 100,
      recommendations: this.generateRecommendations(params, riskLevel, atrValue)
    };
  }
  
  /**
   * 生成策略建议
   * @param params 策略参数
   * @param riskLevel 风险等级
   * @param atrValue ATR值
   * @returns 建议列表
   */
  private static generateRecommendations(
    params: ATRParams, 
    riskLevel: string, 
    atrValue: number
  ): string[] {
    const recommendations: string[] = [];
    const { baseStep, atrMultiplier, maxLevels } = params;
    
    // 风险建议
    if (riskLevel === 'extreme') {
      recommendations.push('⚠️ 极高风险：总跌幅范围过大，建议减少档数或降低步长');
    } else if (riskLevel === 'high') {
      recommendations.push('⚠️ 高风险：建议密切关注市场波动');
    } else if (riskLevel === 'medium') {
      recommendations.push('✅ 中等风险：策略相对合理');
    } else {
      recommendations.push('✅ 低风险：策略较为保守');
    }
    
    // ATR倍数建议
    if (atrMultiplier > 3) {
      recommendations.push('📊 ATR倍数较高，档位间距变化较大，适合高波动市场');
    } else if (atrMultiplier < 1) {
      recommendations.push('📈 ATR倍数较低，档位间距相对固定，适合低波动市场');
    }
    
    // 基础步长建议
    if (baseStep > 8) {
      recommendations.push('📉 基础步长较大，适合趋势性下跌');
    } else if (baseStep < 3) {
      recommendations.push('⚡ 基础步长较小，适合震荡行情');
    }
    
    // 档数建议
    if (maxLevels > 15) {
      recommendations.push('📊 档数较多，建议评估长期持有能力');
    }
    
    // 波动率建议
    const basePrice = 50000;
    const volatilityRatio = atrValue / basePrice;
    if (volatilityRatio > 0.07) {
      recommendations.push('🌊 当前市场波动较大，动态调整效果更明显');
    } else {
      recommendations.push('📊 当前市场波动较小，可考虑提高ATR倍数');
    }
    
    return recommendations;
  }
  
  /**
   * 验证策略参数
   * @param params 策略参数
   * @returns 验证结果
   */
  static validateParams(params: Partial<ATRParams>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!params.baseStep || params.baseStep <= 0 || params.baseStep > 50) {
      errors.push('基础步长必须在0-50%之间');
    }
    
    if (!params.atrMultiplier || params.atrMultiplier <= 0 || params.atrMultiplier > 10) {
      errors.push('ATR倍数必须在0-10之间');
    }
    
    if (!params.maxLevels || params.maxLevels <= 0 || params.maxLevels > 20) {
      errors.push('最大档数必须在1-20之间');
    }
    
    if (!params.totalCapital || params.totalCapital <= 0) {
      errors.push('总本金必须大于0');
    }
    
    if (params.atrPeriod && (params.atrPeriod < 5 || params.atrPeriod > 50)) {
      errors.push('ATR周期必须在5-50之间');
    }
    
    // 检查参数组合的合理性
    if (params.baseStep && params.atrMultiplier && params.maxLevels) {
      // 假设最大ATR调整为基础步长的50%
      const maxStep = params.baseStep + (params.baseStep * 0.5 * params.atrMultiplier);
      const maxTotalDrop = maxStep * params.maxLevels;
      
      if (maxTotalDrop > 90) {
        errors.push('在高波动情况下总跌幅可能超过90%，建议调整参数');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}