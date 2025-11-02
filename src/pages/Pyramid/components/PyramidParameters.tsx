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
  Switch
} from '@mui/material';
import { PyramidParams } from '../../../types';

interface PyramidParametersProps {
  params: Partial<PyramidParams>;
  currentPrice: number;
  useCurrentPrice: boolean;
  errors: string[];
  onParamChange: (field: keyof PyramidParams, value: any) => void;
  onCurrentPriceChange: (price: number) => void;
  onUseCurrentPriceChange: (use: boolean) => void;
}

export const PyramidParameters: React.FC<PyramidParametersProps> = ({
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
          金字塔策略参数
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

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="初始仓位"
              type="number"
              value={params.initialPosition || ''}
              onChange={(e) => onParamChange('initialPosition', parseFloat(e.target.value) || 0)}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>
              }}
              helperText="首次买入占总资金的比例"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="加仓倍数"
              type="number"
              value={params.multiplier || ''}
              onChange={(e) => onParamChange('multiplier', parseFloat(e.target.value) || 0)}
              helperText="每次加仓的倍数"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="最大档位"
              type="number"
              value={params.maxLevels || ''}
              onChange={(e) => onParamChange('maxLevels', parseInt(e.target.value) || 0)}
              helperText="最多加仓次数"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="价格步长"
              type="number"
              value={params.priceStep || ''}
              onChange={(e) => onParamChange('priceStep', parseFloat(e.target.value) || 0)}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>
              }}
              helperText="每次下跌百分比"
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
              label="基准价格"
              type="number"
              value={params.basePrice || ''}
              onChange={(e) => onParamChange('basePrice', parseFloat(e.target.value) || 0)}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>
              }}
              helperText="策略开始时的价格"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={useCurrentPrice}
                  onChange={(e) => onUseCurrentPriceChange(e.target.checked)}
                />
              }
              label="使用当前价格分析"
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