import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid
} from '@mui/material';
import { CalculationResult } from '../../../types';

interface GridDipPnLAnalysisProps {
  result: CalculationResult;
  formatCurrency: (value: number) => string;
  formatPercentage: (value: number) => string;
}

export const GridDipPnLAnalysis: React.FC<GridDipPnLAnalysisProps> = ({
  result,
  formatCurrency,
  formatPercentage
}) => {
  if (!result.currentPriceAnalysis?.unrealizedPnL) {
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
  );
};