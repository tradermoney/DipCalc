import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Alert
} from '@mui/material';
import { ShowChart } from '@mui/icons-material';

import { RSIParams, StrategyType, CalculationResult } from '../../types';
import { RSICalculator } from '../../services/calculators/RSICalculator';
import { dataAccessLayer } from '../../services/database';

// 导入拆分后的组件
import { RSIParametersForm } from './components/RSIParametersForm';
import { RSICurrentDataControl } from './components/RSICurrentDataControl';
import { RSIStrategyStatus } from './components/RSIStrategyStatus';
import { RSIRecommendations } from './components/RSIRecommendations';
import { RSIResults } from './components/RSIResults';
import { RSICharts } from './components/RSICharts';
import { RSIActions } from './components/RSIActions';

export const RSIPageRefactored: React.FC = () => {
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

  return (
    <Box sx={{ width: '100%', height: '100%', maxWidth: 'none' }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <ShowChart color="primary" />
        RSI超卖批次策略
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        基于RSI指标的超卖信号进行分批买入，在技术指标确认超卖时逐步建仓。
      </Typography>

      <Grid container spacing={2} sx={{ width: '100%', maxWidth: 'none' }}>
        {/* 参数设置 */}
        <Grid item xs={12} lg={4} sx={{ width: '100%', maxWidth: 'none' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <RSIParametersForm
              params={params}
              onParamChange={handleParamChange}
            />
            
            <RSICurrentDataControl
              currentPrice={currentPrice}
              currentRSI={currentRSI}
              useCurrentPrice={useCurrentPrice}
              onCurrentPriceChange={setCurrentPrice}
              onCurrentRSIChange={setCurrentRSI}
              onUseCurrentPriceChange={setUseCurrentPrice}
            />
            
            <RSIStrategyStatus status={strategyStatus} />
            
            <RSIRecommendations recommendations={recommendations} />
            
            <RSIActions
              result={result}
              loading={loading}
              saved={saved}
              onSave={handleSave}
            />
          </Box>
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
              <RSIResults result={result} />
              <RSICharts result={result} />
            </>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};