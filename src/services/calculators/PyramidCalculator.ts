import { 
  PyramidParams, 
  CalculationResult, 
  CalculationLevel 
} from '../../types';

export class PyramidCalculator {
  /**
   * 计算金字塔加仓策略
   * @param params 策略参数
   * @param currentPrice 当前价格（可选）
   * @returns 计算结果
   */
  static calculate(params: PyramidParams, currentPrice?: number): CalculationResult {
    const { initialPosition, multiplier, maxLevels, priceStep, totalCapital, isAddPosition, existingPosition } = params;

    // 验证参数
    if (initialPosition <= 0 || initialPosition > 100) {
      throw new Error('起始仓位必须在0-100%之间');
    }

    if (multiplier <= 1) {
      throw new Error('加仓倍率必须大于1');
    }

    if (maxLevels <= 0) {
      throw new Error('最大加仓次数必须大于0');
    }

    if (priceStep <= 0 || priceStep > 50) {
      throw new Error('价格跌幅步长必须在0-50%之间');
    }

    if (totalCapital <= 0) {
      throw new Error('总本金必须大于0');
    }

    // 补仓模式验证
    if (isAddPosition) {
      if (!existingPosition) {
        throw new Error('补仓模式下必须提供现有持仓信息');
      }
      if (existingPosition.holdings < 0) {
        throw new Error('已持有数量不能为负数');
      }
      if (existingPosition.averageCost < 0) {
        throw new Error('平均成本不能为负数');
      }
      if (existingPosition.totalInvested < 0) {
        throw new Error('已投入资金不能为负数');
      }
    }

    // 计算初始投入金额
    const initialAmount = (totalCapital * initialPosition) / 100;
    
    // 假设起始价格（如果没有提供当前价格，使用一个默认值）
    const basePrice = currentPrice || 50000;
    
    const levels: CalculationLevel[] = [];
    let totalInvested = 0;
    let totalHoldings = 0;
    let remainingCapital = totalCapital;
    
    // 计算每个档位
    for (let i = 1; i <= maxLevels; i++) {
      const triggerPrice = basePrice * (1 - (i * priceStep) / 100);
      const investAmount = i === 1 ? initialAmount : initialAmount * Math.pow(multiplier, i - 1);
      
      // 检查是否有足够资金
      if (investAmount > remainingCapital) {
        // 资金不足，使用剩余资金
        const actualInvestAmount = remainingCapital;
        const holdings = actualInvestAmount / triggerPrice;
        
        // 判断是否已触发
        const triggered = currentPrice ? currentPrice <= triggerPrice : false;
        
        if (triggered) {
          totalInvested += actualInvestAmount;
          totalHoldings += holdings;
          remainingCapital -= actualInvestAmount;
        }
        
        const level: CalculationLevel = {
          level: i,
          triggerPrice,
          investAmount: actualInvestAmount,
          holdings,
          cumulativeInvested: triggered ? totalInvested : 0,
          cumulativeHoldings: triggered ? totalHoldings : 0,
          averageCost: triggered && totalHoldings > 0 ? totalInvested / totalHoldings : 0,
          triggered
        };
        
        levels.push(level);
        break; // 资金用完，停止计算
      }
      
      const holdings = investAmount / triggerPrice;
      
      // 判断是否已触发
      const triggered = currentPrice ? currentPrice <= triggerPrice : false;
      
      if (triggered) {
        totalInvested += investAmount;
        totalHoldings += holdings;
        remainingCapital -= investAmount;
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
    
    // 计算平均成本（仅新加仓部分）
    const averagePrice = totalHoldings > 0 ? totalInvested / totalHoldings : 0;
    const remainingCash = totalCapital - totalInvested;

    // 补仓模式：计算新增的持仓和投入
    let newHoldings = 0;
    let newInvested = 0;
    let originalAverageCost = 0;
    let finalTotalHoldings = totalHoldings;
    let finalTotalInvested = totalInvested;

    if (isAddPosition && existingPosition) {
      newHoldings = totalHoldings;
      newInvested = totalInvested;
      originalAverageCost = existingPosition.averageCost;
      finalTotalHoldings = totalHoldings + existingPosition.holdings;
      finalTotalInvested = totalInvested + existingPosition.totalInvested;
    }

    // 计算未实现盈亏
    let unrealizedPnL = 0;
    let maxDrawdown = 0;

    if (currentPrice && finalTotalHoldings > 0) {
      const currentValue = finalTotalHoldings * currentPrice;
      unrealizedPnL = currentValue - finalTotalInvested;

      // 计算最大回撤（相对于投入资金）
      if (finalTotalInvested > 0) {
        maxDrawdown = Math.min(0, unrealizedPnL / finalTotalInvested);
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
      currentPriceAnalysis: currentPrice && finalTotalHoldings > 0 ? {
        currentPrice,
        unrealizedPnL: finalTotalHoldings * currentPrice - finalTotalInvested,
        unrealizedPnLPercentage: finalTotalInvested > 0 ? ((finalTotalHoldings * currentPrice - finalTotalInvested) / finalTotalInvested) : 0
      } : undefined,
      maxDrawdown,
      // 补仓模式相关字段
      isAddPosition,
      existingPosition: isAddPosition ? existingPosition : undefined,
      newInvested,
      newHoldings,
      originalAverageCost
    };
    
    return result;
  }
  
  /**
   * 计算金字塔策略的风险评估
   * @param params 策略参数
   * @returns 风险评估信息
   */
  static calculateRiskAssessment(params: PyramidParams) {
    const { initialPosition, multiplier, maxLevels, totalCapital } = params;
    
    // 计算总投入金额（如果全部触发）
    const initialAmount = (totalCapital * initialPosition) / 100;
    let totalRequiredCapital = 0;
    
    for (let i = 1; i <= maxLevels; i++) {
      const investAmount = i === 1 ? initialAmount : initialAmount * Math.pow(multiplier, i - 1);
      totalRequiredCapital += investAmount;
    }
    
    // 计算资金利用率
    const capitalUtilization = Math.min(1, totalRequiredCapital / totalCapital);
    
    // 计算爆仓风险档位
    let bankruptcyLevel = maxLevels;
    let cumulativeInvestment = 0;
    
    for (let i = 1; i <= maxLevels; i++) {
      const investAmount = i === 1 ? initialAmount : initialAmount * Math.pow(multiplier, i - 1);
      cumulativeInvestment += investAmount;
      
      if (cumulativeInvestment > totalCapital) {
        bankruptcyLevel = i - 1;
        break;
      }
    }
    
    // 风险等级评估
    let riskLevel: 'low' | 'medium' | 'high' | 'extreme';
    if (capitalUtilization <= 0.5) {
      riskLevel = 'low';
    } else if (capitalUtilization <= 0.8) {
      riskLevel = 'medium';
    } else if (capitalUtilization <= 1) {
      riskLevel = 'high';
    } else {
      riskLevel = 'extreme';
    }
    
    return {
      totalRequiredCapital,
      capitalUtilization,
      bankruptcyLevel,
      riskLevel,
      maxSafeMultiplier: this.calculateMaxSafeMultiplier(params),
      recommendations: this.generateRecommendations(params, riskLevel)
    };
  }
  
  /**
   * 计算最大安全倍率
   * @param params 策略参数
   * @returns 最大安全倍率
   */
  private static calculateMaxSafeMultiplier(params: PyramidParams): number {
    const { initialPosition, maxLevels, totalCapital } = params;
    const initialAmount = (totalCapital * initialPosition) / 100;
    
    // 二分查找最大安全倍率
    let left = 1.1;
    let right = 5.0;
    let maxSafeMultiplier = 1.1;
    
    while (right - left > 0.01) {
      const mid = (left + right) / 2;
      let totalRequired = 0;
      
      for (let i = 1; i <= maxLevels; i++) {
        const investAmount = i === 1 ? initialAmount : initialAmount * Math.pow(mid, i - 1);
        totalRequired += investAmount;
      }
      
      if (totalRequired <= totalCapital * 0.9) { // 保留10%安全边际
        maxSafeMultiplier = mid;
        left = mid;
      } else {
        right = mid;
      }
    }
    
    return Math.round(maxSafeMultiplier * 100) / 100;
  }
  
  /**
   * 生成策略建议
   * @param params 策略参数
   * @param riskLevel 风险等级
   * @returns 建议列表
   */
  private static generateRecommendations(params: PyramidParams, riskLevel: string): string[] {
    const recommendations: string[] = [];
    
    if (riskLevel === 'extreme') {
      recommendations.push('⚠️ 极高风险：建议降低加仓倍率或减少最大档数');
      recommendations.push('💡 建议将加仓倍率控制在2.0以下');
    } else if (riskLevel === 'high') {
      recommendations.push('⚠️ 高风险：建议预留更多资金作为安全边际');
      recommendations.push('💡 考虑降低起始仓位比例');
    } else if (riskLevel === 'medium') {
      recommendations.push('✅ 中等风险：策略相对合理，注意市场波动');
    } else {
      recommendations.push('✅ 低风险：策略较为保守，可考虑适当提高收益');
    }
    
    if (params.multiplier > 3) {
      recommendations.push('📊 加仓倍率较高，建议关注资金管理');
    }
    
    if (params.maxLevels > 10) {
      recommendations.push('📈 档数较多，建议评估长期持有能力');
    }
    
    return recommendations;
  }
  
  /**
   * 验证策略参数
   * @param params 策略参数
   * @returns 验证结果
   */
  static validateParams(params: Partial<PyramidParams>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!params.initialPosition || params.initialPosition <= 0 || params.initialPosition > 100) {
      errors.push('起始仓位必须在0-100%之间');
    }
    
    if (!params.multiplier || params.multiplier <= 1 || params.multiplier > 10) {
      errors.push('加仓倍率必须在1-10之间');
    }
    
    if (!params.maxLevels || params.maxLevels <= 0 || params.maxLevels > 20) {
      errors.push('最大加仓次数必须在1-20之间');
    }
    
    if (!params.priceStep || params.priceStep <= 0 || params.priceStep > 50) {
      errors.push('价格跌幅步长必须在0-50%之间');
    }
    
    if (!params.totalCapital || params.totalCapital <= 0) {
      errors.push('总本金必须大于0');
    }
    
    // 检查资金是否足够
    if (params.initialPosition && params.multiplier && params.maxLevels && params.totalCapital) {
      const initialAmount = (params.totalCapital * params.initialPosition) / 100;
      let totalRequired = 0;
      
      for (let i = 1; i <= params.maxLevels; i++) {
        const investAmount = i === 1 ? initialAmount : initialAmount * Math.pow(params.multiplier, i - 1);
        totalRequired += investAmount;
      }
      
      if (totalRequired > params.totalCapital * 2) {
        errors.push('资金需求过高，建议降低加仓倍率或减少档数');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}