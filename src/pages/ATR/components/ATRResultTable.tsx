import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import { CalculationResult } from '../../../types';

interface ATRResultTableProps {
  result: CalculationResult;
}

export const ATRResultTable: React.FC<ATRResultTableProps> = ({ result }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          档位详情
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>档位</TableCell>
                <TableCell align="right">触发价格</TableCell>
                <TableCell align="right">动态步长</TableCell>
                <TableCell align="right">投入金额</TableCell>
                <TableCell align="right">获得数量</TableCell>
                <TableCell align="right">累计投入</TableCell>
                <TableCell align="right">累计持仓</TableCell>
                <TableCell align="right">平均成本</TableCell>
                <TableCell align="center">状态</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {result.levels.map((level) => (
                <TableRow 
                  key={level.level}
                  sx={{
                    backgroundColor: level.triggered ? 'action.selected' : 'inherit'
                  }}
                >
                  <TableCell>{level.level}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(level.triggerPrice)}
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={level.dynamicStep ? formatPercentage(level.dynamicStep) : '-'}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(level.investAmount)}
                  </TableCell>
                  <TableCell align="right">
                    {level.holdings.toFixed(4)}
                  </TableCell>
                  <TableCell align="right">
                    {level.triggered ? formatCurrency(level.cumulativeInvested) : '-'}
                  </TableCell>
                  <TableCell align="right">
                    {level.triggered ? level.cumulativeHoldings.toFixed(4) : '-'}
                  </TableCell>
                  <TableCell align="right">
                    {level.triggered && level.averageCost > 0 ? 
                      formatCurrency(level.averageCost) : '-'}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={level.triggered ? '已触发' : '待触发'}
                      color={level.triggered ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};