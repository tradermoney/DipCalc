import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  Chip
} from '@mui/material';
import { CalculationResult } from '../../../types';

interface GridDipResultsProps {
  result: CalculationResult | null;
  nextLevel?: { level: number; triggerPrice: number; investAmount: number; dropNeeded: number; } | null;
  errors: string[];
  formatCurrency: (value: number) => string;
  formatPercentage: (value: number) => string;
}

export const GridDipResults: React.FC<GridDipResultsProps> = ({
  result,
  nextLevel,
  errors,
  formatCurrency,
  formatPercentage
}) => {
  if (errors.length > 0) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </Alert>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <>
      {/* 概览卡片 */}
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

      {/* 风险指标 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            风险指标
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography color="text.secondary" variant="body2">
                  最大回撤
                </Typography>
                <Typography variant="h6" color="error">
                  {result.maxDrawdown ? formatPercentage(result.maxDrawdown) : '-'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography color="text.secondary" variant="body2">
                  风险评级
                </Typography>
                <Chip 
                  label="中" 
                  color="warning"
                  size="small"
                />
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography color="text.secondary" variant="body2">
                  资金利用率
                </Typography>
                <Typography variant="h6">
                  85%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography color="text.secondary" variant="body2">
                  预期收益率
                </Typography>
                <Typography variant="h6" color="success.main">
                  12.5%
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 当前价格分析 */}
      {result.currentPriceAnalysis && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              当前价格分析
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography color="text.secondary" variant="body2">
                  当前价格
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(result.currentPriceAnalysis.currentPrice)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="text.secondary" variant="body2">
                  当前盈亏
                </Typography>
                <Typography 
                  variant="h6" 
                  color={result.currentPriceAnalysis.unrealizedPnL >= 0 ? 'success.main' : 'error.main'}
                >
                  {formatCurrency(result.currentPriceAnalysis.unrealizedPnL)}
                  ({formatPercentage(result.currentPriceAnalysis.unrealizedPnLPercentage)})
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </>
  );
};