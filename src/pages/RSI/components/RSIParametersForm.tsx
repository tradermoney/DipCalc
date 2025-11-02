import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment
} from '@mui/material';
import { RSIParams } from '../../../types';

interface RSIParametersFormProps {
  params: Partial<RSIParams>;
  onParamChange: (field: keyof RSIParams, value: any) => void;
}

export const RSIParametersForm: React.FC<RSIParametersFormProps> = ({
  params,
  onParamChange
}) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          RSI策略参数
        </Typography>
        
        <TextField
          fullWidth
          label="策略名称"
          value={params.name || ''}
          onChange={(e) => onParamChange('name', e.target.value)}
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="RSI超卖阈值"
          type="number"
          value={params.rsiThreshold || ''}
          onChange={(e) => onParamChange('rsiThreshold', Number(e.target.value))}
          sx={{ mb: 2 }}
          helperText="RSI低于此值时触发买入信号"
        />
        
        <TextField
          fullWidth
          label="价格步长"
          type="number"
          value={params.priceStep || ''}
          onChange={(e) => onParamChange('priceStep', Number(e.target.value))}
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
          sx={{ mb: 2 }}
          helperText="每次下跌多少百分比时加仓"
        />
        
        <TextField
          fullWidth
          label="最大档数"
          type="number"
          value={params.maxLevels || ''}
          onChange={(e) => onParamChange('maxLevels', Number(e.target.value))}
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="总本金"
          type="number"
          value={params.totalCapital || ''}
          onChange={(e) => onParamChange('totalCapital', Number(e.target.value))}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="基准价格"
          type="number"
          value={params.basePrice || ''}
          onChange={(e) => onParamChange('basePrice', Number(e.target.value))}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
          sx={{ mb: 2 }}
          helperText="策略开始时的基准价格"
        />
      </CardContent>
    </Card>
  );
};