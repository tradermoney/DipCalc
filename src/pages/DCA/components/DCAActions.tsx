import React from 'react';
import {
  Box,
  Button,
  Alert
} from '@mui/material';
import {
  Save
} from '@mui/icons-material';
import { CalculationResult } from '../../../types';

interface DCAActionsProps {
  result: CalculationResult | null;
  loading: boolean;
  saved: boolean;
  onSave: () => void;
}

export const DCAActions: React.FC<DCAActionsProps> = ({
  result,
  loading,
  saved,
  onSave
}) => {
  return (
    <Box sx={{ mt: 3 }}>
      <Button
        variant="contained"
        startIcon={<Save />}
        onClick={onSave}
        disabled={!result || loading}
        fullWidth
      >
        {saved ? '已保存' : '保存策略'}
      </Button>
      
      {saved && (
        <Alert severity="success" sx={{ mt: 2 }}>
          定投策略已成功保存！
        </Alert>
      )}
    </Box>
  );
};