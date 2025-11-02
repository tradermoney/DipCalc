import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Box,
  Chip,
  Alert
} from '@mui/material';
import {
  Security,
  TrendingDown,
  ShowChart,
  Assessment
} from '@mui/icons-material';
import { RiskMetrics } from '../../services/risk/RiskManager';

interface RiskMetricsCardProps {
  metrics: RiskMetrics;
}

export const RiskMetricsCard: React.FC<RiskMetricsCardProps> = ({ metrics }) => {
  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'extreme': return 'error';
      default: return 'default';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'low': return '低风险';
      case 'medium': return '中等风险';
      case 'high': return '高风险';
      case 'extreme': return '极高风险';
      default: return '未知';
    }
  };

  const getSharpeRatingColor = (ratio: number) => {
    if (ratio > 1) return 'success';
    if (ratio > 0.5) return 'warning';
    return 'error';
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Security />
          <Typography variant="h6">风险指标</Typography>
          <Chip 
            label={getRiskLabel(metrics.riskLevel)}
            color={getRiskColor(metrics.riskLevel) as any}
          />
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TrendingDown fontSize="small" />
              <Typography color="text.secondary">最大回撤</Typography>
            </Box>
            <Typography variant="h6" color="error.main">
              {formatPercentage(metrics.maxDrawdown)}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(100, metrics.maxDrawdown * 500)}
              color="error"
              sx={{ mt: 1, height: 6, borderRadius: 3 }}
            />
          </Grid>

          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ShowChart fontSize="small" />
              <Typography color="text.secondary">波动率</Typography>
            </Box>
            <Typography variant="h6">
              {formatPercentage(metrics.volatility)}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(100, metrics.volatility * 500)}
              color="warning"
              sx={{ mt: 1, height: 6, borderRadius: 3 }}
            />
          </Grid>

          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Assessment fontSize="small" />
              <Typography color="text.secondary">夏普比率</Typography>
            </Box>
            <Typography 
              variant="h6" 
              color={`${getSharpeRatingColor(metrics.sharpeRatio)}.main`}
            >
              {metrics.sharpeRatio.toFixed(2)}
            </Typography>
            <Box sx={{ mt: 1 }}>
              {metrics.sharpeRatio > 1 && (
                <Chip label="优秀" color="success" size="small" />
              )}
              {metrics.sharpeRatio > 0.5 && metrics.sharpeRatio <= 1 && (
                <Chip label="良好" color="warning" size="small" />
              )}
              {metrics.sharpeRatio <= 0.5 && (
                <Chip label="需改进" color="error" size="small" />
              )}
            </Box>
          </Grid>

          <Grid item xs={6}>
            <Typography color="text.secondary">胜率</Typography>
            <Typography variant="h6" color="primary.main">
              {formatPercentage(metrics.winRate)}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={metrics.winRate * 100}
              color="primary"
              sx={{ mt: 1, height: 6, borderRadius: 3 }}
            />
          </Grid>

          <Grid item xs={6}>
            <Typography color="text.secondary">平均盈利</Typography>
            <Typography variant="body1" color="success.main">
              {formatPercentage(metrics.averageWin)}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography color="text.secondary">平均亏损</Typography>
            <Typography variant="body1" color="error.main">
              {formatPercentage(metrics.averageLoss)}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography color="text.secondary">盈亏比</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6">
                {metrics.profitFactor.toFixed(2)}
              </Typography>
              {metrics.profitFactor > 1.5 && (
                <Chip label="优秀" color="success" size="small" />
              )}
              {metrics.profitFactor > 1 && metrics.profitFactor <= 1.5 && (
                <Chip label="良好" color="warning" size="small" />
              )}
              {metrics.profitFactor <= 1 && (
                <Chip label="需改进" color="error" size="small" />
              )}
            </Box>
          </Grid>
        </Grid>

        {metrics.riskLevel === 'extreme' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            风险等级极高，建议立即调整策略参数或减少仓位
          </Alert>
        )}
        {metrics.riskLevel === 'high' && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            风险等级较高，请密切关注市场变化
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};