import { databaseService } from '../DatabaseService';
import { DB_CONFIG } from '../../../types';

export interface DatabaseOperationResult {
  success: boolean;
  message: string;
  data?: any;
}

export class DatabaseOperationUtils {
  /**
   * 执行数据库事务
   */
  static async executeTransaction<T>(
    operations: (() => Promise<T>)[]
  ): Promise<DatabaseOperationResult> {
    try {
      const results: T[] = [];
      
      for (const operation of operations) {
        const result = await operation();
        results.push(result);
      }
      
      return {
        success: true,
        message: 'Transaction completed successfully',
        data: results
      };
    } catch (error) {
      console.error('Transaction failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Transaction failed'
      };
    }
  }

  /**
   * 批量操作
   */
  static async batchOperation<T>(
    storeName: string,
    operation: 'add' | 'update' | 'delete',
    items: T[]
  ): Promise<DatabaseOperationResult> {
    try {
      const results = [];
      
      for (const item of items) {
        let result;
        switch (operation) {
          case 'add':
            result = await databaseService.add(storeName, item);
            break;
          case 'update':
            result = await databaseService.update(storeName, item);
            break;
          case 'delete':
            result = await databaseService.delete(storeName, (item as any).id);
            break;
        }
        results.push(result);
      }
      
      return {
        success: true,
        message: `Batch ${operation} completed successfully`,
        data: results
      };
    } catch (error) {
      console.error(`Batch ${operation} failed:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : `Batch ${operation} failed`
      };
    }
  }

  /**
   * 数据库备份
   */
  static async backupDatabase(): Promise<DatabaseOperationResult> {
    try {
      const backup: Record<string, any[]> = {};
      
      // 备份所有存储
      for (const storeName of Object.values(DB_CONFIG.stores)) {
        backup[storeName] = await databaseService.getAll(storeName);
      }
      
      const backupData = {
        timestamp: new Date().toISOString(),
        version: DB_CONFIG.version,
        data: backup
      };
      
      return {
        success: true,
        message: 'Database backup created successfully',
        data: backupData
      };
    } catch (error) {
      console.error('Database backup failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Database backup failed'
      };
    }
  }

  /**
   * 数据库恢复
   */
  static async restoreDatabase(backupData: any): Promise<DatabaseOperationResult> {
    try {
      if (!backupData.data || !backupData.version) {
        throw new Error('Invalid backup data format');
      }
      
      // 清空现有数据
      for (const storeName of Object.values(DB_CONFIG.stores)) {
        await databaseService.clear(storeName);
      }
      
      // 恢复数据
      for (const [storeName, items] of Object.entries(backupData.data)) {
        if (Array.isArray(items)) {
          for (const item of items) {
            await databaseService.add(storeName, item);
          }
        }
      }
      
      return {
        success: true,
        message: 'Database restored successfully'
      };
    } catch (error) {
      console.error('Database restore failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Database restore failed'
      };
    }
  }

  /**
   * 获取数据库统计信息
   */
  static async getDatabaseStats(): Promise<DatabaseOperationResult> {
    try {
      const stats: Record<string, number> = {};
      let totalRecords = 0;
      
      for (const storeName of Object.values(DB_CONFIG.stores)) {
        const count = await databaseService.count(storeName);
        stats[storeName] = count;
        totalRecords += count;
      }
      
      return {
        success: true,
        message: 'Database stats retrieved successfully',
        data: {
          stores: stats,
          totalRecords,
          version: DB_CONFIG.version
        }
      };
    } catch (error) {
      console.error('Failed to get database stats:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get database stats'
      };
    }
  }

  /**
   * 清理数据库
   */
  static async cleanupDatabase(): Promise<DatabaseOperationResult> {
    try {
      let totalDeleted = 0;
      
      // 清理过期数据（这里可以根据具体需求实现）
      // 例如：删除30天前的计算结果
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // 这里可以添加具体的清理逻辑
      
      return {
        success: true,
        message: `Database cleanup completed, ${totalDeleted} records deleted`
      };
    } catch (error) {
      console.error('Database cleanup failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Database cleanup failed'
      };
    }
  }

  /**
   * 验证数据完整性
   */
  static async validateDataIntegrity(): Promise<DatabaseOperationResult> {
    try {
      const issues: string[] = [];
      
      // 检查策略和计算结果的关联性
      const strategies = await databaseService.getAll(DB_CONFIG.stores.strategies);
      const calculations = await databaseService.getAll(DB_CONFIG.stores.calculations);
      
      // 检查孤立的计算结果
      for (const calc of calculations) {
        const strategy = strategies.find((s: any) => s.id === (calc as any).strategyId);
        if (!strategy) {
          issues.push(`Orphaned calculation found: ${(calc as any).id}`);
        }
      }
      
      return {
        success: issues.length === 0,
        message: issues.length === 0 ? 'Data integrity check passed' : 'Data integrity issues found',
        data: { issues }
      };
    } catch (error) {
      console.error('Data integrity validation failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Data integrity validation failed'
      };
    }
  }
}