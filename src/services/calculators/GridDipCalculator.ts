import { 
  GridDipParams, 
  CalculationResult, 
  CalculationLevel 
} from '../../types';

export class GridDipCalculator {
  /**
   * 计算等距分批抄底策略
   * @param params 策略参数
   * @param currentPrice 当前价格（可选）
   * @returns 计算结果
   */
  static calculate(params: GridDipParams, currentPrice?: number): CalculationResult {
    const { lowerBound, upperBound, gridCount, totalCapital, stepMode = 'absolute', stepValue, basePrice, isAddPosition, existingPosition } = params;
    
    // 验证参数
    if (stepMode === 'absolute') {
      if (lowerBound >= upperBound) {
        throw new Error('下限价格必须小于上限价格');
      }
    } else if (stepMode === 'percentage') {
      if (!stepValue || stepValue <= 0) {
        throw new Error('百分比模式下步长值必须大于0');
      }
      if (!basePrice || basePrice <= 0) {
        throw new Error('百分比模式下基准价格必须大于0');
      }
    }
    
    if (gridCount <= 0) {
      throw new Error('网格数量必须大于0');
    }
    
    if (totalCapital <= 0) {
      throw new Error('总本金必须大于0');
    }

    // 验证补仓模式参数
    if (isAddPosition && existingPosition) {
      if (existingPosition.holdings <= 0) {
        throw new Error('现有持仓数量必须大于0');
      }
      if (existingPosition.averageCost <= 0) {
        throw new Error('现有平均成本必须大于0');
      }
      if (existingPosition.totalInvested <= 0) {
        throw new Error('现有投入资金必须大于0');
      }
    }

    // 计算每格价格间隔和投入金额
    let priceStep: number;
    if (stepMode === 'absolute') {
      priceStep = (upperBound - lowerBound) / gridCount;
    } else {
      // 百分比模式：每次下跌stepValue%
      priceStep = (basePrice! * stepValue!) / 100;
    }

    const amountPerGrid = totalCapital / gridCount;

    // 先计算所有档位的理论值（不依赖currentPrice触发）
    let theoreticalInvested = 0;
    let theoreticalHoldings = 0;

    for (let i = 1; i <= gridCount; i++) {
      let triggerPrice: number;

      if (stepMode === 'absolute') {
        triggerPrice = upperBound - (i * priceStep);
      } else {
        // 百分比模式：从基准价格开始，每次下跌stepValue%
        triggerPrice = basePrice! * Math.pow(1 - stepValue! / 100, i);
      }

      const investAmount = amountPerGrid;
      const holdings = investAmount / triggerPrice;

      theoreticalInvested += investAmount;
      theoreticalHoldings += holdings;
    }

    // 重新计算每个档位，记录实际触发状态和理论平均成本
    const levels: CalculationLevel[] = [];
    let newInvested = 0;
    let newHoldings = 0;

    for (let i = 1; i <= gridCount; i++) {
      let triggerPrice: number;

      if (stepMode === 'absolute') {
        triggerPrice = upperBound - (i * priceStep);
      } else {
        // 百分比模式：从基准价格开始，每次下跌stepValue%
        triggerPrice = basePrice! * Math.pow(1 - stepValue! / 100, i);
      }

      const investAmount = amountPerGrid;
      const holdings = investAmount / triggerPrice;

      // 判断是否已触发（如果提供了当前价格）
      const triggered = currentPrice ? currentPrice <= triggerPrice : false;

      if (triggered) {
        newInvested += investAmount;
        newHoldings += holdings;
      }

      // 计算累计数据（包含现有持仓）
      const cumulativeInvested = triggered ?
        (isAddPosition && existingPosition ? existingPosition.totalInvested + newInvested : newInvested) :
        (isAddPosition && existingPosition ? existingPosition.totalInvested : 0);

      const cumulativeHoldings = triggered ?
        (isAddPosition && existingPosition ? existingPosition.holdings + newHoldings : newHoldings) :
        (isAddPosition && existingPosition ? existingPosition.holdings : 0);

      // 计算理论平均成本（基于全部投入和持仓，即使未触发）
      const theoreticalAverageCost = theoreticalHoldings > 0 ?
        (isAddPosition && existingPosition ?
          (existingPosition.totalInvested + theoreticalInvested) / (existingPosition.holdings + theoreticalHoldings) :
          theoreticalInvested / theoreticalHoldings) : 0;

      const averageCost = triggered && cumulativeHoldings > 0 ? cumulativeInvested / cumulativeHoldings : theoreticalAverageCost;

      const level: CalculationLevel = {
        level: i,
        triggerPrice,
        investAmount,
        holdings,
        cumulativeInvested,
        cumulativeHoldings,
        averageCost,
        triggered
      };

      levels.push(level);
    }

    // 计算总持仓和投入（包含现有持仓） - 基于理论值（全部档位）
    const totalHoldings = isAddPosition && existingPosition ?
      existingPosition.holdings + theoreticalHoldings : theoreticalHoldings;

    const totalInvested = isAddPosition && existingPosition ?
      existingPosition.totalInvested + theoreticalInvested : theoreticalInvested;

    // 计算平均成本 - 基于全部投入和全部持仓
    const averagePrice = totalHoldings > 0 ? totalInvested / totalHoldings : 0;
    const remainingCash = totalCapital - (currentPrice ? newInvested : 0);
    
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
      maxDrawdown,
      // 补仓模式相关字段
      isAddPosition,
      existingPosition,
      newInvested,
      newHoldings,
      originalAverageCost: isAddPosition && existingPosition ? existingPosition.averageCost : undefined
    };
    
    return result;
  }
  
  /**
   * 计算网格策略的理论收益
   * @param params 策略参数
   * @param targetPrice 目标价格
   * @returns 理论收益信息
   */
  static calculatePotentialReturn(params: GridDipParams, targetPrice: number) {
    const result = this.calculate(params, params.lowerBound); // 假设全部触发
    
    if (result.totalHoldings === 0) {
      return {
        totalReturn: 0,
        returnPercentage: 0,
        breakEvenPrice: 0
      };
    }
    
    const currentValue = result.totalHoldings * targetPrice;
    const totalReturn = currentValue - result.totalInvested;
    const returnPercentage = (totalReturn / result.totalInvested) * 100;
    const breakEvenPrice = result.averagePrice;
    
    return {
      totalReturn,
      returnPercentage,
      breakEvenPrice,
      totalInvested: result.totalInvested,
      totalHoldings: result.totalHoldings,
      averagePrice: result.averagePrice
    };
  }
  
  /**
   * 获取下一个触发档位信息
   * @param params 策略参数
   * @param currentPrice 当前价格
   * @returns 下一个档位信息
   */
  static getNextTriggerLevel(params: GridDipParams) {
    const result = this.calculate(params);
    
    // 找到第一个档位作为下一个触发档位
    const nextLevel = result.levels[0];
    
    if (!nextLevel) {
      return null; // 没有档位
    }
    
    return {
      level: nextLevel.level,
      triggerPrice: nextLevel.triggerPrice,
      investAmount: nextLevel.investAmount,
      dropNeeded: 0
    };
  }
  
  /**
   * 验证策略参数
   * @param params 策略参数
   * @returns 验证结果
   */
  static validateParams(params: Partial<GridDipParams>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const stepMode = params.stepMode || 'absolute';
    
    if (stepMode === 'absolute') {
      if (!params.lowerBound || params.lowerBound <= 0) {
        errors.push('下限价格必须大于0');
      }
      
      if (!params.upperBound || params.upperBound <= 0) {
        errors.push('上限价格必须大于0');
      }
      
      if (params.lowerBound && params.upperBound && params.lowerBound >= params.upperBound) {
        errors.push('下限价格必须小于上限价格');
      }
      
      // 检查网格间隔是否合理
      if (params.lowerBound && params.upperBound && params.gridCount) {
        const priceStep = (params.upperBound - params.lowerBound) / params.gridCount;
        const stepPercentage = (priceStep / params.upperBound) * 100;
        
        if (stepPercentage < 0.1) {
          errors.push('网格间隔过小（小于0.1%），建议减少网格数量');
        }
        
        if (stepPercentage > 50) {
          errors.push('网格间隔过大（大于50%），建议增加网格数量');
        }
      }
    } else if (stepMode === 'percentage') {
      if (!params.stepValue || params.stepValue <= 0) {
        errors.push('百分比步长必须大于0');
      }
      
      if (!params.basePrice || params.basePrice <= 0) {
        errors.push('基准价格必须大于0');
      }
      
      if (params.stepValue && params.stepValue > 50) {
        errors.push('百分比步长过大（大于50%），建议调整');
      }
      
      if (params.stepValue && params.stepValue < 0.1) {
        errors.push('百分比步长过小（小于0.1%），建议调整');
      }
    }
    
    if (!params.gridCount || params.gridCount <= 0 || !Number.isInteger(params.gridCount)) {
      errors.push('网格数量必须是大于0的整数');
    }
    
    if (!params.totalCapital || params.totalCapital <= 0) {
      errors.push('总本金必须大于0');
    }
    
    // 验证补仓模式参数
    if (params.isAddPosition && params.existingPosition) {
      if (!params.existingPosition.holdings || params.existingPosition.holdings <= 0) {
        errors.push('现有持仓数量必须大于0');
      }
      
      if (!params.existingPosition.averageCost || params.existingPosition.averageCost <= 0) {
        errors.push('现有平均成本必须大于0');
      }
      
      if (!params.existingPosition.totalInvested || params.existingPosition.totalInvested <= 0) {
        errors.push('现有投入资金必须大于0');
      }
      
      // 验证现有持仓数据的一致性
      if (params.existingPosition.holdings && params.existingPosition.averageCost && params.existingPosition.totalInvested) {
        const expectedInvested = params.existingPosition.holdings * params.existingPosition.averageCost;
        const tolerance = Math.abs(expectedInvested - params.existingPosition.totalInvested) / expectedInvested;
        
        if (tolerance > 0.01) { // 允许1%的误差
          errors.push('现有持仓数据不一致：持仓数量 × 平均成本 ≠ 投入资金');
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}