import React from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import type { DndContextProps } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SpotTradeRow from './SpotTradeRow';
import TooltipIcon from '../../../components/common/TooltipIcon';
import { SpotTrade } from '../../../types';

interface SpotTradeTableProps {
  trades: SpotTrade[];
  sensors: DndContextProps['sensors'];
  onDragEnd: (event: DragEndEvent) => void;
  onAddTrade: (type: 'BUY' | 'SELL') => void;
  insertTrade: (index: number, direction: 'above' | 'below', type: 'BUY' | 'SELL') => void;
  removeTrade: (id: string) => void;
  updateTrade: (id: string, field: keyof SpotTrade, value: any) => void;
  getInputValue: (id: string, field: 'price' | 'amount' | 'feeRate', fallbackValue: number) => string;
  handleInputChange: (id: string, field: 'price' | 'amount' | 'feeRate', value: string) => void;
  registerInputRef: (key: string) => (element: HTMLInputElement | null) => void;
  handleInputFocus: (key: string) => void;
  handleInputBlur: (key: string) => void;
}

export default function SpotTradeTable({
  trades,
  sensors,
  onDragEnd,
  onAddTrade,
  insertTrade,
  removeTrade,
  updateTrade,
  getInputValue,
  handleInputChange,
  registerInputRef,
  handleInputFocus,
  handleInputBlur,
}: SpotTradeTableProps) {
  return (
    <Box mb={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="subtitle2">交易记录</Typography>
          <TooltipIcon title="添加多次买入和卖出记录来模拟完整的交易过程。支持拖拽排序、启用/禁用单笔交易。" />
        </Box>
        <Box display="flex" gap={1}>
          <Button size="small" startIcon={<AddIcon />} onClick={() => onAddTrade('BUY')} variant="outlined" color="success">
            添加买入
          </Button>
          <Button size="small" startIcon={<AddIcon />} onClick={() => onAddTrade('SELL')} variant="outlined" color="error">
            添加卖出
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ overflowX: 'auto', width: '100%' }}>
        <DndContext sensors={sensors} onDragEnd={onDragEnd} collisionDetection={closestCenter}>
          <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: '100%', minWidth: '1200px' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '50px' }}>
                  <Box display="flex" alignItems="center">
                    拖拽
                    <TooltipIcon title="拖拽行来重新排序交易记录" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '50px' }}>
                  <Box display="flex" alignItems="center">
                    启用
                    <TooltipIcon title="勾选以启用此交易记录参与计算。取消勾选后，该记录将不参与盈亏计算。" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px 8px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '40px' }}>
                  序号
                </TableCell>
                <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '70px' }}>
                  <Box display="flex" alignItems="center">
                    交易方向
                    <TooltipIcon title="买入（BUY）或卖出（SELL）" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '100px' }}>
                  <Box display="flex" alignItems="center">
                    价格 (USDT)
                    <TooltipIcon title="交易价格，以USDT计价" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '100px' }}>
                  <Box display="flex" alignItems="center">
                    数量 (币)
                    <TooltipIcon title="交易数量，以币为单位" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '100px' }}>
                  <Box display="flex" alignItems="center">
                    手续费率 (%)
                    <TooltipIcon title="交易手续费率" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '100px' }}>
                  <Box display="flex" alignItems="center">
                    交易金额 (USDT)
                    <TooltipIcon title="交易金额 = 价格 × 数量" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '100px' }}>
                  <Box display="flex" alignItems="center">
                    手续费 (USDT)
                    <TooltipIcon title="手续费 = 交易金额 × 手续费率" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '100px' }}>
                  <Box display="flex" alignItems="center">
                    累计持有
                    <TooltipIcon title="累计持有币数量（买入为正，卖出为负）" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '100px' }}>
                  <Box display="flex" alignItems="center">
                    平均成本
                    <TooltipIcon title="平均买入成本价格" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '100px' }}>
                  <Box display="flex" alignItems="center">
                    盈亏 (USDT)
                    <TooltipIcon title="此笔交易的盈亏金额" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '100px' }}>
                  <Box display="flex" alignItems="center">
                    操作
                    <TooltipIcon title="插入、删除等操作" />
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <SortableContext items={trades.map(trade => trade.id)} strategy={verticalListSortingStrategy}>
              <TableBody>
                {(() => {
                  let cumulativeHoldings = 0;
                  let cumulativeCost = 0;

                  return trades.map((trade, index) => {
                    // 如果交易启用，计算累计值
                    if (trade.enabled) {
                      const tradeValue = trade.price * trade.amount;
                      if (trade.type === 'BUY') {
                        cumulativeHoldings += trade.amount;
                        cumulativeCost += tradeValue;
                      } else if (trade.type === 'SELL') {
                        // 卖出时先计算平均成本
                        const avgCost = cumulativeHoldings > 0 ? cumulativeCost / cumulativeHoldings : 0;
                        const sellAmount = Math.min(trade.amount, cumulativeHoldings);
                        cumulativeCost -= avgCost * sellAmount;
                        cumulativeHoldings -= sellAmount;
                      }
                    }

                    const averageCost = cumulativeHoldings > 0 ? cumulativeCost / cumulativeHoldings : 0;

                    return (
                      <SpotTradeRow
                        key={trade.id}
                        trade={trade}
                        index={index}
                        cumulativeHoldings={cumulativeHoldings}
                        cumulativeCost={cumulativeCost}
                        averageCost={averageCost}
                        getInputValue={getInputValue}
                        handleInputChange={handleInputChange}
                        updateTrade={updateTrade}
                        insertTrade={insertTrade}
                        removeTrade={removeTrade}
                        registerInputRef={registerInputRef}
                        handleInputFocus={handleInputFocus}
                        handleInputBlur={handleInputBlur}
                      />
                    );
                  });
                })()}
              </TableBody>
            </SortableContext>
          </Table>
        </DndContext>
      </TableContainer>
    </Box>
  );
}
