import { databaseService } from '../DatabaseService';
import { CalculationResult, DB_CONFIG } from '../../../types';

export class CalculationDataAccess {
  /**
   * 保存计算结果
   */
  async saveCalculation(calculation: CalculationResult): Promise<string> {
    try {
      const calculationWithTimestamp = {
        ...calculation,
        calculatedAt: new Date()
      };
      
      await databaseService.add(DB_CONFIG.stores.calculations, calculationWithTimestamp);
      return calculation.id;
    } catch (error) {
      console.error('Failed to save calculation:', error);
      throw error;
    }
  }

  /**
   * 获取单个计算结果
   */
  async getCalculation(id: string): Promise<CalculationResult | null> {
    try {
      return await databaseService.get<CalculationResult>(DB_CONFIG.stores.calculations, id);
    } catch (error) {
      console.error('Failed to get calculation:', error);
      throw error;
    }
  }

  /**
   * 获取所有计算结果
   */
  async getAllCalculations(): Promise<CalculationResult[]> {
    try {
      const calculations = await databaseService.getAll<CalculationResult>(DB_CONFIG.stores.calculations);
      return calculations.sort((a, b) => 
        new Date(b.calculatedAt).getTime() - new Date(a.calculatedAt).getTime()
      );
    } catch (error) {
      console.error('Failed to get all calculations:', error);
      throw error;
    }
  }

  /**
   * 按策略ID获取计算结果
   */
  async getCalculationsByStrategy(strategyId: string): Promise<CalculationResult[]> {
    try {
      const calculations = await databaseService.getByIndex<CalculationResult>(
        DB_CONFIG.stores.calculations, 
        'strategyId', 
        strategyId
      );
      return calculations.sort((a, b) => 
        new Date(b.calculatedAt).getTime() - new Date(a.calculatedAt).getTime()
      );
    } catch (error) {
      console.error('Failed to get calculations by strategy:', error);
      throw error;
    }
  }

  /**
   * 按策略类型获取计算结果
   */
  async getCalculationsByType(strategyType: string): Promise<CalculationResult[]> {
    try {
      const allCalculations = await this.getAllCalculations();
      return allCalculations.filter(calc => calc.strategyType === strategyType);
    } catch (error) {
      console.error('Failed to get calculations by type:', error);
      throw error;
    }
  }

  /**
   * 删除计算结果
   */
  async deleteCalculation(id: string): Promise<void> {
    try {
      await databaseService.delete(DB_CONFIG.stores.calculations, id);
    } catch (error) {
      console.error('Failed to delete calculation:', error);
      throw error;
    }
  }

  /**
   * 删除策略相关的所有计算结果
   */
  async deleteCalculationsByStrategy(strategyId: string): Promise<void> {
    try {
      const calculations = await this.getCalculationsByStrategy(strategyId);
      for (const calc of calculations) {
        await this.deleteCalculation(calc.id);
      }
    } catch (error) {
      console.error('Failed to delete calculations by strategy:', error);
      throw error;
    }
  }

  /**
   * 获取最近的计算结果
   */
  async getRecentCalculations(limit: number = 10): Promise<CalculationResult[]> {
    try {
      const calculations = await this.getAllCalculations();
      return calculations.slice(0, limit);
    } catch (error) {
      console.error('Failed to get recent calculations:', error);
      throw error;
    }
  }

  /**
   * 获取计算结果统计信息
   */
  async getCalculationStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    recentCount: number;
    avgTotalInvested: number;
    avgTotalHoldings: number;
  }> {
    try {
      const calculations = await this.getAllCalculations();
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const byType: Record<string, number> = {};
      let recentCount = 0;
      let totalInvestedSum = 0;
      let totalHoldingsSum = 0;
      
      for (const calc of calculations) {
        // 按类型统计
        byType[calc.strategyType] = (byType[calc.strategyType] || 0) + 1;
        
        // 最近计算的数量
        if (new Date(calc.calculatedAt) > oneWeekAgo) {
          recentCount++;
        }
        
        // 累计投资和持仓
        totalInvestedSum += calc.totalInvested;
        totalHoldingsSum += calc.totalHoldings;
      }
      
      return {
        total: calculations.length,
        byType,
        recentCount,
        avgTotalInvested: calculations.length > 0 ? totalInvestedSum / calculations.length : 0,
        avgTotalHoldings: calculations.length > 0 ? totalHoldingsSum / calculations.length : 0
      };
    } catch (error) {
      console.error('Failed to get calculation stats:', error);
      throw error;
    }
  }

  /**
   * 清理过期的计算结果
   */
  async cleanupOldCalculations(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<number> {
    try {
      const calculations = await this.getAllCalculations();
      const now = new Date().getTime();
      let deletedCount = 0;
      
      for (const calc of calculations) {
        const calcTime = new Date(calc.calculatedAt).getTime();
        if (now - calcTime > maxAge) {
          await this.deleteCalculation(calc.id);
          deletedCount++;
        }
      }
      
      return deletedCount;
    } catch (error) {
      console.error('Failed to cleanup old calculations:', error);
      throw error;
    }
  }
}