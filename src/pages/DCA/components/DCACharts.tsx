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
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert
} from '@mui/material';
import {
  ExpandMore,
  Timeline
} from '@mui/icons-material';
import { CalculationResult } from '../../../types';

interface DCAChartsProps {
  result: CalculationResult | null;
  recommendations: string[];
  formatCurrency: (value: number) => string;
}

export const DCACharts: React.FC<DCAChartsProps> = ({
  result,
  recommendations,
  formatCurrency
}) => {
  if (!result) {
    return null;
  }

  return (
    <>
      {/* 建议面板 */}
      {recommendations.length > 0 && (
        <Accordion sx={{ mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Timeline color="primary" />
              定投建议
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {recommendations.map((rec, index) => (
              <Alert key={index} severity="info" sx={{ mb: 1 }}>
                {rec}
              </Alert>
            ))}
          </AccordionDetails>
        </Accordion>
      )}

      {/* 详细期数表格 */}
      <Card sx={{ width: '100%', maxWidth: 'none' }}>
        <CardContent sx={{ width: '100%', maxWidth: 'none', p: 2 }}>
          <Typography variant="h6" gutterBottom>
            定投期数详情
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ width: '100%', maxWidth: 'none', overflow: 'auto' }}>
            <Table size="small" sx={{ width: '100%', maxWidth: 'none', minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>期数</TableCell>
                  <TableCell align="right">投入日期</TableCell>
                  <TableCell align="right">投入价格</TableCell>
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
                      {level.investmentDate ? 
                        new Date(level.investmentDate).toLocaleDateString('zh-CN') : '-'}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(level.triggerPrice)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(level.investAmount)}
                    </TableCell>
                    <TableCell align="right">
                      {level.holdings.toFixed(4)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(level.cumulativeInvested)}
                    </TableCell>
                    <TableCell align="right">
                      {level.cumulativeHoldings.toFixed(4)}
                    </TableCell>
                    <TableCell align="right">
                      {level.averageCost > 0 ? 
                        formatCurrency(level.averageCost) : '-'}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={level.triggered ? '已投入' : '待投入'}
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
    </>
  );
};