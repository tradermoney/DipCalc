import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Switch,
  Divider,
  InputAdornment
} from '@mui/material';
import { GridDipParams } from '../../../types';

interface GridDipParametersFormProps {
  params: Partial<GridDipParams>;
  onParamChange: (field: keyof GridDipParams, value: any) => void;
}

export const GridDipParametersForm: React.FC<GridDipParametersFormProps> = ({
  params,
  onParamChange
}) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          策略参数
        </Typography>
        
        <TextField
          fullWidth
          label="策略名称"
          value={params.name || ''}
          onChange={(e) => onParamChange('name', e.target.value)}
          sx={{ mb: 2 }}
        />
        
        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <FormLabel component="legend">步长模式</FormLabel>
          <RadioGroup
            row
            value={params.stepMode || 'absolute'}
            onChange={(e) => onParamChange('stepMode', e.target.value)}
          >
            <FormControlLabel value="absolute" control={<Radio />} label="绝对值" />
            <FormControlLabel value="percentage" control={<Radio />} label="百分比" />
          </RadioGroup>
        </FormControl>
        
        {params.stepMode === 'absolute' ? (
          <>
            <TextField
              fullWidth
              label="区间下限"
              type="number"
              value={params.lowerBound || ''}
              onChange={(e) => onParamChange('lowerBound', Number(e.target.value))}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="区间上限"
              type="number"
              value={params.upperBound || ''}
              onChange={(e) => onParamChange('upperBound', Number(e.target.value))}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              sx={{ mb: 2 }}
            />
          </>
        ) : (
          <>
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
              helperText="每次加仓的基准价格"
            />
            
            <TextField
              fullWidth
              label="下跌百分比"
              type="number"
              value={params.stepValue || ''}
              onChange={(e) => onParamChange('stepValue', Number(e.target.value))}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              sx={{ mb: 2 }}
              helperText="每次下跌多少百分比时加仓"
            />
          </>
        )}
        
        <TextField
          fullWidth
          label="网格数量"
          type="number"
          value={params.gridCount || ''}
          onChange={(e) => onParamChange('gridCount', Number(e.target.value))}
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
        
        <Divider sx={{ my: 2 }} />
        
        <FormControlLabel
          control={
            <Switch
              checked={params.isAddPosition || false}
              onChange={(e) => onParamChange('isAddPosition', e.target.checked)}
            />
          }
          label="补仓模式"
          sx={{ mb: 2 }}
        />
        
        {params.isAddPosition && (
          <>
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, mb: 1 }}>
              现有持仓信息
            </Typography>
            
            <TextField
              fullWidth
              label="已持有数量"
              type="number"
              value={params.existingPosition?.holdings || ''}
              onChange={(e) => onParamChange('existingPosition', {
                ...params.existingPosition,
                holdings: Number(e.target.value)
              })}
              sx={{ mb: 2 }}
              helperText="当前已持有的币种数量"
            />
            
            <TextField
              fullWidth
              label="平均成本"
              type="number"
              value={params.existingPosition?.averageCost || ''}
              onChange={(e) => onParamChange('existingPosition', {
                ...params.existingPosition,
                averageCost: Number(e.target.value)
              })}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              sx={{ mb: 2 }}
              helperText="现有持仓的平均成本价格"
            />
            
            <TextField
              fullWidth
              label="已投入资金"
              type="number"
              value={params.existingPosition?.totalInvested || ''}
              onChange={(e) => onParamChange('existingPosition', {
                ...params.existingPosition,
                totalInvested: Number(e.target.value)
              })}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              sx={{ mb: 2 }}
              helperText="现有持仓的总投入资金"
            />
            
            <Divider sx={{ my: 2 }} />
          </>
        )}
      </CardContent>
    </Card>
  );
};