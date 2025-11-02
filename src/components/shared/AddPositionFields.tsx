import React from 'react';
import {
  Grid,
  Typography,
  TextField,
  InputAdornment,
  FormControlLabel,
  Switch
} from '@mui/material';
import { ExistingPosition } from '../../types';

interface AddPositionFieldsProps {
  isAddPosition: boolean;
  existingPosition?: ExistingPosition;
  onParamChange: (field: string, value: any) => void;
}

export const AddPositionFields: React.FC<AddPositionFieldsProps> = ({
  isAddPosition,
  existingPosition,
  onParamChange
}) => {
  return (
    <>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={isAddPosition}
              onChange={(e) => onParamChange('isAddPosition', e.target.checked)}
            />
          }
          label="补仓模式"
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          开启后可以基于现有持仓进行补仓计算
        </Typography>
      </Grid>

      {isAddPosition && (
        <>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              现有持仓信息
            </Typography>
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              label="已持有数量"
              type="number"
              value={existingPosition?.holdings || ''}
              onChange={(e) =>
                onParamChange('existingPosition', {
                  ...existingPosition,
                  holdings: parseFloat(e.target.value) || 0
                })
              }
              InputProps={{
                startAdornment: <InputAdornment position="start">#</InputAdornment>
              }}
              helperText="当前已持有的币数量"
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              label="平均成本"
              type="number"
              value={existingPosition?.averageCost || ''}
              onChange={(e) =>
                onParamChange('existingPosition', {
                  ...existingPosition,
                  averageCost: parseFloat(e.target.value) || 0
                })
              }
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>
              }}
              helperText="买入的平均价格"
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              label="已投入资金"
              type="number"
              value={existingPosition?.totalInvested || ''}
              onChange={(e) =>
                onParamChange('existingPosition', {
                  ...existingPosition,
                  totalInvested: parseFloat(e.target.value) || 0
                })
              }
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>
              }}
              helperText="已投入的总资金（可选）"
            />
          </Grid>
        </>
      )}
    </>
  );
};
