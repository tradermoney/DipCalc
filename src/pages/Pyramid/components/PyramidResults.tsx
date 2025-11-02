import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  Chip,
  LinearProgress
} from '@mui/material';
import { CalculationResult } from '../../../types';

interface PyramidResultsProps {
  result: CalculationResult | null;
  riskAssessment: any;
  errors: string[];
  formatCurrency: (value: number) => string;
  formatPercentage: (value: number) => string;
}

export const PyramidResults: React.FC<PyramidResultsProps> = ({
  result,
  riskAssessment,
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
      {/* 风险评估 */}
      {riskAssessment && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              风险评估
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    风险等级
                  </Typography>
                  <Chip
                    label={riskAssessment.riskLevel}
                    color={
                      riskAssessment.riskLevel === '低' ? 'success' :
                      riskAssessment.riskLevel === '中' ? 'warning' : 'error'
                    }
                    size="small"
                  />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    资金利用率
                  </Typography>
                  <Typography variant="h6">
                    {formatPercentage(riskAssessment.capitalUtilization)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    风险分布
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={riskAssessment.riskScore * 10}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: riskAssessment.riskScore <= 3 ? '#4caf50' :
                                       riskAssessment.riskScore <= 7 ? '#ff9800' : '#f44336'
                      }
                    }}
                  />
                  <Box display="flex" justifyContent="space-between" mt={0.5}>
                    <Typography variant="caption">低风险</Typography>
                    <Typography variant="caption">中风险</Typography>
                    <Typography variant="caption">高风险</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* 概览卡片 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom>
                总投入资金
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

      {/* 当前盈亏 */}
      {result.currentPriceAnalysis && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              当前盈亏分析
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography color="text.secondary" variant="body2">
                  未实现盈亏
                </Typography>
                <Typography
                  variant="h6"
                  color={(result.currentPriceAnalysis?.unrealizedPnL || 0) >= 0 ? 'success.main' : 'error.main'}
                >
                  {formatCurrency(result.currentPriceAnalysis?.unrealizedPnL || 0)}
                  ({formatPercentage(result.currentPriceAnalysis?.unrealizedPnLPercentage || 0)})
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="text.secondary" variant="body2">
                  当前价格
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(result.currentPriceAnalysis.currentPrice)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

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