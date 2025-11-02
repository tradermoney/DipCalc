import { CalculationResult } from '../../types';

// 导入拆分后的模块
import { RiskMetricsCalculator, RiskMetrics } from './RiskMetricsCalculator';
import { RiskLimitsManager, RiskLimits } from './RiskLimitsManager';
import { RiskAlertSystem, RiskAlert } from './RiskAlertSystem';
import { RiskAssessmentTools } from './RiskAssessmentTools';

export class RiskManagerRefactored {
  /**
   * 计算风险指标
   */
  static calculateRiskMetrics(results: CalculationResult[]): RiskMetrics {
    return RiskMetricsCalculator.calculateRiskMetrics(results);
  }

  /**
   * 获取默认风险限制
   */
  static getDefaultLimits(): RiskLimits {
    return RiskLimitsManager.getDefaultLimits();
  }

  /**
   * 验证风险限制
   */
  static validateLimits(limits: Partial<RiskLimits>) {
    return RiskLimitsManager.validateLimits(limits);
  }

  /**
   * 检查风险限制
   */
  static checkLimits(
    currentMetrics: {
      drawdown?: number;
      positionSize?: number;
      leverage?: number;
      concentration?: number;
    },
    limits?: RiskLimits
  ) {
    return RiskLimitsManager.checkLimits(currentMetrics, limits);
  }

  /**
   * 计算建议仓位大小
   */
  static calculateRecommendedPositionSize(
    totalCapital: number,
    riskPerTrade: number,
    stopLossDistance: number,
    limits?: RiskLimits
  ): number {
    return RiskLimitsManager.calculateRecommendedPositionSize(
      totalCapital,
      riskPerTrade,
      stopLossDistance,
      limits
    );
  }

  /**
   * 创建风险警报
   */
  static createAlert(
    type: 'warning' | 'danger' | 'info',
    message: string,
    severity?: number
  ): RiskAlert {
    return RiskAlertSystem.createAlert(type, message, severity);
  }

  /**
   * 获取所有警报
   */
  static getAllAlerts(): RiskAlert[] {
    return RiskAlertSystem.getAllAlerts();
  }

  /**
   * 检查并生成风险警报
   */
  static checkAndGenerateAlerts(metrics: {
    maxDrawdown?: number;
    volatility?: number;
    riskLevel?: string;
    positionSize?: number;
    leverage?: number;
  }): RiskAlert[] {
    return RiskAlertSystem.checkAndGenerateAlerts(metrics);
  }

  /**
   * 计算凯利公式建议仓位
   */
  static calculateKellyPosition(
    winRate: number,
    averageWin: number,
    averageLoss: number
  ): number {
    return RiskAssessmentTools.calculateKellyPosition(winRate, averageWin, averageLoss);
  }

  /**
   * 计算风险调整收益率
   */
  static calculateRiskAdjustedReturn(
    totalReturn: number,
    volatility: number,
    maxDrawdown: number,
    riskFreeRate?: number
  ) {
    return RiskAssessmentTools.calculateRiskAdjustedReturn(
      totalReturn,
      volatility,
      maxDrawdown,
      riskFreeRate
    );
  }

  /**
   * 计算VaR（风险价值）
   */
  static calculateVaR(returns: number[], confidence?: number): number {
    return RiskMetricsCalculator.calculateVaR(returns, confidence);
  }

  /**
   * 计算最大连续亏损
   */
  static calculateMaxConsecutiveLosses(returns: number[]): number {
    return RiskMetricsCalculator.calculateMaxConsecutiveLosses(returns);
  }

  /**
   * 计算相关性
   */
  static calculateCorrelation(returns1: number[], returns2: number[]): number {
    return RiskAssessmentTools.calculateCorrelationMatrix(returns1, returns2);
  }

  /**
   * 计算贝塔系数
   */
  static calculateBeta(assetReturns: number[], marketReturns: number[]): number {
    return RiskAssessmentTools.calculateBeta(assetReturns, marketReturns);
  }

  /**
   * 清除警报
   */
  static clearAlert(alertId: string): boolean {
    return RiskAlertSystem.clearAlert(alertId);
  }

  /**
   * 清除所有警报
   */
  static clearAllAlerts(): void {
    RiskAlertSystem.clearAllAlerts();
  }

  /**
   * 格式化警报消息
   */
  static formatAlert(alert: RiskAlert): string {
    return RiskAlertSystem.formatAlert(alert);
  }
}

// 导出类型
export type { RiskMetrics, RiskLimits, RiskAlert };