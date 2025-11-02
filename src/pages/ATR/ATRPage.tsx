import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ExpandMore,
  Lightbulb,
  TrendingUp
} from '@mui/icons-material';

import { ATRParams, StrategyType, CalculationResult } from '../../types';
import { ATRCalculator } from '../../services/calculators/ATRCalculator';
import { dataAccessLayer } from '../../services/database';
import { OverviewCards } from '../shared/OverviewCards';
import { PnLAnalysis } from '../shared/PnLAnalysis';
import { ATRParameters } from './components/ATRParameters';
import { ATRProgress } from './components/ATRProgress';
import { ATRResultTable } from './components/ATRResultTable';

export const ATRPage: React.FC = () => {
  const [params, setParams] = useState<Partial<ATRParams>>({
    name: '动态阶梯策略',
    type: StrategyType.ATR,
    stepMode: 'percentage',
    baseStep: 5,
    atrMultiplier: 2,
    maxLevels: 10,
    atrPeriod: 14,
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
  const [statistics, setStatistics] = useState<any>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  // 模拟价格历史数据（实际应用中应该从API获取）
  const mockPriceHistory = useMemo(() => [
    52000, 51000, 51500, // high, low, close
    51800, 50500, 51200,
    51500, 49800, 50200,
    50800, 49200, 49500,
    50000, 48500, 49000,
    49500, 47800, 48200,
    48800, 47000, 47500,
    48000, 46500, 47000,
    47500, 46000, 46800,
    47200, 45500, 46000,
    46500, 45000, 45800,
    46200, 44800, 45200,
    45800, 44200, 44600,
    45000, 43800, 44200,
    44500, 43200, 43800
  ], []);

  // 实时计算
  useEffect(() => {
    if (params.baseStep && params.atrMultiplier && params.maxLevels && params.totalCapital) {
      const validation = ATRCalculator.validateParams(params);
      setErrors(validation.errors);
      
      if (validation.valid) {
        try {
          const fullParams: ATRParams = {
            id: `atr_${Date.now()}`,
            name: params.name || '动态阶梯策略',
            type: StrategyType.ATR,
            createdAt: new Date(),
            updatedAt: new Date(),
            stepMode: params.stepMode || 'percentage',
            baseStep: params.baseStep,
            atrMultiplier: params.atrMultiplier,
            maxLevels: params.maxLevels,
            atrPeriod: params.atrPeriod || 14,
            totalCapital: params.totalCapital,
            basePrice: params.basePrice,
            isAddPosition: params.isAddPosition,
            existingPosition: params.existingPosition
          };
          
          const calcResult = ATRCalculator.calculate(
            fullParams, 
            useCurrentPrice ? currentPrice : undefined,
            mockPriceHistory
          );
          setResult(calcResult);
          
          // 计算统计信息
          const stats = ATRCalculator.calculateStatistics(fullParams, calcResult.atrValue || 0);
          setStatistics(stats);
        } catch (error) {
          console.error('计算错误:', error);
          setResult(null);
          setStatistics(null);
        }
      } else {
        setResult(null);
        setStatistics(null);
      }
    }
  }, [params, currentPrice, useCurrentPrice, mockPriceHistory]);

  const handleParamChange = (field: keyof ATRParams, value: any) => {
    setParams(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!result) return;
    
    setLoading(true);
    try {
      const fullParams: ATRParams = {
        id: `atr_${Date.now()}`,
        name: params.name || '动态阶梯策略',
        type: StrategyType.ATR,
        createdAt: new Date(),
        updatedAt: new Date(),
        stepMode: params.stepMode || 'percentage',
        baseStep: params.baseStep!,
        atrMultiplier: params.atrMultiplier!,
        maxLevels: params.maxLevels!,
        atrPeriod: params.atrPeriod || 14,
        totalCapital: params.totalCapital!,
        leverageRatio: params.leverageRatio || 1,
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

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, width: '100%', maxWidth: '100%' }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TrendingUp color="primary" />
        动态阶梯计算器
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        基于ATR波动率动态调整档位间距，高波动时间距加大，低波动时间距缩小，适应市场变化。
      </Typography>

      <Grid container spacing={2}>
        {/* 参数设置 */}
        <Grid item xs={12} lg={4}>
          <ATRParameters
            params={params}
            currentPrice={currentPrice}
            useCurrentPrice={useCurrentPrice}
            onParamChange={handleParamChange}
            onCurrentPriceChange={setCurrentPrice}
            onUseCurrentPriceChange={setUseCurrentPrice}
            onSave={handleSave}
            canSave={!!result}
            loading={loading}
            saved={saved}
          />
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
          
          {/* 动态分析 */}
          {statistics && result && (
            <ATRProgress
              statistics={statistics}
              atrValue={result.atrValue || 0}
              basePrice={currentPrice}
            />
          )}
          
          {/* 策略建议 */}
          {statistics?.recommendations && (
            <Accordion sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Lightbulb />
                  <Typography variant="h6">策略建议</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {statistics.recommendations.map((rec: string, index: number) => (
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
              <OverviewCards result={result} />
              
              {/* 盈亏分析 */}
              {useCurrentPrice && result.currentPriceAnalysis?.unrealizedPnL !== undefined && (
                <PnLAnalysis result={result} />
              )}

              {/* 详细档位表格 */}
              <ATRResultTable result={result} />
            </>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};