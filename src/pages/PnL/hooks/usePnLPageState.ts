import { useState, useEffect } from 'react';
import { PnLParams, PnLCalculationResult, StrategyType } from '../../../types';
import { PnLCalculator } from '../../../services/calculators/pnlCalculator';
import { useAutoSave } from '../../../hooks/useAutoSave';

interface UsePnLPageStateReturn {
  // State
  params: Partial<PnLParams>;
  result: PnLCalculationResult | null;
  errors: string[];
  snackbarOpen: boolean;
  snackbarMessage: string;
  snackbarSeverity: 'success' | 'error';
  isCalculating: boolean;
  showStrategyList: boolean;
  currentStrategyId: string | undefined;
  inputValues: Record<string, string>;
  isSaving: boolean;
  lastSaved: Date | null;

  // State Setters
  setParams: React.Dispatch<React.SetStateAction<Partial<PnLParams>>>;
  setResult: React.Dispatch<React.SetStateAction<PnLCalculationResult | null>>;
  setErrors: React.Dispatch<React.SetStateAction<string[]>>;
  setSnackbarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSnackbarMessage: React.Dispatch<React.SetStateAction<string>>;
  setSnackbarSeverity: React.Dispatch<React.SetStateAction<'success' | 'error'>>;
  setIsCalculating: React.Dispatch<React.SetStateAction<boolean>>;
  setShowStrategyList: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentStrategyId: React.Dispatch<React.SetStateAction<string | undefined>>;
  setInputValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export const usePnLPageState = (): UsePnLPageStateReturn & { deleteDraft: () => Promise<void> } => {
  // Core params state
  const [params, setParams] = useState<Partial<PnLParams>>({
    type: StrategyType.PNL,
    symbol: '',
    currentPrice: 0,
    trades: [],
    name: '现货P&L计算',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Calculation results
  const [result, setResult] = useState<PnLCalculationResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // UI state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [isCalculating, setIsCalculating] = useState(false);

  // Strategy list state
  const [showStrategyList, setShowStrategyList] = useState(false);
  const [currentStrategyId, setCurrentStrategyId] = useState<string | undefined>(undefined);

  // Input management state
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  // Auto-save hook
  const { isLoading: isSaving, lastSaved, restoreDraft, deleteDraft } = useAutoSave(
    '/pnl',
    params,
    inputValues,
    1500 // 1.5秒防抖
  );

  // Load draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      const draft = await restoreDraft();
      if (draft) {
        setParams(draft.data);
        setInputValues(draft.inputValues);
        setSnackbarMessage('已恢复上次的输入数据');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
    };

    loadDraft();
  }, [restoreDraft]);

  // Auto-calculate when params change
  useEffect(() => {
    const validationErrors = PnLCalculator.validate(params);
    if (validationErrors.length === 0 && params.trades && params.trades.length > 0 && params.currentPrice) {
      const timeoutId = setTimeout(() => {
        const calculationResult = PnLCalculator.calculate(params as PnLParams);
        setResult(calculationResult);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [params]);

  return {
    // State
    params,
    result,
    errors,
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    isCalculating,
    showStrategyList,
    currentStrategyId,
    inputValues,
    isSaving,
    lastSaved,

    // State Setters
    setParams,
    setResult,
    setErrors,
    setSnackbarOpen,
    setSnackbarMessage,
    setSnackbarSeverity,
    setIsCalculating,
    setShowStrategyList,
    setCurrentStrategyId,
    setInputValues,

    // Actions
    deleteDraft
  };
};
