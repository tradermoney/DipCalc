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
  TrendingUp,
  ExpandMore,
  Assessment
} from '@mui/icons-material';

import { PyramidParams, StrategyType, CalculationResult } from '../../types';
import { PyramidCalculator } from '../../services/calculators/PyramidCalculator';
import { dataAccessLayer } from '../../services/database';

export const PyramidPage: React.FC = () => {
  const [params, setParams] = useState<Partial<PyramidParams>>({
    name: '金字塔加仓策略',
    type: StrategyType.PYRAMID,
    stepMode: 'percentage',
    initialPosition: 10,
    multiplier: 1.5,
    maxLevels: 8,
    priceStep: 5,
    totalCapital: 10000,
    basePrice: 50000
  });
  
  const [currentPrice, setCurrentPrice] = useState<number>(50000);
  const [useCurrentPrice, setUseCurrentPrice] = useState<boolean>(true);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<any>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  // 实时计算
  useEffect(() => {
    if (params.initialPosition && params.multiplier && params.maxLevels && 
        params.priceStep && params.totalCapital) {
      const validation = PyramidCalculator.validateParams(params);
      setErrors(validation.errors);
      
      if (validation.valid) {
        try {
          const fullParams: PyramidParams = {
            id: `pyramid_${Date.now()}`,
            name: params.name || '金字塔加仓策略',
            type: StrategyType.PYRAMID,
            createdAt: new Date(),
            updatedAt: new Date(),
            stepMode: params.stepMode || 'percentage',
            initialPosition: params.initialPosition,
            multiplier: params.multiplier,
            maxLevels: params.maxLevels,
            priceStep: params.priceStep,
            totalCapital: params.totalCapital,
            basePrice: params.basePrice
          };
          
          const calcResult = PyramidCalculator.calculate(
            fullParams, 
            useCurrentPrice ? currentPrice : undefined
          );
          setResult(calcResult);
          
          // 计算风险评估
          const risk = PyramidCalculator.calculateRiskAssessment(fullParams);
          setRiskAssessment(risk);
        } catch (error) {
          console.error('计算错误:', error);
          setResult(null);
          setRiskAssessment(null);
        }
      } else {
        setResult(null);
        setRiskAssessment(null);
      }
    }
  }, [params, currentPrice, useCurrentPrice]);

  const handleParamChange = (field: keyof PyramidParams, value: any) => {
    setParams(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!result) return;
    
    setLoading(true);
    try {
      const fullParams: PyramidParams = {
        id: `pyramid_${Date.now()}`,
        name: params.name || '金字塔加仓策略',
        type: StrategyType.PYRAMID,
        createdAt: new Date(),
        updatedAt: new Date(),
        stepMode: params.stepMode || 'percentage',
        initialPosition: params.initialPosition!,
        multiplier: params.multiplier!,
        maxLevels: params.maxLevels!,
        priceStep: params.priceStep!,
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

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'extreme': return 'error';
      default: return 'default';
    }
  };

  const getRiskLabel = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return '低风险';
      case 'medium': return '中等风险';
      case 'high': return '高风险';
      case 'extreme': return '极高风险';
      default: return '未知';
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, width: '100%', maxWidth: '100%' }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TrendingUp color="primary" />
        金字塔加仓计算器
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        跌得越深加仓越重，使用几何倍数快速摊低成本，适合强势币种的深度回调。
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
                label="起始仓位"
                type="number"
                value={params.initialPosition || ''}
                onChange={(e) => handleParamChange('initialPosition', Number(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                helperText="首次买入占总资金的比例"
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="加仓倍率"
                type="number"
                value={params.multiplier || ''}
                onChange={(e) => handleParamChange('multiplier', Number(e.target.value))}
                helperText="每档加仓金额的倍数"
                sx={{ mb: 2 }}
                inputProps={{ step: 0.1 }}
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
          
          {/* 风险评估 */}
          {riskAssessment && (
            <Accordion sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Assessment />
                  <Typography variant="h6">风险评估</Typography>
                  <Chip 
                    label={getRiskLabel(riskAssessment.riskLevel)}
                    color={getRiskColor(riskAssessment.riskLevel) as any}
                    size="small"
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography color="text.secondary">资金利用率</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={riskAssessment.capitalUtilization * 100}
                        sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                        color={getRiskColor(riskAssessment.riskLevel) as any}
                      />
                      <Typography variant="body2">
                        {formatPercentage(riskAssessment.capitalUtilization)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="text.secondary">安全档位</Typography>
                    <Typography variant="h6">
                      {riskAssessment.bankruptcyLevel} / {params.maxLevels}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="text.secondary">总资金需求</Typography>
                    <Typography variant="h6">
                      {formatCurrency(riskAssessment.totalRequiredCapital)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="text.secondary">建议最大倍率</Typography>
                    <Typography variant="h6">
                      {riskAssessment.maxSafeMultiplier}x
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>策略建议</Typography>
                    {riskAssessment.recommendations.map((rec: string, index: number) => (
                      <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                        {rec}
                      </Typography>
                    ))}
                  </Grid>
                </Grid>
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