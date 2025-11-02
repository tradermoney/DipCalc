import React from 'react';
import {
  TableRow,
  TableCell,
  IconButton,
  Checkbox,
  Select,
  MenuItem,
  TextField,
  Typography,
  FormControl,
} from '@mui/material';
import { DragIndicator as DragIcon, Delete as DeleteIcon, KeyboardArrowDown as ArrowDownIcon, KeyboardArrowUp as ArrowUpIcon } from '@mui/icons-material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SpotTrade } from '../../../types';

interface SpotTradeRowProps {
  trade: SpotTrade;
  index: number;
  cumulativeHoldings: number; // 累计持仓
  cumulativeCost: number; // 累计成本（不含手续费）
  averageCost: number; // 平均成本
  getInputValue: (id: string, field: 'price' | 'amount' | 'feeRate', fallbackValue: number) => string;
  handleInputChange: (id: string, field: 'price' | 'amount' | 'feeRate', value: string) => void;
  updateTrade: (id: string, field: keyof SpotTrade, value: any) => void;
  insertTrade: (index: number, direction: 'above' | 'below', type: 'BUY' | 'SELL') => void;
  removeTrade: (id: string) => void;
  registerInputRef: (key: string) => (element: HTMLInputElement | null) => void;
  handleInputFocus: (key: string) => void;
  handleInputBlur: (key: string) => void;
}

export default function SpotTradeRow({
  trade,
  index,
  cumulativeHoldings,
  cumulativeCost,
  averageCost,
  getInputValue,
  handleInputChange,
  updateTrade,
  insertTrade,
  removeTrade,
  registerInputRef,
  handleInputFocus,
  handleInputBlur,
}: SpotTradeRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: trade.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  } as const;

  // 计算交易金额
  const tradeValue = trade.price * trade.amount;
  // 计算手续费
  const fee = tradeValue * (trade.feeRate / 100);
  // 计算盈亏（简化计算）
  const pnl = trade.type === 'SELL' ? (trade.price * trade.amount - fee) : 0;

  return (
    <TableRow ref={setNodeRef} style={style} {...attributes} data-id={trade.id}>
      <TableCell sx={{ padding: '4px', textAlign: 'center', whiteSpace: 'nowrap', width: '50px' }}>
        <IconButton size="small" {...listeners}>
          <DragIcon fontSize="small" />
        </IconButton>
      </TableCell>
      <TableCell sx={{ padding: '4px', textAlign: 'center', whiteSpace: 'nowrap', width: '50px' }}>
        <Checkbox
          size="small"
          checked={trade.enabled}
          onChange={(e) => updateTrade(trade.id, 'enabled', e.target.checked)}
        />
      </TableCell>
      <TableCell sx={{ padding: '4px 8px', textAlign: 'center', whiteSpace: 'nowrap', width: '40px' }}>
        {index + 1}
      </TableCell>
      <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', width: '70px' }}>
        <FormControl size="small" fullWidth>
          <Select
            value={trade.type}
            onChange={(e) => updateTrade(trade.id, 'type', e.target.value as 'BUY' | 'SELL')}
            displayEmpty
            sx={{
              fontSize: '0.75rem',
              '& .MuiSelect-select': {
                padding: '4px 8px',
                fontSize: '0.75rem',
              },
            }}
          >
            <MenuItem value="BUY" sx={{ fontSize: '0.75rem' }}>买入</MenuItem>
            <MenuItem value="SELL" sx={{ fontSize: '0.75rem' }}>卖出</MenuItem>
          </Select>
        </FormControl>
      </TableCell>
      <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', width: '100px' }}>
        <TextField
          size="small"
          fullWidth
          value={getInputValue(trade.id, 'price', trade.price)}
          onChange={(e) => handleInputChange(trade.id, 'price', e.target.value)}
          inputRef={registerInputRef(`${trade.id}-price`)}
          onFocus={() => handleInputFocus(`${trade.id}-price`)}
          onBlur={() => handleInputBlur(`${trade.id}-price`)}
          data-testid={`trade-price-${trade.id}`}
          sx={{
            '& .MuiInputBase-input': {
              padding: '4px 8px',
              fontSize: '0.75rem',
            },
          }}
        />
      </TableCell>
      <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', width: '100px' }}>
        <TextField
          size="small"
          fullWidth
          value={getInputValue(trade.id, 'amount', trade.amount)}
          onChange={(e) => handleInputChange(trade.id, 'amount', e.target.value)}
          inputRef={registerInputRef(`${trade.id}-amount`)}
          onFocus={() => handleInputFocus(`${trade.id}-amount`)}
          onBlur={() => handleInputBlur(`${trade.id}-amount`)}
          data-testid={`trade-amount-${trade.id}`}
          sx={{
            '& .MuiInputBase-input': {
              padding: '4px 8px',
              fontSize: '0.75rem',
            },
          }}
        />
      </TableCell>
      <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', width: '100px' }}>
        <TextField
          size="small"
          fullWidth
          value={getInputValue(trade.id, 'feeRate', trade.feeRate)}
          onChange={(e) => handleInputChange(trade.id, 'feeRate', e.target.value)}
          inputRef={registerInputRef(`${trade.id}-feeRate`)}
          onFocus={() => handleInputFocus(`${trade.id}-feeRate`)}
          onBlur={() => handleInputBlur(`${trade.id}-feeRate`)}
          data-testid={`trade-feerate-${trade.id}`}
          sx={{
            '& .MuiInputBase-input': {
              padding: '4px 8px',
              fontSize: '0.75rem',
            },
          }}
        />
      </TableCell>
      <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', width: '100px', textAlign: 'right' }}>
        <Typography variant="caption">{tradeValue.toFixed(2)}</Typography>
      </TableCell>
      <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', width: '100px', textAlign: 'right' }}>
        <Typography variant="caption" color="error">-{fee.toFixed(2)}</Typography>
      </TableCell>
      <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', width: '100px', textAlign: 'right' }}>
        <Typography variant="caption">{cumulativeHoldings.toFixed(8)}</Typography>
      </TableCell>
      <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', width: '100px', textAlign: 'right' }}>
        <Typography variant="caption">{averageCost > 0 ? averageCost.toFixed(2) : '-'}</Typography>
      </TableCell>
      <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', width: '100px', textAlign: 'right' }}>
        <Typography variant="caption" color={pnl >= 0 ? 'success.main' : 'error.main'}>
          {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
        </Typography>
      </TableCell>
      <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', width: '100px', textAlign: 'center' }}>
        <IconButton size="small" onClick={() => insertTrade(index, 'above', trade.type)}>
          <ArrowUpIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => insertTrade(index, 'below', trade.type)}>
          <ArrowDownIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => removeTrade(trade.id)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
