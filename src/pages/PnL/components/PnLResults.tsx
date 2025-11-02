import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Alert
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  AttachMoney
} from '@mui/icons-material';
import TooltipIcon from '../../../components/common/TooltipIcon';
import { PnLCalculationResult } from '../../../types';

interface PnLResultsProps {
  result: PnLCalculationResult | null;
  symbol: string;
}

export const PnLResults: React.FC<PnLResultsProps> = ({ result, symbol }) => {
  if (!result) {
    return null;
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const getPnLColor = (value: number): 'success' | 'error' => {
    if (value > 0) return 'success';
    return 'error';
  };

  const isProfit = result.unrealizedPnL > 0 || result.realizedPnL > 0;
  const isLoss = result.unrealizedPnL < 0 || result.realizedPnL < 0;

  return (
    <Box>
      {/* 主要指标卡片 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      投资回报率
                    </Typography>
                    <TooltipIcon title="投资回报率（ROI）是总盈亏除以总投入资金的百分比。计算公式：ROI =（已实现盈亏 + 未实现盈亏）/ 总投入资金 × 100%。此指标表示您的投资收益率，正值表示盈利，负值表示亏损。ROI越高，表示投资效果越好。" size="small" />
                  </Box>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color={getPnLColor(result.roi)}
                  >
                    {formatPercentage(result.roi)}
                  </Typography>
                </Box>
                <AttachMoney
                  color={getPnLColor(result.roi)}
                  sx={{ fontSize: 40, opacity: 0.3 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      未实现盈亏
                    </Typography>
                    <TooltipIcon title="未实现盈亏是您当前持仓的账面盈亏，基于当前价格计算。计算公式：未实现盈亏 =（当前价格 - 买入价格）× 剩余持仓数量。未实现盈亏不是实际收益，只有卖出后才能锁定。在持仓期间，此数值会随着市场价格波动而变化。" size="small" />
                  </Box>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color={getPnLColor(result.unrealizedPnL)}
                  >
                    {formatCurrency(result.unrealizedPnL)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatPercentage(result.unrealizedPnLPercentage)}
                  </Typography>
                </Box>
                {isProfit ? (
                  <TrendingUp color="success" sx={{ fontSize: 40, opacity: 0.3 }} />
                ) : isLoss ? (
                  <TrendingDown color="error" sx={{ fontSize: 40, opacity: 0.3 }} />
                ) : (
                  <AccountBalance color="action" sx={{ fontSize: 40, opacity: 0.3 }} />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {result.realizedPnL !== 0 && (
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography color="text.secondary" gutterBottom variant="body2">
                        已实现盈亏
                      </Typography>
                      <TooltipIcon title="已实现盈亏是您实际卖出后锁定的盈亏金额，基于卖出价格计算。计算公式：已实现盈亏 =（卖出价格 - 买入价格）× 卖出数量 - 买入手续费 - 卖出手续费。与未实现盈亏不同，已实现盈亏是实际收益，不会随市场价格波动而变化。" size="small" />
                    </Box>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      color={getPnLColor(result.realizedPnL)}
                    >
                      {formatCurrency(result.realizedPnL)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatPercentage(result.realizedPnLPercentage)}
                    </Typography>
                  </Box>
                  {result.realizedPnL > 0 ? (
                    <TrendingUp color="success" sx={{ fontSize: 40, opacity: 0.3 }} />
                  ) : (
                    <TrendingDown color="error" sx={{ fontSize: 40, opacity: 0.3 }} />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      盈亏平衡价
                    </Typography>
                    <TooltipIcon title="盈亏平衡价是您持仓不盈不亏的价格点，在此价格卖出时刚好保本。计算公式：盈亏平衡价 =（买入价格 × 买入数量 + 买入手续费）/ 买入数量。考虑手续费后，只有价格高于盈亏平衡价时才能盈利。" size="small" />
                  </Box>
                  <Typography variant="h5" fontWeight="bold">
                    {formatCurrency(result.breakEvenPrice)}
                  </Typography>
                </Box>
                <AccountBalance color="action" sx={{ fontSize: 40, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 详细信息表格 */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            详细信息
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      交易对
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={symbol} color="primary" size="small" />
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      总投入资金
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {formatCurrency(result.totalInvested)}
                    </Typography>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      总手续费
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" color="error">
                      -{formatCurrency(result.totalFees)}
                    </Typography>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      持仓数量
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {result.holdings.toFixed(8)} {symbol.split('/')[0]}
                    </Typography>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      当前市值
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {formatCurrency(result.currentValue)}
                    </Typography>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      未实现盈亏
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body1"
                      fontWeight="medium"
                      color={getPnLColor(result.unrealizedPnL)}
                    >
                      {formatCurrency(result.unrealizedPnL)} ({formatPercentage(result.unrealizedPnLPercentage)})
                    </Typography>
                  </TableCell>
                </TableRow>

                {result.realizedPnL !== 0 && (
                  <TableRow>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        已实现盈亏
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body1"
                        fontWeight="medium"
                        color={getPnLColor(result.realizedPnL)}
                      >
                        {formatCurrency(result.realizedPnL)} ({formatPercentage(result.realizedPnLPercentage)})
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {result.riskRewardRatio && (
                  <TableRow>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        风险回报比
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        1:{result.riskRewardRatio.toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* 风险提示 */}
          {result.unrealizedPnL < 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              当前持仓处于亏损状态。建议关注盈亏平衡价格：{formatCurrency(result.breakEvenPrice)}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
