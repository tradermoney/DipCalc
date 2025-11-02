export interface RiskAlert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  message: string;
  timestamp: Date;
  severity: number; // 1-10
}

export class RiskAlertSystem {
  private static alerts: RiskAlert[] = [];

  /**
   * 创建风险警报
   */
  static createAlert(
    type: 'warning' | 'danger' | 'info',
    message: string,
    severity: number = 5
  ): RiskAlert {
    const alert: RiskAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: new Date(),
      severity: Math.max(1, Math.min(10, severity))
    };

    this.alerts.unshift(alert);
    
    // 保持最近100条警报
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100);
    }

    return alert;
  }

  /**
   * 获取所有警报
   */
  static getAllAlerts(): RiskAlert[] {
    return [...this.alerts];
  }

  /**
   * 获取指定类型的警报
   */
  static getAlertsByType(type: 'warning' | 'danger' | 'info'): RiskAlert[] {
    return this.alerts.filter(alert => alert.type === type);
  }

  /**
   * 获取高严重性警报
   */
  static getHighSeverityAlerts(minSeverity: number = 7): RiskAlert[] {
    return this.alerts.filter(alert => alert.severity >= minSeverity);
  }

  /**
   * 清除警报
   */
  static clearAlert(alertId: string): boolean {
    const index = this.alerts.findIndex(alert => alert.id === alertId);
    if (index !== -1) {
      this.alerts.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 清除所有警报
   */
  static clearAllAlerts(): void {
    this.alerts = [];
  }

  /**
   * 清除过期警报
   */
  static clearExpiredAlerts(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = new Date().getTime();
    this.alerts = this.alerts.filter(alert => 
      now - alert.timestamp.getTime() < maxAge
    );
  }

  /**
   * 检查并生成风险警报
   */
  static checkAndGenerateAlerts(
    metrics: {
      maxDrawdown?: number;
      volatility?: number;
      riskLevel?: string;
      positionSize?: number;
      leverage?: number;
    }
  ): RiskAlert[] {
    const newAlerts: RiskAlert[] = [];

    // 检查最大回撤
    if (metrics.maxDrawdown !== undefined) {
      if (metrics.maxDrawdown > 0.3) {
        newAlerts.push(this.createAlert(
          'danger',
          `最大回撤过高: ${(metrics.maxDrawdown * 100).toFixed(2)}%`,
          9
        ));
      } else if (metrics.maxDrawdown > 0.2) {
        newAlerts.push(this.createAlert(
          'warning',
          `回撤较高: ${(metrics.maxDrawdown * 100).toFixed(2)}%`,
          6
        ));
      }
    }

    // 检查波动率
    if (metrics.volatility !== undefined) {
      if (metrics.volatility > 0.3) {
        newAlerts.push(this.createAlert(
          'danger',
          `波动率过高: ${(metrics.volatility * 100).toFixed(2)}%`,
          8
        ));
      } else if (metrics.volatility > 0.2) {
        newAlerts.push(this.createAlert(
          'warning',
          `波动率较高: ${(metrics.volatility * 100).toFixed(2)}%`,
          5
        ));
      }
    }

    // 检查风险等级
    if (metrics.riskLevel === 'extreme') {
      newAlerts.push(this.createAlert(
        'danger',
        '风险等级: 极高风险',
        10
      ));
    } else if (metrics.riskLevel === 'high') {
      newAlerts.push(this.createAlert(
        'warning',
        '风险等级: 高风险',
        7
      ));
    }

    // 检查杠杆倍数
    if (metrics.leverage !== undefined && metrics.leverage > 10) {
      newAlerts.push(this.createAlert(
        'warning',
        `杠杆倍数较高: ${metrics.leverage}x`,
        6
      ));
    }

    return newAlerts;
  }

  /**
   * 格式化警报消息
   */
  static formatAlert(alert: RiskAlert): string {
    const typeEmoji = {
      info: 'ℹ️',
      warning: '⚠️',
      danger: '🚨'
    };

    return `${typeEmoji[alert.type]} [${alert.severity}/10] ${alert.message} (${alert.timestamp.toLocaleString()})`;
  }
}