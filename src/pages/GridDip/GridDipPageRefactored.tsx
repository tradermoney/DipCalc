import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Alert
} from '@mui/material';
import { TrendingDown } from '@mui/icons-material';

import { GridDipParams, StrategyType, CalculationResult } from '../../types';
import { GridDipCalculator } from '../../services/calculators/GridDipCalculator';
import { dataAccessLayer } from '../../services/database';

// 导入拆分后的组件
import { GridDipParametersForm } from './components/GridDipParametersForm';
import { CurrentPriceControl } from './components/CurrentPriceControl';
import { GridDipOverviewCards } from './components/GridDipOverviewCards';
import { GridDipPnLAnalysis } from './components/GridDipPnLAnalysis';
import { GridDipNextLevelInfo } from './components/GridDipNextLevelInfo';
import { GridDipLevelsTable } from './components/GridDipLevelsTable';
import { GridDipSaveActions } from './components/GridDipSaveActions';

export const GridDipPageRefactored: React.FC = () => {
  const [params, setParams] = useState<Partial<GridDipParams>>({
    name: '等距分批策略',
    type: StrategyType.GRID_DIP,
    stepMode: 'absolute',
    lowerBound: 20000,
    upperBound: 30000,
    stepValue: 5,
    basePrice: 25000,
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

  // 获取下一档位信息
  const nextLevel = result && useCurrentPrice && errors.length === 0 ? 
    (() => {
      try {
        const stepMode = params.stepMode || 'absolute';
        
        const isValidParams = stepMode === 'absolute' 
          ? (params.lowerBound !== undefined && params.upperBound !== undefined && 
             params.lowerBound > 0 && params.upperBound > 0 && params.lowerBound < params.upperBound)
          : (params.stepValue !== undefined && params.basePrice !== undefined && 
             params.stepValue > 0 && params.basePrice > 0);
             
        if (!isValidParams || !params.gridCount || !params.totalCapital) {
          return null;
        }
        
        return GridDipCalculator.getNextTriggerLevel({
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
        } as GridDipParams);
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <GridDipParametersForm
              params={params}
              onParamChange={handleParamChange}
            />
            
            <CurrentPriceControl
              currentPrice={currentPrice}
              useCurrentPrice={useCurrentPrice}
              onCurrentPriceChange={setCurrentPrice}
              onUseCurrentPriceChange={setUseCurrentPrice}
            />
            
            <GridDipSaveActions
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
              <GridDipOverviewCards
                result={result}
                formatCurrency={formatCurrency}
              />

              <GridDipPnLAnalysis
                result={result}
                formatCurrency={formatCurrency}
                formatPercentage={formatPercentage}
              />

              <GridDipNextLevelInfo
                nextLevel={nextLevel}
                formatCurrency={formatCurrency}
              />

              <GridDipLevelsTable
                result={result}
                formatCurrency={formatCurrency}
              />
            </>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};