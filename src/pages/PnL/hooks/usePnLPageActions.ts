import { useCallback } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { PnLParams, SpotTrade, StrategyParams, StrategyType } from '../../../types';
import { PnLCalculator } from '../../../services/calculators/pnlCalculator';
import { dataAccessLayer } from '../../../services/database';

interface UsePnLPageActionsProps {
  params: Partial<PnLParams>;
  inputValues: Record<string, string>;
  setParams: React.Dispatch<React.SetStateAction<Partial<PnLParams>>>;
  setResult: React.Dispatch<React.SetStateAction<any>>;
  setErrors: React.Dispatch<React.SetStateAction<string[]>>;
  setSnackbarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSnackbarMessage: React.Dispatch<React.SetStateAction<string>>;
  setSnackbarSeverity: React.Dispatch<React.SetStateAction<'success' | 'error'>>;
  setIsCalculating: React.Dispatch<React.SetStateAction<boolean>>;
  setInputValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setCurrentStrategyId: React.Dispatch<React.SetStateAction<string | undefined>>;
  deleteDraft: () => Promise<void>;
}

export const usePnLPageActions = ({
  params,
  inputValues,
  setParams,
  setResult,
  setErrors,
  setSnackbarOpen,
  setSnackbarMessage,
  setSnackbarSeverity,
  setIsCalculating,
  setInputValues,
  setCurrentStrategyId,
  deleteDraft
}: UsePnLPageActionsProps) => {
  // Generate unique ID
  const generateId = useCallback(() => `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, []);

  // Get input value
  const getInputValue = useCallback((id: string, field: 'price' | 'amount' | 'feeRate', fallbackValue: number): string => {
    const key = `${id}-${field}`;
    return inputValues[key] ?? fallbackValue.toString();
  }, [inputValues]);

  // Handle input change
  const handleInputChange = useCallback((id: string, field: 'price' | 'amount' | 'feeRate', value: string) => {
    const key = `${id}-${field}`;
    setInputValues(prev => ({
      ...prev,
      [key]: value
    }));

    // Convert to number and update trade
    const numValue = value === '' ? 0 : parseFloat(value);
    if (!isNaN(numValue)) {
      setParams(prev => ({
        ...prev,
        trades: prev.trades?.map(trade =>
          trade.id === id ? { ...trade, [field]: numValue } : trade
        ) || [],
        updatedAt: new Date()
      }));
    }
  }, [setParams, setInputValues]);

  // Register input ref
  const registerInputRef = useCallback((key: string) => {
    return (element: HTMLInputElement | null) => {
      // Currently no special handling needed, keep interface compatibility
    };
  }, []);

  // Handle input focus
  const handleInputFocus = useCallback((key: string) => {
    // Can add focus logic here
  }, []);

  // Handle input blur
  const handleInputBlur = useCallback((key: string) => {
    setInputValues(prev => {
      const newValues = { ...prev };
      delete newValues[key];
      return newValues;
    });
  }, [setInputValues]);

  // Add trade record
  const handleAddTrade = useCallback((type: 'BUY' | 'SELL') => {
    const newTrade: SpotTrade = {
      id: generateId(),
      type,
      price: 0,
      amount: 0,
      feeRate: 0.1,
      timestamp: new Date(),
      enabled: true
    };

    setParams(prev => ({
      ...prev,
      trades: [...(prev.trades || []), newTrade],
      updatedAt: new Date()
    }));
  }, [generateId, setParams]);

  // Insert trade record
  const handleInsertTrade = useCallback((index: number, direction: 'above' | 'below', type: 'BUY' | 'SELL') => {
    const newTrade: SpotTrade = {
      id: generateId(),
      type,
      price: 0,
      amount: 0,
      feeRate: 0.1,
      timestamp: new Date(),
      enabled: true
    };

    setParams(prev => {
      const newTrades = [...(prev.trades || [])];
      const insertIndex = direction === 'above' ? index : index + 1;
      newTrades.splice(insertIndex, 0, newTrade);
      return {
        ...prev,
        trades: newTrades,
        updatedAt: new Date()
      };
    });
  }, [generateId, setParams]);

  // Remove trade record
  const handleRemoveTrade = useCallback((id: string) => {
    setParams(prev => ({
      ...prev,
      trades: prev.trades?.filter(trade => trade.id !== id) || [],
      updatedAt: new Date()
    }));

    // Clean up related input values
    setInputValues(prev => {
      const newValues = { ...prev };
      delete newValues[`${id}-price`];
      delete newValues[`${id}-amount`];
      delete newValues[`${id}-feeRate`];
      return newValues;
    });
  }, [setParams, setInputValues]);

  // Update trade record
  const handleUpdateTrade = useCallback((id: string, field: keyof SpotTrade, value: any) => {
    setParams(prev => ({
      ...prev,
      trades: prev.trades?.map(trade =>
        trade.id === id ? { ...trade, [field]: value } : trade
      ) || [],
      updatedAt: new Date()
    }));
  }, [setParams]);

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setParams(prev => {
      const oldIndex = prev.trades?.findIndex(trade => trade.id === active.id) ?? -1;
      const newIndex = prev.trades?.findIndex(trade => trade.id === over.id) ?? -1;

      if (oldIndex === -1 || newIndex === -1) {
        return prev;
      }

      const newTrades = [...(prev.trades || [])];
      const [movedTrade] = newTrades.splice(oldIndex, 1);
      newTrades.splice(newIndex, 0, movedTrade);

      return {
        ...prev,
        trades: newTrades,
        updatedAt: new Date()
      };
    });
  }, [setParams]);

  // Validate and calculate
  const handleCalculate = useCallback(async () => {
    const validationErrors = PnLCalculator.validate(params);
    setErrors(validationErrors);

    if (validationErrors.length > 0) {
      setSnackbarMessage('请检查输入参数');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setIsCalculating(true);

    setTimeout(() => {
      try {
        const calculationResult = PnLCalculator.calculate(params as PnLParams);
        setResult(calculationResult);
        setSnackbarMessage('计算完成！');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } catch (error) {
        console.error('Calculation error:', error);
        setSnackbarMessage('计算出错，请检查输入参数');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setIsCalculating(false);
      }
    }, 300);
  }, [params, setErrors, setSnackbarMessage, setSnackbarSeverity, setSnackbarOpen, setIsCalculating, setResult]);

  // Clear all data
  const handleClear = useCallback(async () => {
    setParams({
      type: StrategyType.PNL,
      symbol: '',
      currentPrice: 0,
      trades: [],
      name: '现货P&L计算',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    setResult(null);
    setErrors([]);
    setInputValues({});

    // Delete draft
    await deleteDraft();
    setSnackbarMessage('已清空所有数据');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  }, [setParams, setResult, setErrors, setInputValues, deleteDraft, setSnackbarMessage, setSnackbarSeverity, setSnackbarOpen]);

  // Save strategy
  const handleSave = useCallback(async () => {
    try {
      const validationErrors = PnLCalculator.validate(params);
      if (validationErrors.length > 0) {
        setSnackbarMessage('请先添加交易记录后再保存');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      // Ensure strategy has a name
      const strategyName = params.name || '现货P&L计算';

      // Create full strategy object
      const strategyToSave: PnLParams = {
        id: params.id || `pnl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: strategyName,
        type: StrategyType.PNL,
        symbol: params.symbol || '',
        currentPrice: params.currentPrice || 0,
        trades: params.trades || [],
        createdAt: params.createdAt || new Date(),
        updatedAt: new Date()
      };

      // Save to database
      await dataAccessLayer.saveStrategy(strategyToSave);

      // Update current strategy ID
      setCurrentStrategyId(strategyToSave.id);

      setSnackbarMessage('策略保存成功！');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Failed to save strategy:', error);
      setSnackbarMessage('保存失败，请重试');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [params, setSnackbarMessage, setSnackbarSeverity, setSnackbarOpen, setCurrentStrategyId]);

  // Load strategy
  const handleLoadStrategy = useCallback((strategy: StrategyParams) => {
    if (strategy.type !== StrategyType.PNL) {
      setSnackbarMessage('该策略不是PnL策略，无法加载');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // Convert strategy type
    const pnlParams = strategy as PnLParams;
    setParams(pnlParams);
    setCurrentStrategyId(strategy.id);

    // Clean up input values
    setInputValues({});

    setSnackbarMessage(`已加载策略: ${strategy.name}`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  }, [setParams, setCurrentStrategyId, setInputValues, setSnackbarMessage, setSnackbarSeverity, setSnackbarOpen]);

  // Close snackbar
  const handleSnackbarClose = useCallback(() => {
    setSnackbarOpen(false);
  }, [setSnackbarOpen]);

  return {
    generateId,
    getInputValue,
    handleInputChange,
    registerInputRef,
    handleInputFocus,
    handleInputBlur,
    handleAddTrade,
    handleInsertTrade,
    handleRemoveTrade,
    handleUpdateTrade,
    handleDragEnd,
    handleCalculate,
    handleClear,
    handleSave,
    handleLoadStrategy,
    handleSnackbarClose
  };
};
