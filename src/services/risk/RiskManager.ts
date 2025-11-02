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

export interface RiskLimits {
  maxDrawdownLimit: number;
  maxPositionSize: number;
  stopLossPercentage: number;
  maxLeverage: number;
  concentrationLimit: number;
}

export interface RiskAlert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  message: string;
  timestamp: Date;
  severity: number; // 1-10
}

export class RiskManager {
  private static readonly DEFAULT_LIMITS: RiskLimits = {
    maxDrawdownLimit: 0.2, // 20%
    maxPositionSize: 0.1, // 10%
    stopLossPercentage: 0.05, // 5%
    maxLeverage: 10,
    concentrationLimit: 0.3 // 30%
  };

  /**
   * 计算风险指标
   * @param results 计算结果数组
   * @returns 风险指标
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
    let riskLevel: 'low' | 'medium' | 'high' | 'extreme' = 'low';
    if (maxDrawdown > 0.5 || volatility > 0.3) {
      riskLevel = 'extreme';
    } else if (maxDrawdown > 0.3 || volatility > 0.2) {
      riskLevel = 'high';
    } else if (maxDrawdown > 0.15 || volatility > 0.1) {
      riskLevel = 'medium';
    }

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
   * 检查风险限制
   * @param result 计算结果
   * @param limits 风险限制
   * @returns 风险警报数组
   */
  static checkRiskLimits(result: CalculationResult, limits: RiskLimits = this.DEFAULT_LIMITS): RiskAlert[] {
    const alerts: RiskAlert[] = [];

    // 检查最大回撤
    if (result.maxDrawdown && Math.abs(result.maxDrawdown) > limits.maxDrawdownLimit) {
      alerts.push({
        id: `drawdown_${Date.now()}`,
        type: 'danger',
        message: `最大回撤 ${(Math.abs(result.maxDrawdown) * 100).toFixed(2)}% 超过限制 ${(limits.maxDrawdownLimit * 100).toFixed(2)}%`,
        timestamp: new Date(),
        severity: 9
      });
    }

    // 检查杠杆倍数
    if (result.leverageRatio && result.leverageRatio > limits.maxLeverage) {
      alerts.push({
        id: `leverage_${Date.now()}`,
        type: 'warning',
        message: `杠杆倍数 ${result.leverageRatio}x 超过建议限制 ${limits.maxLeverage}x`,
        timestamp: new Date(),
        severity: 7
      });
    }

    // 检查仓位集中度
    const positionRatio = result.totalInvested / (result.totalInvested + result.remainingCapital);
    if (positionRatio > limits.concentrationLimit) {
      alerts.push({
        id: `concentration_${Date.now()}`,
        type: 'warning',
        message: `仓位集中度 ${(positionRatio * 100).toFixed(2)}% 过高，建议分散投资`,
        timestamp: new Date(),
        severity: 6
      });
    }

    // 检查未实现损失
    if (result.currentPriceAnalysis?.unrealizedPnL && result.totalInvested > 0) {
      const lossRatio = Math.abs(result.currentPriceAnalysis.unrealizedPnL) / result.totalInvested;
      if (result.currentPriceAnalysis.unrealizedPnL < 0 && lossRatio > limits.stopLossPercentage) {
        alerts.push({
          id: `loss_${Date.now()}`,
          type: 'danger',
          message: `未实现损失 ${(lossRatio * 100).toFixed(2)}% 建议考虑止损`,
          timestamp: new Date(),
          severity: 8
        });
      }
    }

    return alerts.sort((a, b) => b.severity - a.severity);
  }

  /**
   * 计算仓位建议
   * @param totalCapital 总资金
   * @param riskTolerance 风险承受度 (0-1)
   * @param volatility 波动率
   * @returns 建议仓位大小
   */
  static calculatePositionSize(totalCapital: number, riskTolerance: number, volatility: number): number {
    // Kelly公式的简化版本
    const basePosition = totalCapital * 0.1; // 基础仓位10%
    const riskAdjustment = riskTolerance * 0.5; // 风险调整
    const volatilityAdjustment = Math.max(0.1, 1 - volatility); // 波动率调整
    
    const suggestedPosition = basePosition * riskAdjustment * volatilityAdjustment;
    
    // 限制在总资金的5%-30%之间
    return Math.max(totalCapital * 0.05, Math.min(totalCapital * 0.3, suggestedPosition));
  }

  /**
   * 生成风险报告
   * @param results 计算结果数组
   * @param limits 风险限制
   * @returns 风险报告
   */
  static generateRiskReport(results: CalculationResult[], limits: RiskLimits = this.DEFAULT_LIMITS) {
    const metrics = this.calculateRiskMetrics(results);
    const allAlerts: RiskAlert[] = [];
    
    // 收集所有警报
    results.forEach(result => {
      const alerts = this.checkRiskLimits(result, limits);
      allAlerts.push(...alerts);
    });

    // 统计信息
    const totalInvested = results.reduce((sum, r) => sum + r.totalInvested, 0);
    const totalPnL = results.reduce((sum, r) => sum + (r.currentPriceAnalysis?.unrealizedPnL || 0), 0);
    const totalCapital = results.reduce((sum, r) => sum + r.totalInvested + r.remainingCapital, 0);

    // 风险评分 (0-100)
    let riskScore = 0;
    if (metrics.riskLevel === 'extreme') riskScore = 90;
    else if (metrics.riskLevel === 'high') riskScore = 70;
    else if (metrics.riskLevel === 'medium') riskScore = 50;
    else riskScore = 30;

    // 调整评分
    if (metrics.maxDrawdown > 0.3) riskScore += 10;
    if (metrics.volatility > 0.2) riskScore += 10;
    if (metrics.sharpeRatio < 0) riskScore += 15;
    
    riskScore = Math.min(100, riskScore);

    return {
      metrics,
      alerts: allAlerts,
      summary: {
        totalInvested,
        totalPnL,
        totalCapital,
        riskScore,
        overallReturn: totalCapital > 0 ? totalPnL / totalCapital : 0,
        diversificationLevel: this.calculateDiversification(results)
      },
      recommendations: this.generateRecommendations(metrics, allAlerts)
    };
  }

  /**
   * 计算分散化程度
   * @param results 计算结果数组
   * @returns 分散化评分 (0-1)
   */
  private static calculateDiversification(results: CalculationResult[]): number {
    if (results.length <= 1) return 0;
    
    // 基于策略数量和资金分配的分散化评分
    const strategyCount = new Set(results.map(r => r.strategyId)).size;
    const maxStrategies = 6; // 假设最多6种策略
    const strategyDiversification = Math.min(1, strategyCount / maxStrategies);
    
    // 基于资金分配均匀程度
    const totalInvested = results.reduce((sum, r) => sum + r.totalInvested, 0);
    if (totalInvested === 0) return strategyDiversification;
    
    const weights = results.map(r => r.totalInvested / totalInvested);
    const idealWeight = 1 / results.length;
    const weightVariance = weights.reduce((sum, w) => sum + Math.pow(w - idealWeight, 2), 0) / weights.length;
    const allocationDiversification = Math.max(0, 1 - weightVariance * 4);
    
    return (strategyDiversification + allocationDiversification) / 2;
  }

  /**
   * 生成风险管理建议
   * @param metrics 风险指标
   * @param alerts 风险警报
   * @returns 建议列表
   */
  private static generateRecommendations(metrics: RiskMetrics, alerts: RiskAlert[]): string[] {
    const recommendations: string[] = [];

    // 基于风险等级的建议
    if (metrics.riskLevel === 'extreme') {
      recommendations.push('🚨 风险极高，建议立即减仓或停止交易');
      recommendations.push('📉 考虑设置更严格的止损条件');
    } else if (metrics.riskLevel === 'high') {
      recommendations.push('⚠️ 风险较高，建议降低仓位规模');
      recommendations.push('🎯 优化策略参数，降低波动率');
    } else if (metrics.riskLevel === 'medium') {
      recommendations.push('📊 风险适中，可适当调整策略');
      recommendations.push('⚖️ 保持当前风险水平，密切监控');
    } else {
      recommendations.push('✅ 风险较低，策略表现良好');
      recommendations.push('📈 可考虑适当增加仓位');
    }

    // 基于具体指标的建议
    if (metrics.maxDrawdown > 0.2) {
      recommendations.push('📉 最大回撤过大，建议优化止损策略');
    }

    if (metrics.volatility > 0.15) {
      recommendations.push('🌊 波动率较高，建议分散投资降低风险');
    }

    if (metrics.sharpeRatio < 0.5) {
      recommendations.push('📊 风险调整收益较低，建议优化策略参数');
    }

    if (metrics.winRate < 0.4) {
      recommendations.push('🎯 胜率较低，建议改进入场时机');
    }

    // 基于警报的建议
    const highSeverityAlerts = alerts.filter(a => a.severity >= 8);
    if (highSeverityAlerts.length > 0) {
      recommendations.push('🚨 存在高风险警报，请立即处理');
    }

    // 通用建议
    recommendations.push('📋 定期回顾和调整风险管理策略');
    recommendations.push('📚 持续学习和改进交易技能');

    return recommendations;
  }

  /**
   * 验证策略参数的风险性
   * @param params 策略参数
   * @returns 风险评估结果
   */
  static validateStrategyRisk(params: any): { valid: boolean; warnings: string[]; errors: string[] } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // 检查杠杆倍数
    if (params.leverageRatio && params.leverageRatio > 20) {
      errors.push('杠杆倍数过高，存在爆仓风险');
    } else if (params.leverageRatio && params.leverageRatio > 10) {
      warnings.push('杠杆倍数较高，请谨慎操作');
    }

    // 检查最大档数
    if (params.maxLevels && params.maxLevels > 15) {
      warnings.push('档数过多可能导致资金过度分散');
    }

    // 检查总资金
    if (params.totalCapital && params.totalCapital < 1000) {
      warnings.push('资金量较小，可能影响策略效果');
    }

    // 检查步长设置
    if (params.stepPercentage && params.stepPercentage > 10) {
      warnings.push('步长过大可能错过最佳买入时机');
    } else if (params.stepPercentage && params.stepPercentage < 1) {
      warnings.push('步长过小可能导致频繁交易');
    }

    return {
      valid: errors.length === 0,
      warnings,
      errors
    };
  }
}