export class DataValidationUtils {
  /**
   * 验证策略参数
   */
  static validateStrategyParams(params: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 基本字段验证
    if (!params.id || typeof params.id !== 'string') {
      errors.push('策略ID不能为空且必须为字符串');
    }

    if (!params.name || typeof params.name !== 'string') {
      errors.push('策略名称不能为空且必须为字符串');
    }

    if (!params.type || typeof params.type !== 'string') {
      errors.push('策略类型不能为空且必须为字符串');
    }

    if (!params.totalCapital || typeof params.totalCapital !== 'number' || params.totalCapital <= 0) {
      errors.push('总本金必须为正数');
    }

    // 日期验证
    if (params.createdAt && !(params.createdAt instanceof Date) && !this.isValidDateString(params.createdAt)) {
      errors.push('创建时间格式无效');
    }

    if (params.updatedAt && !(params.updatedAt instanceof Date) && !this.isValidDateString(params.updatedAt)) {
      errors.push('更新时间格式无效');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 验证计算结果
   */
  static validateCalculationResult(result: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 基本字段验证
    if (!result.id || typeof result.id !== 'string') {
      errors.push('计算结果ID不能为空且必须为字符串');
    }

    if (!result.strategyType || typeof result.strategyType !== 'string') {
      errors.push('策略类型不能为空且必须为字符串');
    }

    if (typeof result.totalInvested !== 'number' || result.totalInvested < 0) {
      errors.push('总投入金额必须为非负数');
    }

    if (typeof result.totalHoldings !== 'number' || result.totalHoldings < 0) {
      errors.push('总持仓数量必须为非负数');
    }

    if (typeof result.averagePrice !== 'number' || result.averagePrice < 0) {
      errors.push('平均价格必须为非负数');
    }

    if (typeof result.remainingCapital !== 'number' || result.remainingCapital < 0) {
      errors.push('剩余资金必须为非负数');
    }

    // 档位数据验证
    if (!Array.isArray(result.levels)) {
      errors.push('档位数据必须为数组');
    } else {
      result.levels.forEach((level: any, index: number) => {
        if (typeof level.level !== 'number' || level.level <= 0) {
          errors.push(`第${index + 1}个档位的档位号无效`);
        }
        if (typeof level.triggerPrice !== 'number' || level.triggerPrice <= 0) {
          errors.push(`第${index + 1}个档位的触发价格无效`);
        }
        if (typeof level.investAmount !== 'number' || level.investAmount < 0) {
          errors.push(`第${index + 1}个档位的投入金额无效`);
        }
        if (typeof level.holdings !== 'number' || level.holdings < 0) {
          errors.push(`第${index + 1}个档位的持仓数量无效`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 验证用户设置
   */
  static validateUserSettings(settings: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!settings.id || typeof settings.id !== 'string') {
      errors.push('设置ID不能为空且必须为字符串');
    }

    if (settings.theme && !['light', 'dark', 'auto'].includes(settings.theme)) {
      errors.push('主题设置必须为 light、dark 或 auto');
    }

    if (settings.currency && typeof settings.currency !== 'string') {
      errors.push('货币设置必须为字符串');
    }

    if (settings.language && typeof settings.language !== 'string') {
      errors.push('语言设置必须为字符串');
    }

    if (settings.autoSave !== undefined && typeof settings.autoSave !== 'boolean') {
      errors.push('自动保存设置必须为布尔值');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 验证历史记录
   */
  static validateHistoryRecord(record: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!record.id || typeof record.id !== 'string') {
      errors.push('历史记录ID不能为空且必须为字符串');
    }

    if (!record.strategyId || typeof record.strategyId !== 'string') {
      errors.push('策略ID不能为空且必须为字符串');
    }

    if (!record.action || !['create', 'update', 'delete', 'calculate'].includes(record.action)) {
      errors.push('操作类型必须为 create、update、delete 或 calculate');
    }

    if (!record.timestamp || !(record.timestamp instanceof Date) && !this.isValidDateString(record.timestamp)) {
      errors.push('时间戳格式无效');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 检查是否为有效的日期字符串
   */
  private static isValidDateString(dateString: any): boolean {
    if (typeof dateString !== 'string') return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  /**
   * 清理和标准化数据
   */
  static sanitizeData(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === 'string') {
      return data.trim();
    }

    if (typeof data === 'number') {
      return isNaN(data) ? 0 : data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }

    if (typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeData(value);
      }
      return sanitized;
    }

    return data;
  }

  /**
   * 检查数据大小限制
   */
  static checkDataSize(data: any, maxSizeKB: number = 1024): { valid: boolean; sizeKB: number } {
    const jsonString = JSON.stringify(data);
    const sizeKB = new Blob([jsonString]).size / 1024;
    
    return {
      valid: sizeKB <= maxSizeKB,
      sizeKB: Math.round(sizeKB * 100) / 100
    };
  }
}