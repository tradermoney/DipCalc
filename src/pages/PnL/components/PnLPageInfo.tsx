import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  Typography
} from '@mui/material';

interface PnLPageInfoProps {
  params: {
    symbol: string;
    currentPrice: number;
  };
  errors: string[];
  onParamChange: (field: string, value: any) => void;
}

export const PnLPageInfo: React.FC<PnLPageInfoProps> = ({
  params,
  errors,
  onParamChange
}) => {
  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Typography variant="h6">
            交易对信息
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="交易对符号"
              value={params.symbol || ''}
              onChange={(e) => onParamChange('symbol', e.target.value)}
              placeholder="如: BTC/USDT, ETH/USDT"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="当前价格"
              type="number"
              value={params.currentPrice || ''}
              onChange={(e) => onParamChange('currentPrice', parseFloat(e.target.value) || 0)}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>
              }}
              error={errors.some(e => e.includes('当前价格'))}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
