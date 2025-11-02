import { PnLParams, PnLCalculationResult } from '../../types';

/**
 * PnL计算器 - 用于计算现货交易的损益
 */
export class PnLCalculator {
  /**
   * 计算PnL - 支持多笔交易记录
   */
  static calculate(params: PnLParams): PnLCalculationResult {
    const { trades, currentPrice } = params;

    // 筛选启用的交易
    const enabledTrades = trades.filter(trade => trade.enabled);

    // 按时间排序（假设trades已经是按时间顺序的）
    let totalInvested = 0; // 总投入资金
    let totalFees = 0; // 总手续费
    let holdings = 0; // 持仓数量（买入为正，卖出为负）
    let totalBuyCost = 0; // 总买入成本（不含手续费）
    let realizedPnL = 0; // 已实现盈亏
    let realizedPnLPercentage = 0;

    // 遍历所有启用的交易
    for (const trade of enabledTrades) {
      const tradeValue = trade.price * trade.amount;
      const tradeFee = tradeValue * (trade.feeRate / 100);
      totalFees += tradeFee;

      if (trade.type === 'BUY') {
        // 买入：增加持仓和投入
        holdings += trade.amount;
        totalBuyCost += tradeValue;
        totalInvested += tradeValue + tradeFee;
      } else if (trade.type === 'SELL') {
        // 卖出：减少持仓，计算已实现盈亏
        if (holdings > 0) {
          // 计算这部分卖出的平均成本
          const sellAmount = Math.min(trade.amount, holdings);
          const averageCost = totalBuyCost / holdings;
          const costOfSold = averageCost * sellAmount;

          // 已实现盈亏 = 卖出收入 - 买入成本 - 手续费
          realizedPnL += tradeValue - costOfSold - tradeFee;

          // 更新累计买入成本（移除已卖出的部分）
          totalBuyCost -= costOfSold;
          holdings -= sellAmount;
        }
      }
    }

    // 计算盈亏平衡价格（考虑所有手续费）
    const breakEvenPrice = holdings > 0 ? (totalBuyCost + totalFees) / holdings : 0;

    // 计算未实现盈亏
    const currentValue = holdings * currentPrice;
    const unrealizedPnL = currentValue - totalBuyCost;
    const unrealizedPnLPercentage = totalInvested > 0
      ? (unrealizedPnL / totalInvested) * 100
      : 0;

    // 计算已实现盈亏百分比
    realizedPnLPercentage = totalInvested > 0
      ? (realizedPnL / totalInvested) * 100
      : 0;

    // 计算总投资回报率（ROI）
    const totalPnL = realizedPnL + unrealizedPnL;
    const roi = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

    return {
      totalInvested,
      totalFees,
      holdings,
      currentValue,
      unrealizedPnL,
      unrealizedPnLPercentage,
      realizedPnL,
      realizedPnLPercentage,
      breakEvenPrice,
      roi
    };
  }

  /**
   * 计算收益率
   */
  static calculateReturn(buyPrice: number, sellPrice: number, feeRate: number = 0): number {
    const buyCost = buyPrice * (1 + feeRate / 100);
    const sellValue = sellPrice * (1 - feeRate / 100);
    return ((sellValue - buyCost) / buyCost) * 100;
  }

  /**
   * 计算所需价格以达到目标收益率
   */
  static calculateTargetPrice(
    entryPrice: number,
    entryAmount: number,
    entryFeeRate: number,
    targetReturnPercentage: number,
    exitFeeRate: number = 0
  ): number {
    const totalInvested = entryPrice * entryAmount * (1 + entryFeeRate / 100);
    const targetValue = totalInvested * (1 + targetReturnPercentage / 100);
    return targetValue / (entryAmount * (1 - exitFeeRate / 100));
  }

  /**
   * 计算最大回撤
   */
  static calculateMaxDrawdown(prices: number[]): number {
    if (prices.length < 2) return 0;

    let maxDrawdown = 0;
    let peak = prices[0];

    for (const price of prices) {
      if (price > peak) {
        peak = price;
      }
      const drawdown = ((peak - price) / peak) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return maxDrawdown;
  }

  /**
   * 计算夏普比率
   */
  static calculateSharpeRatio(returns: number[], riskFreeRate: number = 0): number {
    if (returns.length < 2) return 0;

    const excessReturns = returns.map(r => r - riskFreeRate);
    const avgExcessReturn = excessReturns.reduce((a, b) => a + b, 0) / returns.length;

    const variance = returns.reduce((sum, r) => {
      const diff = r - avgExcessReturn;
      return sum + diff * diff;
    }, 0) / (returns.length - 1);

    const stdDev = Math.sqrt(variance);

    return stdDev === 0 ? 0 : avgExcessReturn / stdDev;
  }

  /**
   * 验证参数 - 支持多笔交易
   */
  static validate(params: Partial<PnLParams>): string[] {
    const errors: string[] = [];

    if (!params.symbol || params.symbol.trim() === '') {
      errors.push('请输入交易对符号');
    }

    if (!params.currentPrice || params.currentPrice <= 0) {
      errors.push('当前价格必须大于0');
    }

    if (!params.trades || params.trades.length === 0) {
      errors.push('请至少添加一笔交易记录');
    }

    if (params.trades && params.trades.length > 0) {
      params.trades.forEach((trade, index) => {
        if (!trade.enabled) return; // 只验证启用的交易

        if (trade.price <= 0) {
          errors.push(`第${index + 1}笔交易：价格必须大于0`);
        }

        if (trade.amount <= 0) {
          errors.push(`第${index + 1}笔交易：数量必须大于0`);
        }

        if (trade.feeRate < 0) {
          errors.push(`第${index + 1}笔交易：手续费率不能为负数`);
        }

        if (!trade.type || (trade.type !== 'BUY' && trade.type !== 'SELL')) {
          errors.push(`第${index + 1}笔交易：交易方向必须是买入或卖出`);
        }
      });
    }

    return errors;
  }
}
