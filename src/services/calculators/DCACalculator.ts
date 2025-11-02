import { 
  DCAParams, 
  CalculationResult, 
  CalculationLevel 
} from '../../types';

export class DCACalculator {
  /**
   * 计算定投式抄底策略
   * @param params 策略参数
   * @param currentPrice 当前价格（可选）
   * @returns 计算结果
   */
  static calculate(params: DCAParams, currentPrice?: number): CalculationResult {
    const { fixedAmount, maxPeriods, totalCapital, startPrice, amountMode = 'fixed', percentageAmount } = params;
    
    // 计算实际投入金额
    let actualAmount: number;
    if (amountMode === 'percentage') {
      if (!percentageAmount || percentageAmount <= 0) {
        throw new Error('百分比金额必须大于0');
      }
      actualAmount = (totalCapital * percentageAmount) / 100;
    } else {
      actualAmount = fixedAmount;
    }
    
    // 验证参数
    if (actualAmount <= 0) {
      throw new Error('定投金额必须大于0');
    }
    
    if (maxPeriods <= 0) {
      throw new Error('定投期数必须大于0');
    }
    
    if (totalCapital <= 0) {
      throw new Error('总本金必须大于0');
    }
    
    if (startPrice && startPrice <= 0) {
      throw new Error('起始价格必须大于0');
    }

    // 检查资金是否足够
    const totalRequired = actualAmount * maxPeriods;
    if (totalRequired > totalCapital) {
      throw new Error(`资金不足：需要${totalRequired}，可用${totalCapital}`);
    }

    // 使用起始价格或当前价格作为基准
    const basePrice = startPrice || currentPrice || 50000;
    
    const levels: CalculationLevel[] = [];
    let totalInvested = 0;
    let totalHoldings = 0;
    
    // 计算每个定投期
    for (let i = 1; i <= maxPeriods; i++) {
      // 模拟价格下跌：每期下跌一定比例
      const priceDeclineRate = 0.05; // 假设每期下跌5%
      const periodPrice = basePrice * Math.pow(1 - priceDeclineRate, i - 1);
      
      const investAmount = actualAmount;
      const holdings = investAmount / periodPrice;
      
      // 判断是否已触发（基于当前价格和期数）
      let triggered = false;
      if (currentPrice !== undefined) {
        // 如果当前价格低于或等于该期的价格，则认为已触发
        triggered = currentPrice <= periodPrice;
      }
      
      if (triggered) {
        totalInvested += investAmount;
        totalHoldings += holdings;
      }
      
      const level: CalculationLevel = {
        level: i,
        triggerPrice: periodPrice,
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
   * 计算定投策略的统计信息
   * @param params 策略参数
   * @returns 统计信息
   */
  static calculateStatistics(params: DCAParams) {
    const { fixedAmount, percentageAmount, amountMode, maxPeriods, totalCapital, startPrice } = params;
    
    const averageInvestment = amountMode === 'fixed' 
      ? fixedAmount 
      : (totalCapital * (percentageAmount || 0) / 100);
    
    const totalRequired = averageInvestment * maxPeriods;
    const capitalUtilization = totalRequired / totalCapital;
    
    // 计算预期平均成本（假设价格持续下跌）
    const basePrice = startPrice || 50000;
    const priceDeclineRate = 0.05;
    
    let totalCost = 0;
    let totalShares = 0;
    
    for (let i = 1; i <= maxPeriods; i++) {
      const periodPrice = basePrice * Math.pow(1 - priceDeclineRate, i - 1);
      const shares = averageInvestment / periodPrice;
      totalCost += averageInvestment;
      totalShares += shares;
    }
    
    const expectedAverageCost = totalShares > 0 ? totalCost / totalShares : 0;
    const costReduction = basePrice > 0 ? (basePrice - expectedAverageCost) / basePrice : 0;
    
    // 风险评估
    let riskLevel: string;
    if (capitalUtilization <= 0.5) {
      riskLevel = '低';
    } else if (capitalUtilization <= 0.8) {
      riskLevel = '中';
    } else {
      riskLevel = '高';
    }
    
    return {
      averageInvestment,
      expectedTotalInvestment: totalRequired,
      capitalUtilization,
      expectedAverageCost,
      costReduction,
      riskLevel,
      maxPossibleLoss: totalRequired, // 最大可能损失（全部投入）
      breakEvenPrice: expectedAverageCost // 盈亏平衡价格
    };
  }
  
  /**
   * 计算定投进度
   * @param params 策略参数
   * @param currentPeriod 当前期数
   * @returns 进度信息
   */
  static calculateProgress(params: DCAParams, currentPeriod: number) {
    const { fixedAmount, maxPeriods } = params;
    
    const completedPeriods = Math.min(currentPeriod, maxPeriods);
    const progress = completedPeriods / maxPeriods;
    const investedAmount = completedPeriods * fixedAmount;
    const remainingPeriods = Math.max(0, maxPeriods - completedPeriods);
    const remainingAmount = remainingPeriods * fixedAmount;
    
    return {
      completedPeriods,
      remainingPeriods,
      progress,
      investedAmount,
      remainingAmount,
      isCompleted: completedPeriods >= maxPeriods
    };
  }
  
  /**
   * 生成策略建议
   * @param params 策略参数
   * @param riskLevel 风险等级
   * @returns 建议列表
   */
  static generateRecommendations(params: DCAParams, riskLevel: string): string[] {
    const recommendations: string[] = [];
    const { fixedAmount, percentageAmount, amountMode, maxPeriods, totalCapital } = params;
    
    if (riskLevel === '高') {
      recommendations.push('⚠️ 高风险：资金利用率过高，建议降低定投金额');
      recommendations.push('💡 建议预留30%以上资金作为安全边际');
    } else if (riskLevel === '中') {
      recommendations.push('✅ 中等风险：策略相对合理，注意市场变化');
    } else {
      recommendations.push('✅ 低风险：策略较为保守，可考虑适当提高定投金额');
    }
    
    // 定投金额建议
    const averageAmount = amountMode === 'fixed' ? fixedAmount : (totalCapital * (percentageAmount || 0) / 100);
    const amountRatio = averageAmount / totalCapital;
    if (amountRatio > 0.2) {
      recommendations.push('📊 单次定投金额较大，建议分散投资风险');
    } else if (amountRatio < 0.05) {
      recommendations.push('💰 单次定投金额较小，可考虑适当增加');
    }
    
    // 期数建议
    if (maxPeriods > 20) {
      recommendations.push('⏰ 定投期数较多，建议评估长期执行能力');
    } else if (maxPeriods < 5) {
      recommendations.push('📈 定投期数较少，可能无法充分发挥平均成本效应');
    }
    
    // 通用建议
    recommendations.push('📋 建议严格按照计划执行，避免情绪化操作');
    recommendations.push('📊 定期评估策略效果，必要时调整参数');
    
    return recommendations;
  }
  
  /**
   * 计算最优定投金额
   * @param totalCapital 总资金
   * @param maxPeriods 最大期数
   * @param safetyMargin 安全边际（默认20%）
   * @returns 最优定投金额
   */
  static calculateOptimalAmount(
    totalCapital: number, 
    maxPeriods: number, 
    safetyMargin: number = 0.2
  ): number {
    const availableCapital = totalCapital * (1 - safetyMargin);
    const optimalAmount = availableCapital / maxPeriods;
    
    // 向下取整到合理的数值
    if (optimalAmount >= 1000) {
      return Math.floor(optimalAmount / 100) * 100;
    } else if (optimalAmount >= 100) {
      return Math.floor(optimalAmount / 10) * 10;
    } else {
      return Math.floor(optimalAmount);
    }
  }
  
  /**
   * 验证策略参数
   * @param params 策略参数
   * @returns 验证结果
   */
  static validateParams(params: Partial<DCAParams>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const amountMode = params.amountMode || 'fixed';
    
    // 验证投入金额
    if (amountMode === 'fixed') {
      if (!params.fixedAmount || params.fixedAmount <= 0) {
        errors.push('定投金额必须大于0');
      }
    } else if (amountMode === 'percentage') {
      if (!params.percentageAmount || params.percentageAmount <= 0) {
        errors.push('投入百分比必须大于0');
      }
      if (params.percentageAmount && params.percentageAmount > 50) {
        errors.push('单次投入百分比不建议超过50%');
      }
    }
    
    if (!params.maxPeriods || params.maxPeriods <= 0 || params.maxPeriods > 100) {
      errors.push('定投期数必须在1-100之间');
    }
    
    if (!params.totalCapital || params.totalCapital <= 0) {
      errors.push('总本金必须大于0');
    }
    
    if (params.startPrice && params.startPrice <= 0) {
      errors.push('起始价格必须大于0');
    }
    
    // 检查资金是否足够
    if (params.maxPeriods && params.totalCapital) {
      let actualAmount: number;
      if (amountMode === 'percentage' && params.percentageAmount) {
        actualAmount = (params.totalCapital * params.percentageAmount) / 100;
      } else if (params.fixedAmount) {
        actualAmount = params.fixedAmount;
      } else {
        return { valid: false, errors };
      }
      
      const totalRequired = actualAmount * params.maxPeriods;
      if (totalRequired > params.totalCapital) {
        errors.push(`资金不足：需要${totalRequired.toFixed(2)}，可用${params.totalCapital}`);
      }
      
      // 检查资金利用率
      const utilization = totalRequired / params.totalCapital;
      if (utilization > 0.9) {
        errors.push('资金利用率过高（超过90%），建议预留安全边际');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}