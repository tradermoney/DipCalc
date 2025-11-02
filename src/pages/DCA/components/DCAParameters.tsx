import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  FormControlLabel,
  Switch,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio
} from '@mui/material';
import { DCAParams } from '../../../types';

interface DCAParametersProps {
  params: Partial<DCAParams>;
  currentPrice: number;
  currentPeriod: number;
  useCurrentPrice: boolean;
  errors: string[];
  onParamChange: (field: keyof DCAParams, value: any) => void;
  onCurrentPriceChange: (price: number) => void;
  onCurrentPeriodChange: (period: number) => void;
  onUseCurrentPriceChange: (use: boolean) => void;
}

export const DCAParameters: React.FC<DCAParametersProps> = ({
  params,
  currentPrice,
  currentPeriod,
  useCurrentPrice,
  errors,
  onParamChange,
  onCurrentPriceChange,
  onCurrentPeriodChange,
  onUseCurrentPriceChange
}) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          定投策略参数
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
              <FormLabel component="legend">投资金额模式</FormLabel>
              <RadioGroup
                value={params.amountMode || 'fixed'}
                onChange={(e) => onParamChange('amountMode', e.target.value)}
                row
              >
                <FormControlLabel
                  value="fixed"
                  control={<Radio />}
                  label="固定金额"
                />
                <FormControlLabel
                  value="percentage"
                  control={<Radio />}
                  label="百分比"
                />
              </RadioGroup>
            </FormControl>
          </Grid>

          {params.amountMode === 'fixed' ? (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="每期投入金额"
                type="number"
                value={params.fixedAmount || ''}
                onChange={(e) => onParamChange('fixedAmount', parseFloat(e.target.value) || 0)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
                helperText="每次定投的固定金额"
              />
            </Grid>
          ) : (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="每期投入比例"
                type="number"
                value={params.percentageAmount || ''}
                onChange={(e) => onParamChange('percentageAmount', parseFloat(e.target.value) || 0)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>
                }}
                helperText="每次投入剩余资金的百分比"
              />
            </Grid>
          )}

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="投资间隔"
              type="number"
              value={params.interval || ''}
              onChange={(e) => onParamChange('interval', parseInt(e.target.value) || 0)}
              InputProps={{
                endAdornment: <InputAdornment position="end">天</InputAdornment>
              }}
              helperText="每次投资的间隔天数"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="最大期数"
              type="number"
              value={params.maxPeriods || ''}
              onChange={(e) => onParamChange('maxPeriods', parseInt(e.target.value) || 0)}
              helperText="最多投资多少期"
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

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="起始价格"
              type="number"
              value={params.startPrice || ''}
              onChange={(e) => onParamChange('startPrice', parseFloat(e.target.value) || 0)}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>
              }}
              helperText="开始定投时的价格"
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
              label="补仓模式"
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              开启后可以基于现有持仓进行补仓计算
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={useCurrentPrice}
                  onChange={(e) => onUseCurrentPriceChange(e.target.checked)}
                />
              }
              label="使用当前市场数据"
            />
          </Grid>

          {useCurrentPrice && (
            <>
              <Grid item xs={6}>
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
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="当前期数"
                  type="number"
                  value={currentPeriod}
                  onChange={(e) => onCurrentPeriodChange(parseInt(e.target.value) || 0)}
                  helperText="已经投资了多少期"
                />
              </Grid>
            </>
          )}

          {/* 补仓模式 - 现有持仓信息 */}
          {params.isAddPosition && (
            <>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  现有持仓信息
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="已持有数量"
                  type="number"
                  value={params.existingPosition?.holdings || ''}
                  onChange={(e) =>
                    onParamChange('existingPosition', {
                      ...params.existingPosition,
                      holdings: parseFloat(e.target.value) || 0
                    })
                  }
                  InputProps={{
                    startAdornment: <InputAdornment position="start">#</InputAdornment>
                  }}
                  helperText="当前已持有的币数量"
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="平均成本"
                  type="number"
                  value={params.existingPosition?.averageCost || ''}
                  onChange={(e) =>
                    onParamChange('existingPosition', {
                      ...params.existingPosition,
                      averageCost: parseFloat(e.target.value) || 0
                    })
                  }
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                  helperText="买入的平均价格"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="已投入资金"
                  type="number"
                  value={params.existingPosition?.totalInvested || ''}
                  onChange={(e) =>
                    onParamChange('existingPosition', {
                      ...params.existingPosition,
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