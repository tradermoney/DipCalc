import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography
} from '@mui/material';
import {
  ShowChart
} from '@mui/icons-material';

import { RSIParams, StrategyType, CalculationResult } from '../../types';
import { RSICalculator } from '../../services/calculators/RSICalculator';
import { dataAccessLayer } from '../../services/database';
import { RSIParameters } from './components/RSIParameters';
import { RSIResults } from './components/RSIResults';
import { RSICharts } from './components/RSICharts';
import { RSIActions } from './components/RSIActions';

export const RSIPage: React.FC = () => {
  const [params, setParams] = useState<Partial<RSIParams>>({
    name: 'RSI超卖批次策略',
    type: StrategyType.RSI,
    stepMode: 'percentage',
    rsiThreshold: 30,
    priceStep: 5,
    maxLevels: 8,
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
            basePrice: params.basePrice,
            isAddPosition: params.isAddPosition,
            existingPosition: params.existingPosition
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
        }
      } else {
        setResult(null);
      }
    }
  }, [params, currentPrice, currentRSI, useCurrentPrice]);

  const handleParamChange = (field: keyof RSIParams, value: any) => {
    setParams(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleCurrentPriceChange = (price: number) => {
    setCurrentPrice(price);
  };

  const handleCurrentRSIChange = (rsi: number) => {
    setCurrentRSI(rsi);
  };

  const handleUseCurrentPriceChange = (use: boolean) => {
    setUseCurrentPrice(use);
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
        <ShowChart />
        RSI超卖策略
      </Typography>
      
      <Grid container spacing={3}>
        {/* 参数设置 */}
        <Grid item xs={12} lg={4}>
          <RSIParameters
            params={params}
            currentPrice={currentPrice}
            currentRSI={currentRSI}
            useCurrentPrice={useCurrentPrice}
            errors={errors}
            onParamChange={handleParamChange}
            onCurrentPriceChange={handleCurrentPriceChange}
            onCurrentRSIChange={handleCurrentRSIChange}
            onUseCurrentPriceChange={handleUseCurrentPriceChange}
          />
          
          <RSIActions
            result={result}
            loading={loading}
            saved={saved}
            onSave={handleSave}
          />
        </Grid>

        {/* 计算结果 */}
        <Grid item xs={12} lg={8}>
          {result && (
            <>
              <RSIResults result={result} />
              <RSICharts result={result} />
            </>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};