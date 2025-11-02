import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Alert,
  Divider,
  InputAdornment,
  FormControlLabel,
  Switch,
  LinearProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio
} from '@mui/material';
import {
  Save,
  Schedule
} from '@mui/icons-material';

import { DCAParams, StrategyType, CalculationResult } from '../../types';
import { DCACalculator } from '../../services/calculators/DCACalculator';
import { dataAccessLayer } from '../../services/database';

export const DCAPage: React.FC = () => {
  const [params, setParams] = useState<Partial<DCAParams>>({
    name: '定投式抄底策略',
    type: StrategyType.DCA,
    amountMode: 'fixed',
    fixedAmount: 1000,
    percentageAmount: 10, // 默认10%
    interval: 7, // 7天
    maxPeriods: 12,
    totalCapital: 15000,
    startPrice: 50000
  });
  
  const [currentPrice, setCurrentPrice] = useState<number>(45000);
  const [currentPeriod, setCurrentPeriod] = useState<number>(3);
  const [useCurrentPrice, setUseCurrentPrice] = useState<boolean>(true);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  // 实时计算
  useEffect(() => {
    const amountMode = params.amountMode || 'fixed';
    const hasValidAmount = amountMode === 'fixed' 
      ? (params.fixedAmount && params.fixedAmount > 0)
      : (params.percentageAmount && params.percentageAmount > 0);
      
    if (hasValidAmount && params.maxPeriods && params.totalCapital) {
      const validation = DCACalculator.validateParams(params);
      setErrors(validation.errors);
      
      if (validation.valid) {
        try {
          const fullParams: DCAParams = {
            id: `dca_${Date.now()}`,
            name: params.name || '定投式抄底策略',
            type: StrategyType.DCA,
            createdAt: new Date(),
            updatedAt: new Date(),
            amountMode: params.amountMode || 'fixed',
            fixedAmount: params.fixedAmount || 0,
            percentageAmount: params.percentageAmount,
            interval: params.interval || 'weekly',
            maxPeriods: params.maxPeriods,
            totalCapital: params.totalCapital,
            startPrice: params.startPrice || 0
          };
          
          const calcResult = DCACalculator.calculate(
            fullParams, 
            useCurrentPrice ? currentPrice : undefined
          );
          setResult(calcResult);
          
          // 计算统计信息
          const stats = DCACalculator.calculateStatistics(fullParams);
          setStatistics(stats);
          
          // 计算进度
          const prog = DCACalculator.calculateProgress(fullParams, currentPeriod);
          setProgress(prog);
        } catch (error) {
          console.error('计算错误:', error);
          setResult(null);
          setStatistics(null);
          setProgress(null);
        }
      } else {
        setResult(null);
        setStatistics(null);
        setProgress(null);
      }
    }
  }, [params, currentPrice, currentPeriod, useCurrentPrice]);

  const handleParamChange = (field: keyof DCAParams, value: any) => {
    setParams(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!result) return;
    
    setLoading(true);
    try {
      const fullParams: DCAParams = {
        id: `dca_${Date.now()}`,
        name: params.name || '定投式抄底策略',
        type: StrategyType.DCA,
        createdAt: new Date(),
        updatedAt: new Date(),
        amountMode: params.amountMode || 'fixed',
        fixedAmount: params.fixedAmount || 0,
        percentageAmount: params.percentageAmount,
        interval: params.interval || 'weekly',
        maxPeriods: params.maxPeriods!,
        totalCapital: params.totalCapital!,
        startPrice: params.startPrice || 0
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

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, width: '100%', maxWidth: '100%' }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Schedule color="primary" />
        定投式抄底计算器
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        支持固定金额和按百分比两种模式，通过时间分散降低平均成本，适合长期投资。
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
              
              <FormControl component="fieldset" sx={{ mb: 2 }}>
                <FormLabel component="legend">投入金额模式</FormLabel>
                <RadioGroup
                  row
                  value={params.amountMode || 'fixed'}
                  onChange={(e) => handleParamChange('amountMode', e.target.value)}
                >
                  <FormControlLabel value="fixed" control={<Radio />} label="固定金额" />
                  <FormControlLabel value="percentage" control={<Radio />} label="按百分比" />
                </RadioGroup>
              </FormControl>
              
              {params.amountMode === 'fixed' ? (
                <TextField
                  fullWidth
                  label="定投金额"
                  type="number"
                  value={params.fixedAmount || ''}
                  onChange={(e) => handleParamChange('fixedAmount', Number(e.target.value))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  helperText="每期固定投入金额"
                  sx={{ mb: 2 }}
                />
              ) : (
                <TextField
                  fullWidth
                  label="投入百分比"
                  type="number"
                  value={params.percentageAmount || ''}
                  onChange={(e) => handleParamChange('percentageAmount', Number(e.target.value))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  helperText="每期投入总资金的百分比"
                  sx={{ mb: 2 }}
                />
              )}
              
              <TextField
                fullWidth
                label="投资期数"
                type="number"
                value={params.maxPeriods || ''}
                onChange={(e) => handleParamChange('maxPeriods', Number(e.target.value))}
                helperText="总共定投次数"
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
              
              <TextField
                fullWidth
                label="起始价格"
                type="number"
                value={params.startPrice || ''}
                onChange={(e) => handleParamChange('startPrice', Number(e.target.value))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                helperText="开始定投时的价格"
                sx={{ mb: 2 }}
              />
              
              <Divider sx={{ my: 2 }} />
              
              <TextField
                fullWidth
                label="当前期数"
                type="number"
                value={currentPeriod}
                onChange={(e) => setCurrentPeriod(Number(e.target.value))}
                helperText="已执行的定投次数"
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
              
              <Box sx={{ mt: 3 }}>
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
          
          {/* 进度信息 */}
          {progress && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  定投进度
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      {progress.completedPeriods} / {params.maxPeriods} 期
                    </Typography>
                    <Typography variant="body2">
                      {formatPercentage(progress.progress)}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress.progress * 100}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography color="text.secondary">已投入</Typography>
                    <Typography variant="h6">
                      {formatCurrency(progress.investedAmount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="text.secondary">剩余投入</Typography>
                    <Typography variant="h6">
                      {formatCurrency(progress.remainingAmount)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
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
            </>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};