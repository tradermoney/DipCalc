import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid
} from '@mui/material';
import { CalculationResult } from '../../types';

interface OverviewCardsProps {
  result: CalculationResult;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ result }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom>
                已投入资金
              </Typography>
              <Typography variant="h6">
                {formatCurrency(result.totalInvested)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom>
                平均成本
              </Typography>
              <Typography variant="h6">
                {result.averagePrice > 0 ? formatCurrency(result.averagePrice) : '-'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom>
                持仓数量
              </Typography>
              <Typography variant="h6">
                {result.totalHoldings.toFixed(4)}
              </Typography>
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

      {/* 补仓模式信息 */}
      {result.isAddPosition && result.existingPosition && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              补仓模式分析
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography color="text.secondary" variant="body2">
                  现有持仓
                </Typography>
                <Typography variant="h6">
                  {result.existingPosition.holdings.toFixed(4)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography color="text.secondary" variant="body2">
                  现有平均成本
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(result.existingPosition.averageCost)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography color="text.secondary" variant="body2">
                  新增投入
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(result.newInvested || 0)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography color="text.secondary" variant="body2">
                  新增持仓
                </Typography>
                <Typography variant="h6">
                  {(result.newHoldings || 0).toFixed(4)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography color="text.secondary" variant="body2">
                  合并后总投入
                </Typography>
                <Typography variant="h6">
                  {formatCurrency((result.existingPosition.totalInvested || 0) + (result.newInvested || 0))}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography color="text.secondary" variant="body2">
                  合并后总持仓
                </Typography>
                <Typography variant="h6">
                  {(result.existingPosition.holdings + (result.newHoldings || 0)).toFixed(4)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </>
  );
};