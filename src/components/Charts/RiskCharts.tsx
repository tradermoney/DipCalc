import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Card, CardContent, Typography } from '@mui/material';
import { CalculationResult } from '../../types';

interface RiskChartProps {
  results: CalculationResult[];
  height?: number;
}

export const DrawdownChart: React.FC<RiskChartProps> = ({ results, height = 300 }) => {
  const data = results
    .filter(r => r.maxDrawdown !== undefined)
    .map((result, index) => ({
      index: index + 1,
      drawdown: Number((Math.abs(result.maxDrawdown || 0) * 100).toFixed(2)),
      timestamp: result.calculatedAt.toLocaleDateString()
    }))
    .sort((a, b) => a.index - b.index);

  // 如果没有数据，显示空状态
  if (data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            最大回撤趋势
          </Typography>
          <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">暂无数据</Typography>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          最大回撤趋势
        </Typography>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="index" 
              label={{ value: '计算次数', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: '回撤 (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(2)}%`, '最大回撤']}
              labelFormatter={(label) => `第 ${label} 次计算`}
            />
            <Area 
              type="monotone" 
              dataKey="drawdown" 
              stroke="#f44336" 
              fill="#f44336"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export const VolatilityChart: React.FC<RiskChartProps> = ({ results, height = 300 }) => {
  // 计算滚动波动率
  const returns = results
    .filter(r => r.currentPriceAnalysis?.unrealizedPnL !== undefined && r.totalInvested > 0)
    .map(r => Number(r.currentPriceAnalysis!.unrealizedPnL) / Number(r.totalInvested));

  const volatilityData = returns.map((_, index) => {
    if (index < 4) return null; // 至少需要5个数据点
    
    const window = returns.slice(Math.max(0, index - 4), index + 1);
    const mean = window.reduce((sum, r) => sum + r, 0) / window.length;
    const variance = window.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / window.length;
    const volatility = Number((Math.sqrt(variance) * 100).toFixed(2));
    
    return {
      index: index + 1,
      volatility,
      timestamp: results[index].calculatedAt.toLocaleDateString()
    };
  }).filter(Boolean) as Array<{ index: number; volatility: number; timestamp: string }>;

  // 如果没有数据，显示空状态
  if (volatilityData.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            波动率趋势
          </Typography>
          <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">暂无数据</Typography>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          波动率趋势
        </Typography>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={volatilityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="index" 
              label={{ value: '计算次数', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: '波动率 (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(2)}%`, '波动率']}
              labelFormatter={(label) => `第 ${label} 次计算`}
            />
            <Line 
              type="monotone" 
              dataKey="volatility" 
              stroke="#ff9800" 
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};