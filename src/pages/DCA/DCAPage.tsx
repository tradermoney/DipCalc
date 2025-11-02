import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography
} from '@mui/material';
import {
  Schedule
} from '@mui/icons-material';

import { DCAParams, StrategyType, CalculationResult } from '../../types';
import { DCACalculator } from '../../services/calculators/DCACalculator';
import { dataAccessLayer } from '../../services/database';
import { DCAParameters } from './components/DCAParameters';
import { DCAResults } from './components/DCAResults';
import { DCACharts } from './components/DCACharts';
import { DCAActions } from './components/DCAActions';

export const DCAPage: React.FC = () => {
  const [params, setParams] = useState<Partial<DCAParams>>({
    name: '定期定额投资策略',
    type: StrategyType.DCA,
    amountMode: 'fixed',
    fixedAmount: 1000,
    percentageAmount: 10,
    interval: 7,
    maxPeriods: 12,
    totalCapital: 15000,
    startPrice: 50000,
    isAddPosition: false,
    existingPosition: {
      holdings: 0,
      averageCost: 0,
      totalInvested: 0
    }
  });
  
  const [currentPrice, setCurrentPrice] = useState<number>(50000);
  const [currentPeriod, setCurrentPeriod] = useState<number>(1);
  const [useCurrentPrice, setUseCurrentPrice] = useState<boolean>(true);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  // 实时计算
  useEffect(() => {
    const isValidForCalculation = params.amountMode === 'fixed' 
      ? (params.fixedAmount && params.interval && params.maxPeriods && params.totalCapital)
      : (params.percentageAmount && params.interval && params.maxPeriods && params.totalCapital);
      
    if (isValidForCalculation) {
      const validation = DCACalculator.validateParams(params);
      setErrors(validation.errors);
      
      if (validation.valid) {
        try {
          const fullParams: DCAParams = {
            id: `dca_${Date.now()}`,
            name: params.name || '定期定额投资策略',
            type: StrategyType.DCA,
            createdAt: new Date(),
            updatedAt: new Date(),
            amountMode: params.amountMode || 'fixed',
            fixedAmount: params.fixedAmount || 0,
            percentageAmount: params.percentageAmount || 0,
            interval: params.interval!,
            maxPeriods: params.maxPeriods!,
            totalCapital: params.totalCapital!,
            startPrice: params.startPrice || 0,
            isAddPosition: params.isAddPosition,
            existingPosition: params.existingPosition
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
          const prog = {
            currentPeriod,
            totalPeriods: fullParams.maxPeriods,
            progressPercentage: (currentPeriod / fullParams.maxPeriods) * 100
          };
          setProgress(prog);
          
          // 获取建议
          const recs = DCACalculator.generateRecommendations(fullParams, stats.riskLevel);
          setRecommendations(recs);
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

  const handleCurrentPriceChange = (price: number) => {
    setCurrentPrice(price);
  };

  const handleCurrentPeriodChange = (period: number) => {
    setCurrentPeriod(period);
  };

  const handleUseCurrentPriceChange = (use: boolean) => {
    setUseCurrentPrice(use);
  };

  const handleSave = async () => {
    if (!result) return;
    
    setLoading(true);
    try {
      const fullParams: DCAParams = {
        id: `dca_${Date.now()}`,
        name: params.name || '定期定额投资策略',
        type: StrategyType.DCA,
        createdAt: new Date(),
        updatedAt: new Date(),
        amountMode: params.amountMode || 'fixed',
        fixedAmount: params.fixedAmount || 0,
        percentageAmount: params.percentageAmount || 0,
        interval: params.interval!,
        maxPeriods: params.maxPeriods!,
        totalCapital: params.totalCapital!,
        startPrice: params.startPrice || 0,
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Schedule />
        定期定额投资策略
      </Typography>
      
      <Grid container spacing={3}>
        {/* 参数设置 */}
        <Grid item xs={12} lg={4}>
          <DCAParameters
            params={params}
            currentPrice={currentPrice}
            currentPeriod={currentPeriod}
            useCurrentPrice={useCurrentPrice}
            errors={errors}
            onParamChange={handleParamChange}
            onCurrentPriceChange={handleCurrentPriceChange}
            onCurrentPeriodChange={handleCurrentPeriodChange}
            onUseCurrentPriceChange={handleUseCurrentPriceChange}
          />
          
          <DCAActions
            result={result}
            loading={loading}
            saved={saved}
            onSave={handleSave}
          />
        </Grid>

        {/* 计算结果 */}
        <Grid item xs={12} lg={8}>
          <DCAResults
            result={result}
            statistics={statistics}
            progress={progress}
            errors={errors}
            formatCurrency={formatCurrency}
            formatPercentage={formatPercentage}
          />
          
          <DCACharts
            result={result}
            recommendations={recommendations}
            formatCurrency={formatCurrency}
          />
        </Grid>
      </Grid>
    </Box>
  );
};