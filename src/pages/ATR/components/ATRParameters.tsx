import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Divider,
  InputAdornment,
  FormControlLabel,
  Switch,
  Box,
  Button,
  Grid
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { ATRParams } from '../../../types';

interface ATRParametersProps {
  params: Partial<ATRParams>;
  currentPrice: number;
  useCurrentPrice: boolean;
  onParamChange: (field: keyof ATRParams, value: any) => void;
  onCurrentPriceChange: (price: number) => void;
  onUseCurrentPriceChange: (use: boolean) => void;
  onSave: () => void;
  canSave: boolean;
  loading: boolean;
  saved: boolean;
}

export const ATRParameters: React.FC<ATRParametersProps> = ({
  params,
  currentPrice,
  useCurrentPrice,
  onParamChange,
  onCurrentPriceChange,
  onUseCurrentPriceChange,
  onSave,
  canSave,
  loading,
  saved
}) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          策略参数
        </Typography>

        <Grid container spacing={2}>
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
              label="基础步长"
              type="number"
              value={params.baseStep || ''}
              onChange={(e) => onParamChange('baseStep', Number(e.target.value))}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              helperText="固定的档位间距基础值"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="ATR倍数"
              type="number"
              value={params.atrMultiplier || ''}
              onChange={(e) => onParamChange('atrMultiplier', Number(e.target.value))}
              helperText="波动率调整系数，越大适应性越强"
              inputProps={{ step: 0.1 }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="最大档数"
              type="number"
              value={params.maxLevels || ''}
              onChange={(e) => onParamChange('maxLevels', Number(e.target.value))}
              helperText="最多加仓次数"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="ATR周期"
              type="number"
              value={params.atrPeriod || 14}
              onChange={(e) => onParamChange('atrPeriod', Number(e.target.value))}
              helperText="计算ATR的周期长度"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="总本金"
              type="number"
              value={params.totalCapital || ''}
              onChange={(e) => onParamChange('totalCapital', Number(e.target.value))}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="基准价格"
              type="number"
              value={params.basePrice || ''}
              onChange={(e) => onParamChange('basePrice', Number(e.target.value))}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              helperText="策略开始时的价格"
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              市场数据
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
              label="使用当前价格"
            />
          </Grid>

          {useCurrentPrice && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="当前价格"
                type="number"
                value={currentPrice}
                onChange={(e) => onCurrentPriceChange(Number(e.target.value))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
          )}

          {/* 补仓模式 - 现有持仓信息 */}
          {params.isAddPosition && (
            <>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
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
                      holdings: Number(e.target.value) || 0
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
                      averageCost: Number(e.target.value) || 0
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
                      totalInvested: Number(e.target.value) || 0
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

          <Grid item xs={12}>
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={onSave}
                disabled={!canSave || loading}
                fullWidth
              >
                {saved ? '已保存' : '保存策略'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};