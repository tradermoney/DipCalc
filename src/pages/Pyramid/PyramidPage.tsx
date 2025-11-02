import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography
} from '@mui/material';
import {
  TrendingUp
} from '@mui/icons-material';

import { PyramidParams, StrategyType, CalculationResult } from '../../types';
import { PyramidCalculator } from '../../services/calculators/PyramidCalculator';
import { dataAccessLayer } from '../../services/database';
import { PyramidParameters } from './components/PyramidParameters';
import { PyramidResults } from './components/PyramidResults';
import { PyramidCharts } from './components/PyramidCharts';
import { PyramidActions } from './components/PyramidActions';

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
    basePrice: 50000,
    isAddPosition: false,
    existingPosition: {
      holdings: 0,
      averageCost: 0,
      totalInvested: 0
    }
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
            basePrice: params.basePrice,
            isAddPosition: params.isAddPosition,
            existingPosition: params.existingPosition
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
        basePrice: params.basePrice,
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
        <TrendingUp />
        金字塔加仓策略
      </Typography>
      
      <Grid container spacing={3}>
        {/* 参数设置 */}
        <Grid item xs={12} lg={4}>
          <PyramidParameters
            params={params}
            currentPrice={currentPrice}
            useCurrentPrice={useCurrentPrice}
            errors={errors}
            onParamChange={handleParamChange}
            onCurrentPriceChange={handleCurrentPriceChange}
            onUseCurrentPriceChange={handleUseCurrentPriceChange}
          />
          
          <PyramidActions
            result={result}
            loading={loading}
            saved={saved}
            onSave={handleSave}
          />
        </Grid>

        {/* 计算结果 */}
        <Grid item xs={12} lg={8}>
          <PyramidResults
            result={result}
            riskAssessment={riskAssessment}
            errors={errors}
            formatCurrency={formatCurrency}
            formatPercentage={formatPercentage}
          />
          
          <PyramidCharts
            result={result}
            riskAssessment={riskAssessment}
            formatCurrency={formatCurrency}
          />
        </Grid>
      </Grid>
    </Box>
  );
};