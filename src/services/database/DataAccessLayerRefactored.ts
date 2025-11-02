import { 
  StrategyParams, 
  CalculationResult, 
  UserSettings, 
  HistoryRecord
} from '../../types';

// 导入拆分后的模块
import { StrategyDataAccess } from './data-access/StrategyDataAccess';
import { CalculationDataAccess } from './data-access/CalculationDataAccess';
import { DatabaseOperationUtils, DatabaseOperationResult } from './utils/DatabaseOperationUtils';
import { DataValidationUtils } from './utils/DataValidationUtils';

export class DataAccessLayerRefactored {
  private strategyDataAccess: StrategyDataAccess;
  private calculationDataAccess: CalculationDataAccess;

  constructor() {
    this.strategyDataAccess = new StrategyDataAccess();
    this.calculationDataAccess = new CalculationDataAccess();
  }

  // 策略相关操作
  async saveStrategy(strategy: StrategyParams): Promise<string> {
    // 验证数据
    const validation = DataValidationUtils.validateStrategyParams(strategy);
    if (!validation.valid) {
      throw new Error(`策略参数验证失败: ${validation.errors.join(', ')}`);
    }

    // 清理数据
    const sanitizedStrategy = DataValidationUtils.sanitizeData(strategy);
    
    return await this.strategyDataAccess.saveStrategy(sanitizedStrategy);
  }

  async getStrategy(id: string): Promise<StrategyParams | null> {
    return await this.strategyDataAccess.getStrategy(id);
  }

  async getAllStrategies(): Promise<StrategyParams[]> {
    return await this.strategyDataAccess.getAllStrategies();
  }

  async getStrategiesByType(type: string): Promise<StrategyParams[]> {
    return await this.strategyDataAccess.getStrategiesByType(type);
  }

  async deleteStrategy(id: string): Promise<void> {
    // 删除策略
    await this.strategyDataAccess.deleteStrategy(id);
    
    // 删除相关计算结果
    await this.calculationDataAccess.deleteCalculationsByStrategy(id);
  }

  async searchStrategies(query: string): Promise<StrategyParams[]> {
    return await this.strategyDataAccess.searchStrategies(query);
  }

  async getStrategyStats() {
    return await this.strategyDataAccess.getStrategyStats();
  }

  // 计算结果相关操作
  async saveCalculation(calculation: CalculationResult): Promise<string> {
    // 验证数据
    const validation = DataValidationUtils.validateCalculationResult(calculation);
    if (!validation.valid) {
      throw new Error(`计算结果验证失败: ${validation.errors.join(', ')}`);
    }

    // 清理数据
    const sanitizedCalculation = DataValidationUtils.sanitizeData(calculation);
    
    return await this.calculationDataAccess.saveCalculation(sanitizedCalculation);
  }

  async getCalculation(id: string): Promise<CalculationResult | null> {
    return await this.calculationDataAccess.getCalculation(id);
  }

  async getAllCalculations(): Promise<CalculationResult[]> {
    return await this.calculationDataAccess.getAllCalculations();
  }

  async getCalculationsByStrategy(strategyId: string): Promise<CalculationResult[]> {
    return await this.calculationDataAccess.getCalculationsByStrategy(strategyId);
  }

  async getCalculationsByType(strategyType: string): Promise<CalculationResult[]> {
    return await this.calculationDataAccess.getCalculationsByType(strategyType);
  }

  async getRecentCalculations(limit?: number): Promise<CalculationResult[]> {
    return await this.calculationDataAccess.getRecentCalculations(limit);
  }

  async getCalculationStats() {
    return await this.calculationDataAccess.getCalculationStats();
  }

  // 数据库操作工具
  async backupDatabase(): Promise<DatabaseOperationResult> {
    return await DatabaseOperationUtils.backupDatabase();
  }

  async restoreDatabase(backupData: any): Promise<DatabaseOperationResult> {
    return await DatabaseOperationUtils.restoreDatabase(backupData);
  }

  async getDatabaseStats(): Promise<DatabaseOperationResult> {
    return await DatabaseOperationUtils.getDatabaseStats();
  }

  async cleanupDatabase(): Promise<DatabaseOperationResult> {
    return await DatabaseOperationUtils.cleanupDatabase();
  }

  async validateDataIntegrity(): Promise<DatabaseOperationResult> {
    return await DatabaseOperationUtils.validateDataIntegrity();
  }

  // 批量操作
  async batchSaveStrategies(strategies: StrategyParams[]): Promise<DatabaseOperationResult> {
    // 验证所有策略
    for (const strategy of strategies) {
      const validation = DataValidationUtils.validateStrategyParams(strategy);
      if (!validation.valid) {
        return {
          success: false,
          message: `策略 ${strategy.id} 验证失败: ${validation.errors.join(', ')}`
        };
      }
    }

    return await DatabaseOperationUtils.batchOperation('strategies', 'add', strategies);
  }

  async batchDeleteStrategies(strategyIds: string[]): Promise<void> {
    await this.strategyDataAccess.deleteStrategies(strategyIds);
  }

  // 清理过期数据
  async cleanupOldCalculations(maxAge?: number): Promise<number> {
    return await this.calculationDataAccess.cleanupOldCalculations(maxAge);
  }

  // 数据验证
  validateStrategyParams(params: any) {
    return DataValidationUtils.validateStrategyParams(params);
  }

  validateCalculationResult(result: any) {
    return DataValidationUtils.validateCalculationResult(result);
  }

  // 数据清理
  sanitizeData(data: any) {
    return DataValidationUtils.sanitizeData(data);
  }

  // 检查数据大小
  checkDataSize(data: any, maxSizeKB?: number) {
    return DataValidationUtils.checkDataSize(data, maxSizeKB);
  }
}

// 创建单例实例
export const dataAccessLayerRefactored = new DataAccessLayerRefactored();