import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Chip,
  Divider,
  InputAdornment,
  FormControlLabel,
  Switch,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Save,
  ShowChart,
  TrendingDown,
  TrendingUp,
  ExpandMore,
  Lightbulb
} from '@mui/icons-material';

import { RSIParams, StrategyType, CalculationResult } from '../../types';
import { RSICalculator } from '../../services/calculators/RSICalculator';
import { dataAccessLayer } from '../../services/database';

export const RSIPage: React.FC = () => {
  const [params, setParams] = useState<Partial<RSIParams>>({
    name: 'RSI超卖批次策略',
    type: StrategyType.RSI,
    stepMode: 'percentage',
    rsiThreshold: 30,
    priceStep: 5,
    maxLevels: 8,
    totalCapital: 10000,
    basePrice: 50000
  });
  
  const [currentPrice, setCurrentPrice] = useState<number>(50000);
  const [currentRSI, setCurrentRSI] = useState<number>(35);
  const [useCurrentPrice, setUseCurrentPrice] = useState<boolean>(true);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [strategyStatus, setStrategyStatus] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  // 实时计算
  useEffect(() => {
    if (params.rsiThreshold && params.priceStep && params.maxLevels && params.totalCapital) {
      const validation = RSICalculator.validateParams(params);
      setErrors(validation.errors);
      
      if (validation.valid) {
        try {
          const fullParams: RSIParams = {
            id: `rsi_${Date.now()}`,
            name: params.name || 'RSI超卖批次策略',
            type: StrategyType.RSI,
            createdAt: new Date(),
            updatedAt: new Date(),
            stepMode: params.stepMode || 'percentage',
            rsiThreshold: params.rsiThreshold,
            priceStep: params.priceStep,
            maxLevels: params.maxLevels,
            totalCapital: params.totalCapital,
            basePrice: params.basePrice
          };
          
          const calcResult = RSICalculator.calculate(
            fullParams, 
            useCurrentPrice ? currentPrice : undefined,
            currentRSI
          );
          setResult(calcResult);
          
          // 获取策略状态
          const status = RSICalculator.getStrategyStatus(fullParams, currentRSI, currentPrice);
          setStrategyStatus(status);
          
          // 获取建议
          const recs = RSICalculator.generateRecommendations(fullParams, currentRSI);
          setRecommendations(recs);
        } catch (error) {
          console.error('计算错误:', error);
          setResult(null);
          setStrategyStatus(null);
          setRecommendations([]);
        }
      } else {
        setResult(null);
        setStrategyStatus(null);
        setRecommendations([]);
      }
    }
  }, [params, currentPrice, currentRSI, useCurrentPrice]);

  const handleParamChange = (field: keyof RSIParams, value: any) => {
    setParams(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!result) return;
    
    setLoading(true);
    try {
      const fullParams: RSIParams = {
        id: `rsi_${Date.now()}`,
        name: params.name || 'RSI超卖批次策略',
        type: StrategyType.RSI,
        createdAt: new Date(),
        updatedAt: new Date(),
        stepMode: params.stepMode || 'percentage',
        rsiThreshold: params.rsiThreshold!,
        priceStep: params.priceStep!,
        maxLevels: params.maxLevels!,
        totalCapital: params.totalCapital!,
        basePrice: params.basePrice
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

  const getRSIColor = (rsi: number) => {
    if (rsi >= 70) return 'error';
    if (rsi >= 50) return 'warning';
    if (rsi >= 30) return 'info';
    return 'success';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'success';
      case 'active': return 'primary';
      case 'oversold': return 'warning';
      case 'waiting': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, width: '100%', maxWidth: '100%' }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ShowChart color="primary" />
        RSI超卖批次计算器
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        只有RSI低于阈值时才开始抄底，结合技术指标过滤，避免接飞刀。
      </Typography>

      <Grid container spacing={2}>
        {/* 参数设置 */}
        <Grid item xs={12} lg={4}>
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
              
              <TextField
                fullWidth
                label="RSI阈值"
                type="number"
                value={params.rsiThreshold || ''}
                onChange={(e) => handleParamChange('rsiThreshold', Number(e.target.value))}
                helperText="RSI低于此值时开始抄底"
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="价格步长"
                type="number"
                value={params.priceStep || ''}
                onChange={(e) => handleParamChange('priceStep', Number(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                helperText="每档触发的跌幅"
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="最大档数"
                type="number"
                value={params.maxLevels || ''}
                onChange={(e) => handleParamChange('maxLevels', Number(e.target.value))}
                helperText="最多加仓次数"
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
              
              <Typography variant="subtitle2" gutterBottom>
                市场数据
              </Typography>
              
              <TextField
                fullWidth
                label="当前RSI"
                type="number"
                value={currentRSI}
                onChange={(e) => setCurrentRSI(Number(e.target.value))}
                InputProps={{
                  endAdornment: (
                    <Chip 
                      label={strategyStatus?.rsiLevel || ''}
                      color={getRSIColor(currentRSI) as any}
                      size="small"
                    />
                  ),
                }}
                sx={{ mb: 2 }}
              />
              
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
        <Grid item xs={12} lg={8}>
          {errors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}
          
          {/* 策略状态 */}
          {strategyStatus && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="h6">策略状态</Typography>
                  <Chip 
                    label={strategyStatus.message}
                    color={getStatusColor(strategyStatus.status) as any}
                    icon={strategyStatus.rsiConditionMet ? <TrendingDown /> : <TrendingUp />}
                  />
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography color="text.secondary">当前RSI</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={currentRSI}
                        sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                        color={getRSIColor(currentRSI) as any}
                      />
                      <Typography variant="body2">{currentRSI}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="text.secondary">距离阈值</Typography>
                    <Typography variant="h6">
                      {strategyStatus.rsiDistance.toFixed(1)} 点
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
          
          {/* 策略建议 */}
          {recommendations.length > 0 && (
            <Accordion sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Lightbulb />
                  <Typography variant="h6">策略建议</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {recommendations.map((rec, index) => (
                  <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                    {rec}
                  </Typography>
                ))}
              </AccordionDetails>
            </Accordion>
          )}
          
          {result && (
            <>
              {/* 概览卡片 */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography color="text.secondary" gutterBottom>
                        已投入资金
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(result.totalInvested)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography color="text.secondary" gutterBottom>
                        平均成本
                      </Typography>
                      <Typography variant="h6">
                        {result.averagePrice > 0 ? formatCurrency(result.averagePrice) : '-'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography color="text.secondary" gutterBottom>
                        持仓数量
                      </Typography>
                      <Typography variant="h6">
                        {result.totalHoldings.toFixed(4)}
                      </Typography>
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

              {/* 详细档位表格 */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    档位详情
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
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
                            <TableCell>
                              {level.level}
                              {level.level === 1 && (
                                <Chip 
                                  label="RSI" 
                                  size="small" 
                                  color="primary" 
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </TableCell>
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
                              {level.triggered ? formatCurrency(level.cumulativeInvested) : '-'}
                            </TableCell>
                            <TableCell align="right">
                              {level.triggered ? level.cumulativeHoldings.toFixed(4) : '-'}
                            </TableCell>
                            <TableCell align="right">
                              {level.triggered && level.averageCost > 0 ? 
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