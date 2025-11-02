import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Box,
  Chip
} from '@mui/material';
import {
  AccountBalance,
  TrendingUp,
  PieChart,
  Assessment
} from '@mui/icons-material';

interface RiskSummaryProps {
  summary: {
    totalInvested: number;
    totalPnL: number;
    totalCapital: number;
    riskScore: number;
    overallReturn: number;
    diversificationLevel: number;
  };
}

export const RiskSummaryCard: React.FC<RiskSummaryProps> = ({ summary }) => {
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

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'error';
    if (score >= 60) return 'warning';
    if (score >= 40) return 'info';
    return 'success';
  };

  const getRiskScoreLabel = (score: number) => {
    if (score >= 80) return '高风险';
    if (score >= 60) return '中高风险';
    if (score >= 40) return '中等风险';
    if (score >= 20) return '低风险';
    return '极低风险';
  };

  const getDiversificationLabel = (level: number) => {
    if (level >= 0.8) return '高度分散';
    if (level >= 0.6) return '较好分散';
    if (level >= 0.4) return '一般分散';
    if (level >= 0.2) return '分散不足';
    return '高度集中';
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          风险概览
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AccountBalance fontSize="small" />
              <Typography color="text.secondary">总投入</Typography>
            </Box>
            <Typography variant="h6">
              {formatCurrency(summary.totalInvested)}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TrendingUp fontSize="small" />
              <Typography color="text.secondary">总盈亏</Typography>
            </Box>
            <Typography 
              variant="h6" 
              color={summary.totalPnL >= 0 ? 'success.main' : 'error.main'}
            >
              {formatCurrency(summary.totalPnL)}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography color="text.secondary" gutterBottom>
              整体收益率
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography 
                variant="h6" 
                color={summary.overallReturn >= 0 ? 'success.main' : 'error.main'}
              >
                {formatPercentage(summary.overallReturn)}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(100, Math.abs(summary.overallReturn) * 100)}
                color={summary.overallReturn >= 0 ? 'success' : 'error'}
                sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Assessment fontSize="small" />
              <Typography color="text.secondary">风险评分</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={summary.riskScore}
                color={getRiskScoreColor(summary.riskScore) as any}
                sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
              />
              <Typography variant="body2" sx={{ minWidth: 40 }}>
                {summary.riskScore.toFixed(0)}
              </Typography>
            </Box>
            <Chip 
              label={getRiskScoreLabel(summary.riskScore)}
              color={getRiskScoreColor(summary.riskScore) as any}
              size="small"
              sx={{ mt: 1 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <PieChart fontSize="small" />
              <Typography color="text.secondary">分散化程度</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={summary.diversificationLevel * 100}
                color="primary"
                sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2">
                {formatPercentage(summary.diversificationLevel)}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {getDiversificationLabel(summary.diversificationLevel)}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};