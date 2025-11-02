import { 
  RSIParams, 
  CalculationResult, 
  CalculationLevel 
} from '../../types';

export class RSICalculator {
  /**
   * 计算RSI超卖批次策略
   * @param params 策略参数
   * @param currentPrice 当前价格（可选）
   * @param currentRSI 当前RSI值（可选）
   * @returns 计算结果
   */
  static calculate(params: RSIParams, currentPrice?: number, currentRSI?: number): CalculationResult {
    const { rsiThreshold, priceStep, maxLevels, totalCapital } = params;
    
    // 验证参数
    if (rsiThreshold <= 0 || rsiThreshold >= 100) {
      throw new Error('RSI阈值必须在0-100之间');
    }
    
    if (priceStep <= 0 || priceStep > 50) {
      throw new Error('价格步长必须在0-50%之间');
    }
    
    if (maxLevels <= 0) {
      throw new Error('最大档数必须大于0');
    }
    
    if (totalCapital <= 0) {
      throw new Error('总本金必须大于0');
    }

    // 假设起始价格（如果没有提供当前价格，使用一个默认值）
    const basePrice = currentPrice || 50000;
    
    // 计算每档投入金额（平均分配）
    const amountPerLevel = totalCapital / maxLevels;
    
    const levels: CalculationLevel[] = [];
    let totalInvested = 0;
    let totalHoldings = 0;
    let rsiConditionMet = false;
    
    // 检查RSI条件
    if (currentRSI !== undefined) {
      rsiConditionMet = currentRSI < rsiThreshold;
    }
    
    // 计算每个档位
    for (let i = 1; i <= maxLevels; i++) {
      const triggerPrice = basePrice * (1 - (i * priceStep) / 100);
      const investAmount = amountPerLevel;
      const holdings = investAmount / triggerPrice;
      
      // 判断是否已触发
      // 第一档需要满足RSI条件，后续档位只需要价格条件
      let triggered = false;
      if (currentPrice && currentRSI !== undefined) {
        if (i === 1) {
          // 第一档：需要RSI < 阈值 且 价格 <= 触发价格
          triggered = rsiConditionMet && currentPrice <= triggerPrice;
        } else {
          // 后续档位：需要第一档已触发 且 价格 <= 触发价格
          const firstLevelTriggered = levels.length > 0 && levels[0].triggered;
          triggered = firstLevelTriggered && currentPrice <= triggerPrice;
        }
      }
      
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
        triggered
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
      
      // 计算最大回撤（相对于投入资金）
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
      maxDrawdown
    };
    
    return result;
  }
  
  /**
   * 计算RSI指标（简化版本）
   * @param prices 价格数组（最近14个价格）
   * @returns RSI值
   */
  static calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) {
      throw new Error(`需要至少${period + 1}个价格数据来计算RSI`);
    }
    
    const gains: number[] = [];
    const losses: number[] = [];
    
    // 计算价格变化
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    // 计算平均收益和平均损失
    const avgGain = gains.slice(-period).reduce((sum, gain) => sum + gain, 0) / period;
    const avgLoss = losses.slice(-period).reduce((sum, loss) => sum + loss, 0) / period;
    
    // 计算RSI
    if (avgLoss === 0) {
      return 100; // 没有损失，RSI为100
    }
    
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    return Math.round(rsi * 100) / 100;
  }
  
  /**
   * 获取RSI策略状态
   * @param params 策略参数
   * @param currentRSI 当前RSI值
   * @param currentPrice 当前价格
   * @returns 策略状态信息
   */
  static getStrategyStatus(params: RSIParams, currentRSI: number, currentPrice?: number) {
    const { rsiThreshold } = params;
    
    const rsiConditionMet = currentRSI < rsiThreshold;
    const rsiDistance = currentRSI - rsiThreshold;
    
    let status: 'waiting' | 'ready' | 'active' | 'oversold';
    let message: string;
    
    if (currentRSI > 70) {
      status = 'waiting';
      message = '市场超买，等待RSI回落';
    } else if (currentRSI > rsiThreshold) {
      status = 'waiting';
      message = `RSI需要下降${rsiDistance.toFixed(1)}点才能开始抄底`;
    } else if (currentRSI < 20) {
      status = 'oversold';
      message = '市场极度超卖，建议谨慎操作';
    } else {
      status = rsiConditionMet ? 'ready' : 'waiting';
      message = rsiConditionMet ? 'RSI条件满足，可以开始抄底' : '等待RSI超卖信号';
    }
    
    return {
      status,
      message,
      rsiConditionMet,
      rsiDistance: Math.abs(rsiDistance),
      rsiLevel: this.getRSILevel(currentRSI)
    };
  }
  
  /**
   * 获取RSI水平描述
   * @param rsi RSI值
   * @returns RSI水平描述
   */
  private static getRSILevel(rsi: number): string {
    if (rsi >= 80) return '极度超买';
    if (rsi >= 70) return '超买';
    if (rsi >= 50) return '中性偏强';
    if (rsi >= 30) return '中性偏弱';
    if (rsi >= 20) return '超卖';
    return '极度超卖';
  }
  
  /**
   * 生成RSI策略建议
   * @param params 策略参数
   * @param currentRSI 当前RSI值
   * @returns 建议列表
   */
  static generateRecommendations(params: RSIParams, currentRSI: number): string[] {
    const recommendations: string[] = [];
    const { rsiThreshold } = params;
    
    if (currentRSI > 70) {
      recommendations.push('📈 当前RSI超买，建议等待回调');
      recommendations.push('⏰ 可以准备资金，等待RSI下降到超卖区域');
    } else if (currentRSI > rsiThreshold) {
      recommendations.push(`📊 RSI还需下降${(currentRSI - rsiThreshold).toFixed(1)}点才能触发策略`);
      recommendations.push('👀 密切关注RSI变化，准备执行策略');
    } else if (currentRSI < 20) {
      recommendations.push('⚠️ RSI极度超卖，市场可能出现技术性反弹');
      recommendations.push('💡 建议分批建仓，避免一次性投入过多');
    } else {
      recommendations.push('✅ RSI条件满足，可以开始执行抄底策略');
      recommendations.push('📋 按照预设档位逐步建仓');
    }
    
    // 通用建议
    if (params.maxLevels > 8) {
      recommendations.push('📊 档数较多，建议关注资金管理');
    }
    
    if (params.priceStep < 3) {
      recommendations.push('⚡ 价格步长较小，适合震荡行情');
    } else if (params.priceStep > 8) {
      recommendations.push('📉 价格步长较大，适合趋势性下跌');
    }
    
    return recommendations;
  }
  
  /**
   * 验证策略参数
   * @param params 策略参数
   * @returns 验证结果
   */
  static validateParams(params: Partial<RSIParams>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!params.rsiThreshold || params.rsiThreshold <= 0 || params.rsiThreshold >= 100) {
      errors.push('RSI阈值必须在0-100之间');
    }
    
    if (params.rsiThreshold && params.rsiThreshold > 50) {
      errors.push('RSI阈值建议设置在50以下，以确保在超卖区域买入');
    }
    
    if (!params.priceStep || params.priceStep <= 0 || params.priceStep > 50) {
      errors.push('价格步长必须在0-50%之间');
    }
    
    if (!params.maxLevels || params.maxLevels <= 0 || params.maxLevels > 20) {
      errors.push('最大档数必须在1-20之间');
    }
    
    if (!params.totalCapital || params.totalCapital <= 0) {
      errors.push('总本金必须大于0');
    }
    
    // 检查参数组合的合理性
    if (params.priceStep && params.maxLevels) {
      const totalDrop = params.priceStep * params.maxLevels;
      if (totalDrop > 80) {
        errors.push('总跌幅过大（超过80%），建议减少档数或降低步长');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}