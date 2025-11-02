import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Alert,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  FormLabel,
  RadioGroup,
  Radio,
  InputAdornment
} from '@mui/material';
import {
  TrendingDown,
  Save
} from '@mui/icons-material';

import { GridDipParams, StrategyType, CalculationResult } from '../../types';
import { GridDipCalculator } from '../../services/calculators/GridDipCalculator';
import { dataAccessLayer } from '../../services/database';
import { GridDipParameters } from './components/GridDipParameters';
import { GridDipResults } from './components/GridDipResults';
import { GridDipTable } from './components/GridDipTable';
import { GridDipActions } from './components/GridDipActions';

export const GridDipPage: React.FC = () => {
  const [params, setParams] = useState<Partial<GridDipParams>>({
    name: '等距分批策略',
    type: StrategyType.GRID_DIP,
    stepMode: 'absolute',
    lowerBound: 20000,
    upperBound: 30000,
    stepValue: 5, // 默认5%
    basePrice: 25000, // 默认基准价格
    gridCount: 10,
    totalCapital: 10000,
    isAddPosition: false,
    existingPosition: {
      holdings: 0,
      averageCost: 0,
      totalInvested: 0
    }
  });
  
  const [currentPrice, setCurrentPrice] = useState<number>(25000);
  const [useCurrentPrice, setUseCurrentPrice] = useState<boolean>(true);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  // 实时计算
  useEffect(() => {
    const stepMode = params.stepMode || 'absolute';
    const isValidForCalculation = stepMode === 'absolute' 
      ? (params.lowerBound && params.upperBound && params.gridCount && params.totalCapital)
      : (params.stepValue && params.basePrice && params.gridCount && params.totalCapital);
      
    if (isValidForCalculation) {
      const validation = GridDipCalculator.validateParams(params);
      setErrors(validation.errors);
      
      if (validation.valid) {
        try {
          const fullParams: GridDipParams = {
            id: `grid_dip_${Date.now()}`,
            name: params.name || '等距分批策略',
            type: StrategyType.GRID_DIP,
            createdAt: new Date(),
            updatedAt: new Date(),
            stepMode: params.stepMode || 'absolute',
            lowerBound: params.lowerBound || 0,
            upperBound: params.upperBound || 0,
            stepValue: params.stepValue,
            basePrice: params.basePrice,
            gridCount: params.gridCount!,
            totalCapital: params.totalCapital!,
            isAddPosition: params.isAddPosition,
            existingPosition: params.existingPosition
          };
          
          const calcResult = GridDipCalculator.calculate(
            fullParams, 
            useCurrentPrice ? currentPrice : undefined
          );
          setResult(calcResult);
        } catch (error) {
          console.error('计算错误:', error);
          setResult(null);
        }
      } else {
        setResult(null);
      }
    }
  }, [params, currentPrice, useCurrentPrice]);

  const handleParamChange = (field: keyof GridDipParams, value: any) => {
    setParams(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleCurrentPriceChange = (price: number) => {
    setCurrentPrice(price);
  };

  const handleUseCurrentPriceChange = (use: boolean) => {
    setUseCurrentPrice(use);
  };

  const handleSave = async () => {
    if (!result) return;
    
    setLoading(true);
    try {
      const fullParams: GridDipParams = {
        id: `grid_dip_${Date.now()}`,
        name: params.name || '等距分批策略',
        type: StrategyType.GRID_DIP,
        createdAt: new Date(),
        updatedAt: new Date(),
        stepMode: params.stepMode || 'absolute',
        lowerBound: params.lowerBound || 0,
        upperBound: params.upperBound || 0,
        stepValue: params.stepValue,
        basePrice: params.basePrice,
        gridCount: params.gridCount!,
        totalCapital: params.totalCapital!,
        isAddPosition: params.isAddPosition,
        existingPosition: params.existingPosition
      };
      
      await dataAccessLayer.saveStrategy(fullParams);
      await dataAccessLayer.saveCalculation(result);
      setSaved(true);
      
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  // 只有在参数有效且计算结果存在时才获取下一档位信息
  const nextLevel = result && useCurrentPrice && errors.length === 0 ? 
    (() => {
      try {
        const stepMode = params.stepMode || 'absolute';
        
        // 验证参数完整性
        const isValidParams = stepMode === 'absolute' 
          ? (params.lowerBound !== undefined && params.upperBound !== undefined && 
             params.lowerBound > 0 && params.upperBound > 0 && params.lowerBound < params.upperBound)
          : (params.stepValue !== undefined && params.basePrice !== undefined && 
             params.stepValue > 0 && params.basePrice > 0);
             
        if (!isValidParams || !params.gridCount || !params.totalCapital) {
          return null;
        }
        
        return GridDipCalculator.getNextTriggerLevel(
          {
            ...params,
            id: 'temp',
            name: '',
            type: StrategyType.GRID_DIP,
            createdAt: new Date(),
            updatedAt: new Date(),
            stepMode: stepMode,
            lowerBound: params.lowerBound!,
            upperBound: params.upperBound!,
            stepValue: params.stepValue,
            basePrice: params.basePrice,
            gridCount: params.gridCount,
            totalCapital: params.totalCapital
          } as GridDipParams
        );
      } catch (error) {
        console.error('获取下一档位信息失败:', error);
        return null;
      }
    })() : null;

  return (
    <Box sx={{ width: '100%', height: '100%', maxWidth: 'none' }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <TrendingDown color="primary" />
        等距分批抄底计算器
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        支持绝对值和百分比两种模式：绝对值模式将价格区间等分，百分比模式按固定百分比下跌加仓。
      </Typography>

      <Grid container spacing={2} sx={{ width: '100%', maxWidth: 'none' }}>
        {/* 参数设置 */}
        <Grid item xs={12} lg={4} sx={{ width: '100%', maxWidth: 'none' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                策略参数
              </Typography>
              
              <TextField
                fullWidth
                label="策略名称"
                value={params.name || ''}
                onChange={(e) => handleParamChange('name', e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <FormControl component="fieldset" sx={{ mb: 2 }}>
                <FormLabel component="legend">步长模式</FormLabel>
                <RadioGroup
                  row
                  value={params.stepMode || 'absolute'}
                  onChange={(e) => handleParamChange('stepMode', e.target.value)}
                >
                  <FormControlLabel value="absolute" control={<Radio />} label="绝对值" />
                  <FormControlLabel value="percentage" control={<Radio />} label="百分比" />
                </RadioGroup>
              </FormControl>
              
              {params.stepMode === 'absolute' ? (
                <>
                  <TextField
                    fullWidth
                    label="区间下限"
                    type="number"
                    value={params.lowerBound || ''}
                    onChange={(e) => handleParamChange('lowerBound', Number(e.target.value))}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    fullWidth
                    label="区间上限"
                    type="number"
                    value={params.upperBound || ''}
                    onChange={(e) => handleParamChange('upperBound', Number(e.target.value))}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    sx={{ mb: 2 }}
                  />
                </>
              ) : (
                <>
                  <TextField
                    fullWidth
                    label="基准价格"
                    type="number"
                    value={params.basePrice || ''}
                    onChange={(e) => handleParamChange('basePrice', Number(e.target.value))}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    sx={{ mb: 2 }}
                    helperText="每次加仓的基准价格"
                  />
                  
                  <TextField
                    fullWidth
                    label="下跌百分比"
                    type="number"
                    value={params.stepValue || ''}
                    onChange={(e) => handleParamChange('stepValue', Number(e.target.value))}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    sx={{ mb: 2 }}
                    helperText="每次下跌多少百分比时加仓"
                  />
                </>
              )}
              
              <TextField
                fullWidth
                label="网格数量"
                type="number"
                value={params.gridCount || ''}
                onChange={(e) => handleParamChange('gridCount', Number(e.target.value))}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="总本金"
                type="number"
                value={params.totalCapital || ''}
                onChange={(e) => handleParamChange('totalCapital', Number(e.target.value))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                sx={{ mb: 2 }}
              />
              
              <Divider sx={{ my: 2 }} />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={params.isAddPosition || false}
                    onChange={(e) => handleParamChange('isAddPosition', e.target.checked)}
                  />
                }
                label="补仓模式"
                sx={{ mb: 2 }}
              />
              
              {params.isAddPosition && (
                <>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, mb: 1 }}>
                    现有持仓信息
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="已持有数量"
                    type="number"
                    value={params.existingPosition?.holdings || ''}
                    onChange={(e) => handleParamChange('existingPosition', {
                      ...params.existingPosition,
                      holdings: Number(e.target.value)
                    })}
                    sx={{ mb: 2 }}
                    helperText="当前已持有的币种数量"
                  />
                  
                  <TextField
                    fullWidth
                    label="平均成本"
                    type="number"
                    value={params.existingPosition?.averageCost || ''}
                    onChange={(e) => handleParamChange('existingPosition', {
                      ...params.existingPosition,
                      averageCost: Number(e.target.value)
                    })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    sx={{ mb: 2 }}
                    helperText="现有持仓的平均成本价格"
                  />
                  
                  <TextField
                    fullWidth
                    label="已投入资金"
                    type="number"
                    value={params.existingPosition?.totalInvested || ''}
                    onChange={(e) => handleParamChange('existingPosition', {
                      ...params.existingPosition,
                      totalInvested: Number(e.target.value)
                    })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    sx={{ mb: 2 }}
                    helperText="现有持仓的总投入资金"
                  />
                  
                  <Divider sx={{ my: 2 }} />
                </>
              )}
              
              <FormControlLabel
                control={
                  <Switch
                    checked={useCurrentPrice}
                    onChange={(e) => setUseCurrentPrice(e.target.checked)}
                  />
                }
                label="使用当前价格"
              />
              
              {useCurrentPrice && (
                <TextField
                  fullWidth
                  label="当前价格"
                  type="number"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(Number(e.target.value))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  sx={{ mt: 2 }}
                />
              )}
              
              <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={!result || loading}
                  fullWidth
                >
                  {saved ? '已保存' : '保存策略'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 计算结果 */}
        <Grid item xs={12} lg={8} sx={{ width: '100%', maxWidth: 'none' }}>
          {errors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}
          
          {result && (
            <>
              {/* 概览卡片 */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography color="text.secondary" gutterBottom>
                        {result.isAddPosition ? '总投入资金' : '已投入资金'}
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(result.totalInvested)}
                      </Typography>
                      {result.isAddPosition && result.newInvested !== undefined && (
                        <Typography variant="caption" color="primary">
                          新增: {formatCurrency(result.newInvested)}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography color="text.secondary" gutterBottom>
                        {result.isAddPosition ? '综合平均成本' : '平均成本'}
                      </Typography>
                      <Typography variant="h6">
                        {result.averagePrice > 0 ? formatCurrency(result.averagePrice) : '-'}
                      </Typography>
                      {result.isAddPosition && result.originalAverageCost && (
                        <Typography variant="caption" color="text.secondary">
                          原成本: {formatCurrency(result.originalAverageCost)}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography color="text.secondary" gutterBottom>
                        {result.isAddPosition ? '总持仓数量' : '持仓数量'}
                      </Typography>
                      <Typography variant="h6">
                        {result.totalHoldings.toFixed(4)}
                      </Typography>
                      {result.isAddPosition && result.newHoldings !== undefined && (
                        <Typography variant="caption" color="primary">
                          新增: {result.newHoldings.toFixed(4)}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography color="text.secondary" gutterBottom>
                        剩余资金
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(result.remainingCapital)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* 盈亏信息 */}
              {useCurrentPrice && result.currentPriceAnalysis?.unrealizedPnL !== undefined && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      盈亏分析
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography color="text.secondary">未实现盈亏</Typography>
                        <Typography 
                          variant="h6" 
                          color={(result.currentPriceAnalysis?.unrealizedPnL || 0) >= 0 ? 'success.main' : 'error.main'}
                        >
                          {formatCurrency(result.currentPriceAnalysis?.unrealizedPnL || 0)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography color="text.secondary">收益率</Typography>
                        <Typography 
                          variant="h6"
                          color={(result.currentPriceAnalysis?.unrealizedPnL || 0) >= 0 ? 'success.main' : 'error.main'}
                        >
                          {result.totalInvested > 0 ? 
                          formatPercentage((result.currentPriceAnalysis?.unrealizedPnL || 0) / result.totalInvested) : '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography color="text.secondary">最大回撤</Typography>
                        <Typography variant="h6" color="error.main">
                          {result.maxDrawdown ? formatPercentage(result.maxDrawdown) : '-'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* 下一档位信息 */}
              {nextLevel && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    下一档位信息
                  </Typography>
                  <Typography variant="body2">
                    第 {nextLevel.level} 档：触发价格 {formatCurrency(nextLevel.triggerPrice)}，
                    投入金额 {formatCurrency(nextLevel.investAmount)}，
                    还需下跌 {nextLevel.dropNeeded.toFixed(2)}%
                  </Typography>
                </Alert>
              )}

              {/* 详细档位表格 */}
              <Card sx={{ width: '100%', maxWidth: 'none' }}>
                <CardContent sx={{ width: '100%', maxWidth: 'none', p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    档位详情
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ width: '100%', maxWidth: 'none', overflow: 'auto' }}>
                    <Table size="small" sx={{ width: '100%', maxWidth: 'none', minWidth: 650 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>档位</TableCell>
                          <TableCell align="right">触发价格</TableCell>
                          <TableCell align="right">投入金额</TableCell>
                          <TableCell align="right">获得数量</TableCell>
                          <TableCell align="right">累计投入</TableCell>
                          <TableCell align="right">累计持仓</TableCell>
                          <TableCell align="right">平均成本</TableCell>
                          <TableCell align="center">状态</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {result.levels.map((level) => (
                          <TableRow 
                            key={level.level}
                            sx={{
                              backgroundColor: level.triggered ? 'action.selected' : 'inherit'
                            }}
                          >
                            <TableCell>{level.level}</TableCell>
                            <TableCell align="right">
                              {formatCurrency(level.triggerPrice)}
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(level.investAmount)}
                            </TableCell>
                            <TableCell align="right">
                              {level.holdings.toFixed(4)}
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(level.cumulativeInvested)}
                            </TableCell>
                            <TableCell align="right">
                              {level.cumulativeHoldings.toFixed(4)}
                            </TableCell>
                            <TableCell align="right">
                              {level.averageCost > 0 ? 
                                formatCurrency(level.averageCost) : '-'}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={level.triggered ? '已触发' : '待触发'}
                                color={level.triggered ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};