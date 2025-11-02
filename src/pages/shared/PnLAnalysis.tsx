import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid
} from '@mui/material';
import { CalculationResult } from '../../types';

interface PnLAnalysisProps {
  result: CalculationResult;
}

export const PnLAnalysis: React.FC<PnLAnalysisProps> = ({ result }) => {
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

  if (!result.currentPriceAnalysis) {
    return null;
  }

  return (
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
              color={result.currentPriceAnalysis.unrealizedPnL >= 0 ? 'success.main' : 'error.main'}
            >
              {formatCurrency(result.currentPriceAnalysis.unrealizedPnL)}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography color="text.secondary">收益率</Typography>
            <Typography 
              variant="h6"
              color={result.currentPriceAnalysis.unrealizedPnL >= 0 ? 'success.main' : 'error.main'}
            >
              {formatPercentage(result.currentPriceAnalysis.unrealizedPnLPercentage)}
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
  );
};