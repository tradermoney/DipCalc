import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Chip,
  Collapse
} from '@mui/material';
import { Save, Calculate, Clear, CloudDone, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { useSensor, useSensors, PointerSensor, DragEndEvent } from '@dnd-kit/core';
import { PnLParams, PnLCalculationResult, StrategyType, SpotTrade, StrategyParams } from '../../types';
import { PnLCalculator } from '../../services/calculators/pnlCalculator';
import { PnLResults } from './components/PnLResults';
import { SpotTradeTable } from './components';
import { StrategyList } from './components/StrategyList';
import { useAutoSave } from '../../hooks/useAutoSave';
import { dataAccessLayer } from '../../services/database';

export const PnLPage: React.FC = () => {
  const [params, setParams] = useState<Partial<PnLParams>>({
    type: StrategyType.PNL,
    symbol: '',
    currentPrice: 0,
    trades: [],
    name: '现货P&L计算',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const [result, setResult] = useState<PnLCalculationResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [isCalculating, setIsCalculating] = useState(false);

  // 策略列表状态
  const [showStrategyList, setShowStrategyList] = useState(false);
  const [currentStrategyId, setCurrentStrategyId] = useState<string | undefined>(undefined);

  // 输入框值管理（用于防抖编辑）
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  // 自动保存Hook
  const { isLoading: isSaving, lastSaved, restoreDraft, deleteDraft } = useAutoSave(
    '/pnl',
    params,
    inputValues,
    1500 // 1.5秒防抖
  );

  // 页面加载时恢复草稿
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

  // 拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // 生成唯一ID
  const generateId = () => `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // 获取输入框值
  const getInputValue = useCallback((id: string, field: 'price' | 'amount' | 'feeRate', fallbackValue: number): string => {
    const key = `${id}-${field}`;
    return inputValues[key] ?? fallbackValue.toString();
  }, [inputValues]);

  // 处理输入框值变化
  const handleInputChange = useCallback((id: string, field: 'price' | 'amount' | 'feeRate', value: string) => {
    const key = `${id}-${field}`;
    setInputValues(prev => ({
      ...prev,
      [key]: value
    }));

    // 转换为数字并更新交易记录
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
  }, []);

  // 注册输入框ref（用于未来扩展）
  const registerInputRef = useCallback((key: string) => {
    return (element: HTMLInputElement | null) => {
      // 目前不需要特殊处理，保持接口兼容性
    };
  }, []);

  // 处理输入框聚焦
  const handleInputFocus = useCallback((key: string) => {
    // 可以在这里添加聚焦逻辑
  }, []);

  // 处理输入框失焦
  const handleInputBlur = useCallback((key: string) => {
    // 失焦时清除输入值，使用真实值
    setInputValues(prev => {
      const newValues = { ...prev };
      delete newValues[key];
      return newValues;
    });
  }, []);

  // 添加交易记录
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
  }, []);

  // 插入交易记录
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
  }, []);

  // 删除交易记录
  const handleRemoveTrade = useCallback((id: string) => {
    setParams(prev => ({
      ...prev,
      trades: prev.trades?.filter(trade => trade.id !== id) || [],
      updatedAt: new Date()
    }));

    // 清理相关输入值
    setInputValues(prev => {
      const newValues = { ...prev };
      delete newValues[`${id}-price`];
      delete newValues[`${id}-amount`];
      delete newValues[`${id}-feeRate`];
      return newValues;
    });
  }, []);

  // 更新交易记录
  const handleUpdateTrade = useCallback((id: string, field: keyof SpotTrade, value: any) => {
    setParams(prev => ({
      ...prev,
      trades: prev.trades?.map(trade =>
        trade.id === id ? { ...trade, [field]: value } : trade
      ) || [],
      updatedAt: new Date()
    }));
  }, []);

  // 处理拖拽结束
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
  }, []);

  // 验证和计算
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
  }, [params]);

  // 清空所有数据
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

    // 删除草稿
    await deleteDraft();
    setSnackbarMessage('已清空所有数据');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  }, [deleteDraft]);

  // 保存策略
  const handleSave = useCallback(async () => {
    try {
      const validationErrors = PnLCalculator.validate(params);
      if (validationErrors.length > 0) {
        setSnackbarMessage('请先添加交易记录后再保存');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      // 确保策略有名称
      const strategyName = params.name || '现货P&L计算';

      // 创建完整策略对象
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

      // 保存到数据库
      await dataAccessLayer.saveStrategy(strategyToSave);

      // 更新当前策略ID
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
  }, [params]);

  // 加载策略
  const handleLoadStrategy = useCallback((strategy: StrategyParams) => {
    if (strategy.type !== StrategyType.PNL) {
      setSnackbarMessage('该策略不是PnL策略，无法加载');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // 转换策略类型
    const pnlParams = strategy as PnLParams;
    setParams(pnlParams);
    setCurrentStrategyId(strategy.id);

    // 清理输入值
    setInputValues({});

    setSnackbarMessage(`已加载策略: ${strategy.name}`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  }, []);

  const handleSnackbarClose = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  // 自动计算（当参数改变时）
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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            现货P&L计算器
          </Typography>
          <Box display="flex" alignItems="center" gap={2} mb={1}>
            <Typography variant="body1" color="text.secondary">
              支持多笔交易记录的现货交易盈亏计算
            </Typography>
            {/* 自动保存状态指示器 */}
            <Chip
              icon={<CloudDone />}
              label={isSaving ? '保存中...' : lastSaved ? `已自动保存: ${lastSaved.toLocaleTimeString()}` : '未保存'}
              color={isSaving ? 'warning' : lastSaved ? 'success' : 'default'}
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={showStrategyList ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            onClick={() => setShowStrategyList(!showStrategyList)}
          >
            {showStrategyList ? '隐藏策略列表' : '查看策略列表'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={handleClear}
          >
            清空
          </Button>
          <Button
            variant="outlined"
            startIcon={<Save />}
            onClick={handleSave}
          >
            保存
          </Button>
          <Button
            variant="contained"
            startIcon={isCalculating ? <CircularProgress size={20} color="inherit" /> : <Calculate />}
            onClick={handleCalculate}
            disabled={isCalculating}
          >
            {isCalculating ? '计算中...' : '计算'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* 策略列表 - 可折叠 */}
        <Grid item xs={12}>
          <Collapse in={showStrategyList}>
            <StrategyList
              onLoadStrategy={handleLoadStrategy}
              currentStrategyId={currentStrategyId}
            />
          </Collapse>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Typography variant="h6">
                  交易对信息
                </Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="交易对符号"
                    value={params.symbol || ''}
                    onChange={(e) => setParams(prev => ({ ...prev, symbol: e.target.value, updatedAt: new Date() }))}
                    placeholder="如: BTC/USDT, ETH/USDT"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="当前价格"
                    type="number"
                    value={params.currentPrice || ''}
                    onChange={(e) => setParams(prev => ({ ...prev, currentPrice: parseFloat(e.target.value) || 0, updatedAt: new Date() }))}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                    error={errors.some(e => e.includes('当前价格'))}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <SpotTradeTable
            trades={params.trades || []}
            sensors={sensors}
            onDragEnd={handleDragEnd}
            onAddTrade={handleAddTrade}
            insertTrade={handleInsertTrade}
            removeTrade={handleRemoveTrade}
            updateTrade={handleUpdateTrade}
            getInputValue={getInputValue}
            handleInputChange={handleInputChange}
            registerInputRef={registerInputRef}
            handleInputFocus={handleInputFocus}
            handleInputBlur={handleInputBlur}
          />
        </Grid>

        <Grid item xs={12}>
          <PnLResults
            result={result}
            symbol={params.symbol || 'N/A'}
          />
        </Grid>
      </Grid>

      {/* 使用说明 */}
      <Box mt={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              使用说明
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • <strong>策略管理</strong>：点击"查看策略列表"可以查看所有已保存的策略。支持加载已保存的策略和删除不需要的策略。
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • <strong>保存策略</strong>：点击"保存"按钮可以将当前交易记录保存为策略。支持多次保存同一策略（会覆盖之前的保存）。
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • <strong>添加交易记录</strong>：点击"添加买入"或"添加卖出"按钮来记录您的交易。可以添加多笔买卖交易，系统会自动计算累计持仓和盈亏。
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • <strong>拖拽排序</strong>：拖拽左侧的拖拽图标可以调整交易记录的顺序。系统会按照排序后的顺序计算持仓变化。
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • <strong>启用/禁用</strong>：点击启用复选框可以控制该笔交易是否参与计算。禁用后的交易记录会保留但不参与盈亏计算。
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • <strong>插入交易</strong>：点击某行的上箭头可以在该记录上方插入新交易，点击下箭头可以在下方插入。插入的交易会继承当前交易的类型。
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • <strong>计算逻辑</strong>：系统按照交易顺序计算累计持仓。买入增加持仓，卖出减少持仓并计算已实现盈亏。未卖出的部分计算未实现盈亏。
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};
