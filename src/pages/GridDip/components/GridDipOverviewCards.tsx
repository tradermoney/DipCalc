import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography
} from '@mui/material';
import { CalculationResult } from '../../../types';

interface GridDipOverviewCardsProps {
  result: CalculationResult;
  formatCurrency: (value: number) => string;
}

export const GridDipOverviewCards: React.FC<GridDipOverviewCardsProps> = ({
  result,
  formatCurrency
}) => {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={6} sm={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography color="text.secondary" gutterBottom>
              {result.isAddPosition ? '总投入资金' : '已投入资金'}
            </Typography>
            <Typography variant="h6">
              {formatCurrency(result.totalInvested)}
            </Typography>
            {result.isAddPosition && result.newInvested !== undefined && (
              <Typography variant="caption" color="primary">
                新增: {formatCurrency(result.newInvested)}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={6} sm={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography color="text.secondary" gutterBottom>
              {result.isAddPosition ? '综合平均成本' : '平均成本'}
            </Typography>
            <Typography variant="h6">
              {result.averagePrice > 0 ? formatCurrency(result.averagePrice) : '-'}
            </Typography>
            {result.isAddPosition && result.originalAverageCost && (
              <Typography variant="caption" color="text.secondary">
                原成本: {formatCurrency(result.originalAverageCost)}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={6} sm={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography color="text.secondary" gutterBottom>
              {result.isAddPosition ? '总持仓数量' : '持仓数量'}
            </Typography>
            <Typography variant="h6">
              {result.totalHoldings.toFixed(4)}
            </Typography>
            {result.isAddPosition && result.newHoldings !== undefined && (
              <Typography variant="caption" color="primary">
                新增: {result.newHoldings.toFixed(4)}
              </Typography>
            )}
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
  );
};