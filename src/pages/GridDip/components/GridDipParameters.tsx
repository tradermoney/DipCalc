import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  InputAdornment
} from '@mui/material';
import { GridDipParams } from '../../../types';

interface GridDipParametersProps {
  params: Partial<GridDipParams>;
  currentPrice: number;
  useCurrentPrice: boolean;
  errors: string[];
  onParamChange: (field: keyof GridDipParams, value: any) => void;
  onCurrentPriceChange: (price: number) => void;
  onUseCurrentPriceChange: (use: boolean) => void;
}

export const GridDipParameters: React.FC<GridDipParametersProps> = ({
  params,
  currentPrice,
  useCurrentPrice,
  errors,
  onParamChange,
  onCurrentPriceChange,
  onUseCurrentPriceChange
}) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          策略参数
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="策略名称"
              value={params.name || ''}
              onChange={(e) => onParamChange('name', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend">步长模式</FormLabel>
              <RadioGroup
                value={params.stepMode || 'absolute'}
                onChange={(e) => onParamChange('stepMode', e.target.value)}
                row
              >
                <FormControlLabel
                  value="absolute"
                  control={<Radio />}
                  label="绝对价格区间"
                />
                <FormControlLabel
                  value="percentage"
                  control={<Radio />}
                  label="百分比步长"
                />
              </RadioGroup>
            </FormControl>
          </Grid>

          {params.stepMode === 'absolute' ? (
            <>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="下界价格"
                  type="number"
                  value={params.lowerBound || ''}
                  onChange={(e) => onParamChange('lowerBound', parseFloat(e.target.value) || 0)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="上界价格"
                  type="number"
                  value={params.upperBound || ''}
                  onChange={(e) => onParamChange('upperBound', parseFloat(e.target.value) || 0)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                />
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="基准价格"
                  type="number"
                  value={params.basePrice || ''}
                  onChange={(e) => onParamChange('basePrice', parseFloat(e.target.value) || 0)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="步长百分比"
                  type="number"
                  value={params.stepValue || ''}
                  onChange={(e) => onParamChange('stepValue', parseFloat(e.target.value) || 0)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>
                  }}
                />
              </Grid>
            </>
          )}

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="网格数量"
              type="number"
              value={params.gridCount || ''}
              onChange={(e) => onParamChange('gridCount', parseInt(e.target.value) || 0)}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="总资金"
              type="number"
              value={params.totalCapital || ''}
              onChange={(e) => onParamChange('totalCapital', parseFloat(e.target.value) || 0)}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={params.isAddPosition || false}
                  onChange={(e) => onParamChange('isAddPosition', e.target.checked)}
                />
              }
              label="加仓模式（已有持仓）"
            />
          </Grid>

          {params.isAddPosition && (
            <>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="现有持仓数量"
                  type="number"
                  value={params.existingPosition?.holdings || ''}
                  onChange={(e) => onParamChange('existingPosition', {
                    ...params.existingPosition,
                    holdings: parseFloat(e.target.value) || 0
                  })}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="平均成本"
                  type="number"
                  value={params.existingPosition?.averageCost || ''}
                  onChange={(e) => onParamChange('existingPosition', {
                    ...params.existingPosition,
                    averageCost: parseFloat(e.target.value) || 0
                  })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="已投入资金"
                  type="number"
                  value={params.existingPosition?.totalInvested || ''}
                  onChange={(e) => onParamChange('existingPosition', {
                    ...params.existingPosition,
                    totalInvested: parseFloat(e.target.value) || 0
                  })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={useCurrentPrice}
                  onChange={(e) => onUseCurrentPriceChange(e.target.checked)}
                />
              }
              label="使用当前价格进行分析"
            />
          </Grid>

          {useCurrentPrice && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="当前价格"
                type="number"
                value={currentPrice}
                onChange={(e) => onCurrentPriceChange(parseFloat(e.target.value) || 0)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>
          )}
        </Grid>

        {errors.length > 0 && (
          <Box mt={2}>
            {errors.map((error, index) => (
              <Typography key={index} color="error" variant="body2">
                {error}
              </Typography>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};