import React from 'react';
import {
  Box,
  Button,
  CircularProgress
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { CalculationResult } from '../../../types';

interface GridDipSaveActionsProps {
  result: CalculationResult | null;
  loading: boolean;
  saved: boolean;
  onSave: () => void;
}

export const GridDipSaveActions: React.FC<GridDipSaveActionsProps> = ({
  result,
  loading,
  saved,
  onSave
}) => {
  return (
    <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
      <Button
        variant="contained"
        startIcon={loading ? <CircularProgress size={20} /> : <Save />}
        onClick={onSave}
        disabled={!result || loading}
        fullWidth
      >
        {saved ? '已保存' : '保存策略'}
      </Button>
    </Box>
  );
};