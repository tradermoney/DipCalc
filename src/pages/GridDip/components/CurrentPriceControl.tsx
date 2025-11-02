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

interface CurrentPriceControlProps {
  currentPrice: number;
  useCurrentPrice: boolean;
  onCurrentPriceChange: (price: number) => void;
  onUseCurrentPriceChange: (use: boolean) => void;
}

export const CurrentPriceControl: React.FC<CurrentPriceControlProps> = ({
  currentPrice,
  useCurrentPrice,
  onCurrentPriceChange,
  onUseCurrentPriceChange
}) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          当前价格设置
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={useCurrentPrice}
              onChange={(e) => onUseCurrentPriceChange(e.target.checked)}
            />
          }
          label="使用当前价格"
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
            sx={{ mt: 2 }}
          />
        )}
      </CardContent>
    </Card>
  );
};