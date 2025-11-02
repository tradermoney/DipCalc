import { databaseService } from '../DatabaseService';
import { StrategyParams, HistoryRecord, DB_CONFIG } from '../../../types';

export class StrategyDataAccess {
  /**
   * 保存策略
   */
  async saveStrategy(strategy: StrategyParams): Promise<string> {
    const strategyWithTimestamp = {
      ...strategy,
      updatedAt: new Date()
    };
    
    try {
      // 检查是否已存在
      const existing = await databaseService.get<StrategyParams>(
        DB_CONFIG.stores.strategies, 
        strategy.id
      );
      
      if (existing) {
        await databaseService.update(DB_CONFIG.stores.strategies, strategyWithTimestamp);
      } else {
        await databaseService.add(DB_CONFIG.stores.strategies, strategyWithTimestamp);
      }
      
      return strategy.id;
    } catch (error) {
      console.error('Failed to save strategy:', error);
      throw error;
    }
  }

  /**
   * 获取单个策略
   */
  async getStrategy(id: string): Promise<StrategyParams | null> {
    try {
      return await databaseService.get<StrategyParams>(DB_CONFIG.stores.strategies, id);
    } catch (error) {
      console.error('Failed to get strategy:', error);
      throw error;
    }
  }

  /**
   * 获取所有策略
   */
  async getAllStrategies(): Promise<StrategyParams[]> {
    try {
      const strategies = await databaseService.getAll<StrategyParams>(DB_CONFIG.stores.strategies);
      return strategies.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (error) {
      console.error('Failed to get all strategies:', error);
      throw error;
    }
  }

  /**
   * 按类型获取策略
   */
  async getStrategiesByType(type: string): Promise<StrategyParams[]> {
    try {
      const allStrategies = await this.getAllStrategies();
      return allStrategies.filter(strategy => strategy.type === type);
    } catch (error) {
      console.error('Failed to get strategies by type:', error);
      throw error;
    }
  }

  /**
   * 删除策略
   */
  async deleteStrategy(id: string): Promise<void> {
    try {
      await databaseService.delete(DB_CONFIG.stores.strategies, id);
    } catch (error) {
      console.error('Failed to delete strategy:', error);
      throw error;
    }
  }

  /**
   * 批量删除策略
   */
  async deleteStrategies(ids: string[]): Promise<void> {
    try {
      for (const id of ids) {
        await this.deleteStrategy(id);
      }
    } catch (error) {
      console.error('Failed to delete strategies:', error);
      throw error;
    }
  }

  /**
   * 搜索策略
   */
  async searchStrategies(query: string): Promise<StrategyParams[]> {
    try {
      const allStrategies = await this.getAllStrategies();
      const lowerQuery = query.toLowerCase();
      
      return allStrategies.filter(strategy => 
        strategy.name.toLowerCase().includes(lowerQuery) ||
        strategy.type.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error('Failed to search strategies:', error);
      throw error;
    }
  }

  /**
   * 获取策略统计信息
   */
  async getStrategyStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    recentlyCreated: number;
  }> {
    try {
      const strategies = await this.getAllStrategies();
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const byType: Record<string, number> = {};
      let recentlyCreated = 0;
      
      for (const strategy of strategies) {
        // 按类型统计
        byType[strategy.type] = (byType[strategy.type] || 0) + 1;
        
        // 最近创建的策略
        if (new Date(strategy.createdAt) > oneWeekAgo) {
          recentlyCreated++;
        }
      }
      
      return {
        total: strategies.length,
        byType,
        recentlyCreated
      };
    } catch (error) {
      console.error('Failed to get strategy stats:', error);
      throw error;
    }
  }
}