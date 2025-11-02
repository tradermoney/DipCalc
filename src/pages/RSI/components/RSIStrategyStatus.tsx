import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Box
} from '@mui/material';

interface StrategyStatus {
  signal: 'buy' | 'hold' | 'wait';
  strength: number;
  nextLevel?: number;
  message: string;
}

interface RSIStrategyStatusProps {
  status: StrategyStatus | null;
}

export const RSIStrategyStatus: React.FC<RSIStrategyStatusProps> = ({
  status
}) => {
  if (!status) {
    return null;
  }

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'buy': return 'success';
      case 'hold': return 'warning';
      case 'wait': return 'default';
      default: return 'default';
    }
  };

  const getSignalText = (signal: string) => {
    switch (signal) {
      case 'buy': return '买入信号';
      case 'hold': return '持有';
      case 'wait': return '等待';
      default: return '未知';
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          策略状态
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Chip
            label={getSignalText(status.signal)}
            color={getSignalColor(status.signal) as any}
            variant="filled"
          />
          <Typography variant="body2" color="text.secondary">
            信号强度: {(status.strength * 100).toFixed(0)}%
          </Typography>
        </Box>
        
        <LinearProgress
          variant="determinate"
          value={status.strength * 100}
          sx={{ mb: 2 }}
        />
        
        <Typography variant="body2" color="text.secondary">
          {status.message}
        </Typography>
        
        {status.nextLevel && (
          <Typography variant="caption" color="primary">
            下一档位: 第 {status.nextLevel} 档
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};