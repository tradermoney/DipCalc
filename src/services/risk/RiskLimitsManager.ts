export interface RiskLimits {
  maxDrawdownLimit: number;
  maxPositionSize: number;
  stopLossPercentage: number;
  maxLeverage: number;
  concentrationLimit: number;
}

export class RiskLimitsManager {
  private static readonly DEFAULT_LIMITS: RiskLimits = {
    maxDrawdownLimit: 0.2, // 20%
    maxPositionSize: 0.1, // 10%
    stopLossPercentage: 0.05, // 5%
    maxLeverage: 10,
    concentrationLimit: 0.3 // 30%
  };

  /**
   * 获取默认风险限制
   */
  static getDefaultLimits(): RiskLimits {
    return { ...this.DEFAULT_LIMITS };
  }

  /**
   * 验证风险限制
   */
  static validateLimits(limits: Partial<RiskLimits>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (limits.maxDrawdownLimit !== undefined) {
      if (limits.maxDrawdownLimit <= 0 || limits.maxDrawdownLimit > 1) {
        errors.push('最大回撤限制必须在0-100%之间');
      }
    }

    if (limits.maxPositionSize !== undefined) {
      if (limits.maxPositionSize <= 0 || limits.maxPositionSize > 1) {
        errors.push('最大仓位大小必须在0-100%之间');
      }
    }

    if (limits.stopLossPercentage !== undefined) {
      if (limits.stopLossPercentage <= 0 || limits.stopLossPercentage > 1) {
        errors.push('止损百分比必须在0-100%之间');
      }
    }

    if (limits.maxLeverage !== undefined) {
      if (limits.maxLeverage <= 0 || limits.maxLeverage > 100) {
        errors.push('最大杠杆必须在1-100倍之间');
      }
    }

    if (limits.concentrationLimit !== undefined) {
      if (limits.concentrationLimit <= 0 || limits.concentrationLimit > 1) {
        errors.push('集中度限制必须在0-100%之间');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 检查是否超出风险限制
   */
  static checkLimits(
    currentMetrics: {
      drawdown?: number;
      positionSize?: number;
      leverage?: number;
      concentration?: number;
    },
    limits: RiskLimits = this.DEFAULT_LIMITS
  ): {
    violations: string[];
    riskScore: number;
  } {
    const violations: string[] = [];
    let riskScore = 0;

    // 检查回撤限制
    if (currentMetrics.drawdown !== undefined && currentMetrics.drawdown > limits.maxDrawdownLimit) {
      violations.push(`回撤超限: ${(currentMetrics.drawdown * 100).toFixed(2)}% > ${(limits.maxDrawdownLimit * 100).toFixed(2)}%`);
      riskScore += 30;
    }

    // 检查仓位大小
    if (currentMetrics.positionSize !== undefined && currentMetrics.positionSize > limits.maxPositionSize) {
      violations.push(`仓位过大: ${(currentMetrics.positionSize * 100).toFixed(2)}% > ${(limits.maxPositionSize * 100).toFixed(2)}%`);
      riskScore += 25;
    }

    // 检查杠杆倍数
    if (currentMetrics.leverage !== undefined && currentMetrics.leverage > limits.maxLeverage) {
      violations.push(`杠杆过高: ${currentMetrics.leverage}x > ${limits.maxLeverage}x`);
      riskScore += 35;
    }

    // 检查集中度
    if (currentMetrics.concentration !== undefined && currentMetrics.concentration > limits.concentrationLimit) {
      violations.push(`集中度过高: ${(currentMetrics.concentration * 100).toFixed(2)}% > ${(limits.concentrationLimit * 100).toFixed(2)}%`);
      riskScore += 20;
    }

    return {
      violations,
      riskScore: Math.min(riskScore, 100)
    };
  }

  /**
   * 计算建议的仓位大小
   */
  static calculateRecommendedPositionSize(
    totalCapital: number,
    riskPerTrade: number,
    stopLossDistance: number,
    limits: RiskLimits = this.DEFAULT_LIMITS
  ): number {
    // 基于风险的仓位大小
    const riskBasedSize = (totalCapital * riskPerTrade) / stopLossDistance;
    
    // 应用最大仓位限制
    const maxAllowedSize = totalCapital * limits.maxPositionSize;
    
    return Math.min(riskBasedSize, maxAllowedSize);
  }
}