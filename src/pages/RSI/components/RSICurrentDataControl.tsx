import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  InputAdornment
} from '@mui/material';

interface RSICurrentDataControlProps {
  currentPrice: number;
  currentRSI: number;
  useCurrentPrice: boolean;
  onCurrentPriceChange: (price: number) => void;
  onCurrentRSIChange: (rsi: number) => void;
  onUseCurrentPriceChange: (use: boolean) => void;
}

export const RSICurrentDataControl: React.FC<RSICurrentDataControlProps> = ({
  currentPrice,
  currentRSI,
  useCurrentPrice,
  onCurrentPriceChange,
  onCurrentRSIChange,
  onUseCurrentPriceChange
}) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          当前市场数据
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={useCurrentPrice}
              onChange={(e) => onUseCurrentPriceChange(e.target.checked)}
            />
          }
          label="使用当前价格"
          sx={{ mb: 2 }}
        />
        
        {useCurrentPrice && (
          <TextField
            fullWidth
            label="当前价格"
            type="number"
            value={currentPrice}
            onChange={(e) => onCurrentPriceChange(Number(e.target.value))}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            sx={{ mb: 2 }}
          />
        )}
        
        <TextField
          fullWidth
          label="当前RSI"
          type="number"
          value={currentRSI}
          onChange={(e) => onCurrentRSIChange(Number(e.target.value))}
          sx={{ mb: 2 }}
          helperText="当前RSI指标值"
        />
      </CardContent>
    </Card>
  );
};