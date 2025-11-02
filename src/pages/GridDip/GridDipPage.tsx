import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography
} from '@mui/material';
import {
  TrendingDown
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
    name: '等距分批抄底策略',
    type: StrategyType.GRID_DIP,
    stepMode: 'absolute',
    lowerBound: 40000,
    upperBound: 50000,
    stepValue: 1000,
    basePrice: 50000,
    gridCount: 10,
    totalCapital: 10000
  });
  
  const [currentPrice, setCurrentPrice] = useState<number>(50000);
  const [useCurrentPrice, setUseCurrentPrice] = useState<boolean>(true);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  // 实时计算
  useEffect(() => {
    const isValidForCalculation = params.stepMode === 'absolute' 
      ? (params.lowerBound && params.upperBound && params.gridCount && params.totalCapital)
      : (params.stepValue && params.basePrice && params.gridCount && params.totalCapital);
      
    if (isValidForCalculation) {
      const validation = GridDipCalculator.validateParams(params);
      setErrors(validation.errors);
      
      if (validation.valid) {
        try {
          const fullParams: GridDipParams = {
            id: `griddip_${Date.now()}`,
            name: params.name || '等距分批抄底策略',
            type: StrategyType.GRID_DIP,
            createdAt: new Date(),
            updatedAt: new Date(),
            stepMode: params.stepMode || 'absolute',
            lowerBound: params.lowerBound || 0,
            upperBound: params.upperBound || 0,
            stepValue: params.stepValue || 0,
            basePrice: params.basePrice || 0,
            gridCount: params.gridCount!,
            totalCapital: params.totalCapital!
          };
          
          const calcResult = GridDipCalculator.calculate(fullParams);
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
        id: `griddip_${Date.now()}`,
        name: params.name || '等距分批抄底策略',
        type: StrategyType.GRID_DIP,
        createdAt: new Date(),
        updatedAt: new Date(),
        stepMode: params.stepMode || 'absolute',
        lowerBound: params.lowerBound || 0,
        upperBound: params.upperBound || 0,
        stepValue: params.stepValue || 0,
        basePrice: params.basePrice || 0,
        gridCount: params.gridCount!,
        totalCapital: params.totalCapital!
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
            lowerBound: params.lowerBound || 0,
            upperBound: params.upperBound || 0,
            stepValue: params.stepValue || 0,
            basePrice: params.basePrice || 0,
            gridCount: params.gridCount || 0,
            totalCapital: params.totalCapital || 0
          } as GridDipParams
        );
      } catch (error) {
        console.error('获取下一档位信息失败:', error);
        return null;
      }
    })() : null;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <TrendingDown color="primary" />
        等距分批抄底计算器
      </Typography>
      
      <Grid container spacing={3}>
        {/* 参数设置 */}
        <Grid item xs={12} lg={4}>
          <GridDipParameters
            params={params}
            currentPrice={currentPrice}
            useCurrentPrice={useCurrentPrice}
            errors={errors}
            onParamChange={handleParamChange}
            onCurrentPriceChange={handleCurrentPriceChange}
            onUseCurrentPriceChange={handleUseCurrentPriceChange}
          />
          
          <GridDipActions
            result={result}
            loading={loading}
            saved={saved}
            onSave={handleSave}
          />
        </Grid>

        {/* 计算结果 */}
        <Grid item xs={12} lg={8}>
          <GridDipResults
            result={result}
            nextLevel={nextLevel}
            errors={errors}
            formatCurrency={formatCurrency}
            formatPercentage={formatPercentage}
          />
          
          <GridDipTable
            result={result}
            nextLevel={nextLevel}
            formatCurrency={formatCurrency}
          />
        </Grid>
      </Grid>
    </Box>
  );
};