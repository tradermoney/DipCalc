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
import { Timeline, TrendingUp } from '@mui/icons-material';

interface ATRProgressProps {
  statistics: any;
  atrValue: number;
  basePrice: number;
}

export const ATRProgress: React.FC<ATRProgressProps> = ({
  statistics,
  atrValue,
  basePrice
}) => {
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'extreme': return 'error';
      default: return 'default';
    }
  };

  const getRiskLabel = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return '低风险';
      case 'medium': return '中等风险';
      case 'high': return '高风险';
      case 'extreme': return '极高风险';
      default: return '未知';
    }
  };

  const volatilityRatio = atrValue / basePrice;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Timeline />
          <Typography variant="h6">动态分析</Typography>
          <Chip 
            label={getRiskLabel(statistics.riskLevel)}
            color={getRiskColor(statistics.riskLevel) as any}
          />
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography color="text.secondary">平均档位间距</Typography>
            <Typography variant="h6">
              {formatPercentage(statistics.averageStep)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography color="text.secondary">总跌幅范围</Typography>
            <Typography variant="h6">
              {formatPercentage(statistics.totalDropRange)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography color="text.secondary">波动率调整</Typography>
            <Typography variant="h6" color="primary.main">
              +{formatPercentage(statistics.volatilityAdjustment)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography color="text.secondary">适应性评分</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={statistics.adaptabilityScore}
                sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                color="primary"
              />
              <Typography variant="body2">
                {statistics.adaptabilityScore.toFixed(0)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography color="text.secondary">当前波动率</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp color="primary" />
              <Typography variant="body1">
                {formatPercentage(volatilityRatio * 100)} - {statistics.volatilityLevel || '中等波动'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};