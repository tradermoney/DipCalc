import { databaseService } from './DatabaseService';
import {
  StrategyParams,
  CalculationResult,
  UserSettings,
  HistoryRecord,
  DraftInput,
  DB_CONFIG
} from '../../types';

export class DataAccessLayer {
  // 策略相关操作
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
      
      // 记录历史
      await this.addHistory({
        id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        strategyId: strategy.id,
        action: existing ? 'update' : 'create',
        timestamp: new Date(),
        data: strategyWithTimestamp
      });
      
      return strategy.id;
    } catch (error) {
      console.error('Failed to save strategy:', error);
      throw error;
    }
  }

  async getStrategy(id: string): Promise<StrategyParams | null> {
    try {
      return await databaseService.get<StrategyParams>(DB_CONFIG.stores.strategies, id);
    } catch (error) {
      console.error('Failed to get strategy:', error);
      throw error;
    }
  }

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

  async deleteStrategy(id: string): Promise<void> {
    try {
      // 删除策略
      await databaseService.delete(DB_CONFIG.stores.strategies, id);
      
      // 删除相关计算结果
      const calculations = await databaseService.getByIndex<CalculationResult>(
        DB_CONFIG.stores.calculations, 
        'strategyId', 
        id
      );
      
      for (const calc of calculations) {
        await databaseService.delete(DB_CONFIG.stores.calculations, calc.id);
      }
      
      // 记录历史
      await this.addHistory({
        id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        strategyId: id,
        action: 'delete',
        timestamp: new Date(),
        data: { deletedStrategyId: id }
      });
    } catch (error) {
      console.error('Failed to delete strategy:', error);
      throw error;
    }
  }

  // 计算结果相关操作
  async saveCalculation(calculation: CalculationResult): Promise<string> {
    try {
      await databaseService.add(DB_CONFIG.stores.calculations, calculation);
      
      // 记录历史
      await this.addHistory({
        id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        strategyId: calculation.strategyId || calculation.id,
        action: 'calculate',
        timestamp: new Date(),
        data: { calculationId: calculation.id }
      });
      
      return calculation.id;
    } catch (error) {
      console.error('Failed to save calculation:', error);
      throw error;
    }
  }

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

  async getCalculations(): Promise<CalculationResult[]> {
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

  async deleteCalculation(id: string): Promise<void> {
    try {
      await databaseService.delete(DB_CONFIG.stores.calculations, id);
    } catch (error) {
      console.error('Failed to delete calculation:', error);
      throw error;
    }
  }

  async getLatestCalculation(strategyId: string): Promise<CalculationResult | null> {
    try {
      const calculations = await this.getCalculationsByStrategy(strategyId);
      return calculations.length > 0 ? calculations[0] : null;
    } catch (error) {
      console.error('Failed to get latest calculation:', error);
      throw error;
    }
  }

  // 用户设置相关操作
  async saveSettings(settings: UserSettings): Promise<void> {
    try {
      await databaseService.update(DB_CONFIG.stores.settings, settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  async getSettings(): Promise<UserSettings | null> {
    try {
      const allSettings = await databaseService.getAll<UserSettings>(DB_CONFIG.stores.settings);
      return allSettings.length > 0 ? allSettings[0] : null;
    } catch (error) {
      console.error('Failed to get settings:', error);
      throw error;
    }
  }

  async getDefaultSettings(): Promise<UserSettings> {
    return {
      id: 'default_settings',
      theme: 'light',
      currency: 'USDT',
      precision: 4,
      autoSave: true,
      notifications: true
    };
  }

  // 历史记录相关操作
  async addHistory(record: HistoryRecord): Promise<void> {
    try {
      await databaseService.add(DB_CONFIG.stores.history, record);
      
      // 保持历史记录数量在合理范围内（最多1000条）
      const allHistory = await databaseService.getAll<HistoryRecord>(DB_CONFIG.stores.history);
      if (allHistory.length > 1000) {
        const sortedHistory = allHistory.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        
        // 删除最老的记录
        const toDelete = sortedHistory.slice(0, allHistory.length - 1000);
        for (const record of toDelete) {
          await databaseService.delete(DB_CONFIG.stores.history, record.id);
        }
      }
    } catch (error) {
      console.error('Failed to add history record:', error);
      // 历史记录失败不应该影响主要功能
    }
  }

  async getHistoryByStrategy(strategyId: string): Promise<HistoryRecord[]> {
    try {
      const history = await databaseService.getByIndex<HistoryRecord>(
        DB_CONFIG.stores.history, 
        'strategyId', 
        strategyId
      );
      return history.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Failed to get history by strategy:', error);
      return [];
    }
  }

  // 数据导出导入
  async exportData(): Promise<string> {
    try {
      const strategies = await this.getAllStrategies();
      const calculations = await databaseService.getAll<CalculationResult>(DB_CONFIG.stores.calculations);
      const settings = await this.getSettings();
      
      const exportData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        strategies,
        calculations,
        settings
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.strategies) {
        for (const strategy of data.strategies) {
          await this.saveStrategy(strategy);
        }
      }
      
      if (data.calculations) {
        for (const calculation of data.calculations) {
          await databaseService.add(DB_CONFIG.stores.calculations, calculation);
        }
      }
      
      if (data.settings) {
        await this.saveSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  }

  // 临时输入/草稿相关操作
  async saveDraft(draft: Omit<DraftInput, 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const now = new Date();
      const draftWithTimestamp = {
        ...draft,
        createdAt: now,
        updatedAt: now
      };

      // 检查是否已存在
      const existing = await databaseService.get<DraftInput>(DB_CONFIG.stores.drafts, draft.id);

      if (existing) {
        // 更新时保留创建时间
        draftWithTimestamp.createdAt = existing.createdAt;
        await databaseService.update(DB_CONFIG.stores.drafts, draftWithTimestamp);
      } else {
        await databaseService.add(DB_CONFIG.stores.drafts, draftWithTimestamp);
      }
    } catch (error) {
      console.error('Failed to save draft:', error);
      throw error;
    }
  }

  async getDraft(id: string): Promise<DraftInput | null> {
    try {
      return await databaseService.get<DraftInput>(DB_CONFIG.stores.drafts, id);
    } catch (error) {
      console.error('Failed to get draft:', error);
      throw error;
    }
  }

  async getDraftByPagePath(pagePath: string): Promise<DraftInput | null> {
    try {
      const drafts = await databaseService.getByIndex<DraftInput>(
        DB_CONFIG.stores.drafts,
        'pagePath',
        pagePath
      );
      // 返回最新的草稿
      if (drafts.length > 0) {
        return drafts.sort((a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )[0];
      }
      return null;
    } catch (error) {
      console.error('Failed to get draft by pagePath:', error);
      throw error;
    }
  }

  async deleteDraft(id: string): Promise<void> {
    try {
      await databaseService.delete(DB_CONFIG.stores.drafts, id);
    } catch (error) {
      console.error('Failed to delete draft:', error);
      throw error;
    }
  }

  async getAllDrafts(): Promise<DraftInput[]> {
    try {
      const drafts = await databaseService.getAll<DraftInput>(DB_CONFIG.stores.drafts);
      return drafts.sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (error) {
      console.error('Failed to get all drafts:', error);
      throw error;
    }
  }

  // 清理数据
  async clearAllData(): Promise<void> {
    try {
      await databaseService.clear(DB_CONFIG.stores.strategies);
      await databaseService.clear(DB_CONFIG.stores.calculations);
      await databaseService.clear(DB_CONFIG.stores.history);
      await databaseService.clear(DB_CONFIG.stores.drafts);
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw error;
    }
  }
}

// 单例模式
export const dataAccessLayer = new DataAccessLayer();