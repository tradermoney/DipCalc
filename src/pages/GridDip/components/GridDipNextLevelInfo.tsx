import React from 'react';
import { Alert, Typography } from '@mui/material';

interface NextLevelInfo {
  level: number;
  triggerPrice: number;
  investAmount: number;
  dropNeeded: number;
}

interface GridDipNextLevelInfoProps {
  nextLevel: NextLevelInfo | null;
  formatCurrency: (value: number) => string;
}

export const GridDipNextLevelInfo: React.FC<GridDipNextLevelInfoProps> = ({
  nextLevel,
  formatCurrency
}) => {
  if (!nextLevel) {
    return null;
  }

  return (
    <Alert severity="info" sx={{ mb: 3 }}>
      <Typography variant="subtitle2" gutterBottom>
        下一档位信息
      </Typography>
      <Typography variant="body2">
        第 {nextLevel.level} 档：触发价格 {formatCurrency(nextLevel.triggerPrice)}，
        投入金额 {formatCurrency(nextLevel.investAmount)}，
        还需下跌 {nextLevel.dropNeeded.toFixed(2)}%
      </Typography>
    </Alert>
  );
};