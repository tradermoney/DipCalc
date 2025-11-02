import React from 'react';
import {
  Box,
  Button,
  Typography,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Save,
  Calculate,
  Clear,
  CloudDone,
  KeyboardArrowDown,
  KeyboardArrowUp
} from '@mui/icons-material';

interface PnLPageHeaderProps {
  showStrategyList: boolean;
  isCalculating: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  onToggleStrategyList: () => void;
  onClear: () => void;
  onSave: () => void;
  onCalculate: () => void;
}

export const PnLPageHeader: React.FC<PnLPageHeaderProps> = ({
  showStrategyList,
  isCalculating,
  isSaving,
  lastSaved,
  onToggleStrategyList,
  onClear,
  onSave,
  onCalculate
}) => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          现货P&L计算器
        </Typography>
        <Box display="flex" alignItems="center" gap={2} mb={1}>
          <Typography variant="body1" color="text.secondary">
            支持多笔交易记录的现货交易盈亏计算
          </Typography>
          {/* 自动保存状态指示器 */}
          <Chip
            icon={<CloudDone />}
            label={isSaving ? '保存中...' : lastSaved ? `已自动保存: ${lastSaved.toLocaleTimeString()}` : '未保存'}
            color={isSaving ? 'warning' : lastSaved ? 'success' : 'default'}
            size="small"
            variant="outlined"
          />
        </Box>
      </Box>
      <Box display="flex" gap={2}>
        <Button
          variant="outlined"
          startIcon={showStrategyList ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          onClick={onToggleStrategyList}
        >
          {showStrategyList ? '隐藏策略列表' : '查看策略列表'}
        </Button>
        <Button
          variant="outlined"
          startIcon={<Clear />}
          onClick={onClear}
        >
          清空
        </Button>
        <Button
          variant="outlined"
          startIcon={<Save />}
          onClick={onSave}
        >
          保存
        </Button>
        <Button
          variant="contained"
          startIcon={isCalculating ? <CircularProgress size={20} color="inherit" /> : <Calculate />}
          onClick={onCalculate}
          disabled={isCalculating}
        >
          {isCalculating ? '计算中...' : '计算'}
        </Button>
      </Box>
    </Box>
  );
};
