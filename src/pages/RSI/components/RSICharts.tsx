import React from 'react';
import { CalculationResult } from '../../../types';
import { ChartDisplay } from '../../../components/shared/ChartDisplay';

interface RSIChartsProps {
  result: CalculationResult;
}

export const RSICharts: React.FC<RSIChartsProps> = ({
  result
}) => {
  // 准备图表数据
  const chartData = result.levels.map((level, index) => ({
    level: level.level,
    price: level.triggerPrice,
    amount: level.investAmount,
    holdings: level.holdings,
    cumulative: level.cumulativeInvested
  }));

  return (
    <>
      <ChartDisplay
        title="RSI策略档位分布"
        data={chartData}
        type="bar"
        xKey="level"
        yKey="amount"
        bars={[
          {
            key: 'amount',
            color: '#1976d2',
            name: '投入金额'
          }
        ]}
        height={300}
      />
      
      <ChartDisplay
        title="累计投入趋势"
        data={chartData}
        type="line"
        xKey="level"
        yKey="cumulative"
        lines={[
          {
            key: 'cumulative',
            color: '#dc004e',
            name: '累计投入'
          }
        ]}
        height={300}
      />
    </>
  );
};