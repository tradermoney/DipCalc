import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardContent, Typography } from '@mui/material';
import { CalculationResult } from '../../types';

interface PnLChartProps {
  results: CalculationResult[];
  height?: number;
}

export const PnLChart: React.FC<PnLChartProps> = ({ results, height = 300 }) => {
  const data = results
    .filter(r => r.currentPriceAnalysis?.unrealizedPnL !== undefined)
    .map((result, index) => ({
      index: index + 1,
      pnl: Number(result.currentPriceAnalysis?.unrealizedPnL || 0),
      invested: Number(result.totalInvested || 0),
      return: result.totalInvested > 0 ? Number((result.currentPriceAnalysis?.unrealizedPnL || 0) / result.totalInvested) : 0,
      timestamp: result.calculatedAt.toLocaleDateString()
    }))
    .sort((a, b) => a.index - b.index);

  // 如果没有数据，显示空状态
  if (data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            盈亏趋势图
          </Typography>
          <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">暂无数据</Typography>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          盈亏趋势图
        </Typography>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="index" 
              label={{ value: '计算次数', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: '盈亏金额', angle: -90, position: 'insideLeft' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                name === 'pnl' ? formatCurrency(value) : formatPercentage(value),
                name === 'pnl' ? '盈亏金额' : '收益率'
              ]}
              labelFormatter={(label) => `第 ${label} 次计算`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="pnl" 
              stroke="#2196f3" 
              strokeWidth={2}
              dot={{ r: 4 }}
              name="盈亏金额"
            />
            <Line 
              type="monotone" 
              dataKey="return" 
              stroke="#4caf50" 
              strokeWidth={2}
              dot={{ r: 4 }}
              name="收益率"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

interface InvestmentDistributionProps {
  results: CalculationResult[];
}

export const InvestmentDistribution: React.FC<InvestmentDistributionProps> = ({ results }) => {
  // 按策略类型分组统计
  const strategyData = results.reduce((acc, result) => {
    let strategyType = 'other';
    if (result.strategyId?.includes('grid')) strategyType = '等距分批';
    else if (result.strategyId?.includes('pyramid')) strategyType = '金字塔';
    else if (result.strategyId?.includes('rsi')) strategyType = 'RSI超卖';
    else if (result.strategyId?.includes('dca')) strategyType = '定投式';
    else if (result.strategyId?.includes('atr')) strategyType = '动态阶梯';
    else if (result.strategyId?.includes('funding')) strategyType = '资金费率';

    if (!acc[strategyType]) {
      acc[strategyType] = { invested: 0, count: 0 };
    }
    acc[strategyType].invested += Number(result.totalInvested || 0);
    acc[strategyType].count += 1;
    return acc;
  }, {} as Record<string, { invested: number; count: number }>);

  const pieData = Object.entries(strategyData).map(([name, data]) => ({
    name,
    value: Number(data.invested),
    count: data.count
  }));

  // 如果没有数据，显示空状态
  if (pieData.length === 0 || pieData.every(d => d.value === 0)) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            投资分布
          </Typography>
          <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">暂无数据</Typography>
          </div>
        </CardContent>
      </Card>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          投资分布
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), '投入金额']}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

interface PerformanceComparisonProps {
  results: CalculationResult[];
}

export const PerformanceComparison: React.FC<PerformanceComparisonProps> = ({ results }) => {
  // 按策略类型分组计算平均收益率
  const strategyPerformance = results.reduce((acc, result) => {
    let strategyType = 'other';
    if (result.strategyId?.includes('grid')) strategyType = '等距分批';
    else if (result.strategyId?.includes('pyramid')) strategyType = '金字塔';
    else if (result.strategyId?.includes('rsi')) strategyType = 'RSI超卖';
    else if (result.strategyId?.includes('dca')) strategyType = '定投式';
    else if (result.strategyId?.includes('atr')) strategyType = '动态阶梯';
    else if (result.strategyId?.includes('funding')) strategyType = '资金费率';

    if (!acc[strategyType]) {
      acc[strategyType] = { returns: [], invested: 0, pnl: 0 };
    }
    
    if (result.currentPriceAnalysis?.unrealizedPnL !== undefined && result.totalInvested > 0) {
      const returnRate = Number(result.currentPriceAnalysis.unrealizedPnL) / Number(result.totalInvested);
      acc[strategyType].returns.push(returnRate);
      acc[strategyType].invested += Number(result.totalInvested);
      acc[strategyType].pnl += Number(result.currentPriceAnalysis.unrealizedPnL);
    }
    
    return acc;
  }, {} as Record<string, { returns: number[]; invested: number; pnl: number }>);

  const barData = Object.entries(strategyPerformance)
    .filter(([_, data]) => data.returns.length > 0)
    .map(([name, data]) => {
      const avgReturn = data.returns.reduce((sum, r) => sum + r, 0) / data.returns.length;
      const winRate = data.returns.filter(r => r > 0).length / data.returns.length;
      return {
        strategy: name,
        avgReturn: Number((avgReturn * 100).toFixed(2)),
        winRate: Number((winRate * 100).toFixed(2)),
        totalPnL: Number(data.pnl.toFixed(2))
      };
    });

  // 如果没有数据，显示空状态
  if (barData.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            策略表现对比
          </Typography>
          <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">暂无数据</Typography>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          策略表现对比
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="strategy" />
            <YAxis tickFormatter={formatPercentage} />
            <Tooltip 
              formatter={(value: number, name: string) => [
                name === 'totalPnL' ? 
                  new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'USD' }).format(value) :
                  formatPercentage(value),
                name === 'avgReturn' ? '平均收益率' : 
                name === 'winRate' ? '胜率' : '总盈亏'
              ]}
            />
            <Legend />
            <Bar dataKey="avgReturn" fill="#2196f3" name="平均收益率" />
            <Bar dataKey="winRate" fill="#4caf50" name="胜率" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};