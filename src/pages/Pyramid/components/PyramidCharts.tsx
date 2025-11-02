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
  Assessment
} from '@mui/icons-material';
import { CalculationResult } from '../../../types';

interface PyramidChartsProps {
  result: CalculationResult | null;
  riskAssessment: any;
  formatCurrency: (value: number) => string;
}

export const PyramidCharts: React.FC<PyramidChartsProps> = ({
  result,
  riskAssessment,
  formatCurrency
}) => {
  if (!result) {
    return null;
  }

  return (
    <>
      {/* 策略分析面板 */}
      {riskAssessment && riskAssessment.recommendations && (
        <Accordion sx={{ mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assessment color="primary" />
              策略分析与建议
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {riskAssessment.recommendations.map((rec: string, index: number) => (
              <Alert key={index} severity="info" sx={{ mb: 1 }}>
                {rec}
              </Alert>
            ))}
          </AccordionDetails>
        </Accordion>
      )}

      {/* 详细档位表格 */}
      <Card sx={{ width: '100%', maxWidth: 'none' }}>
        <CardContent sx={{ width: '100%', maxWidth: 'none', p: 2 }}>
          <Typography variant="h6" gutterBottom>
            金字塔档位详情
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ width: '100%', maxWidth: 'none', overflow: 'auto' }}>
            <Table size="small" sx={{ width: '100%', maxWidth: 'none', minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>档位</TableCell>
                  <TableCell align="right">触发价格</TableCell>
                  <TableCell align="right">投入金额</TableCell>
                  <TableCell align="right">投入比例</TableCell>
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
                      {formatCurrency(level.investAmount)}
                    </TableCell>
                    <TableCell align="right">
                      {level.investmentRatio ? `${(level.investmentRatio * 100).toFixed(1)}%` : '-'}
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
    </>
  );
};