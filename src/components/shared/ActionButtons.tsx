import React from 'react';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Save,
  Download,
  Upload,
  Delete,
  Refresh,
  Share,
  Print
} from '@mui/icons-material';

interface ActionButton {
  key: string;
  label: string;
  icon: React.ReactElement;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  variant?: 'contained' | 'outlined' | 'text';
  tooltip?: string;
}

interface ActionButtonsProps {
  actions: ActionButton[];
  layout?: 'horizontal' | 'vertical';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  actions,
  layout = 'horizontal',
  size = 'medium',
  fullWidth = false
}) => {
  const renderButton = (action: ActionButton) => {
    const button = (
      <Button
        key={action.key}
        variant={action.variant || 'contained'}
        color={action.color || 'primary'}
        size={size}
        startIcon={action.loading ? <CircularProgress size={20} /> : action.icon}
        onClick={action.onClick}
        disabled={action.disabled || action.loading}
        fullWidth={fullWidth}
        sx={{ 
          mb: layout === 'vertical' ? 1 : 0,
          mr: layout === 'horizontal' ? 1 : 0
        }}
      >
        {action.label}
      </Button>
    );

    if (action.tooltip) {
      return (
        <Tooltip key={action.key} title={action.tooltip}>
          {button}
        </Tooltip>
      );
    }

    return button;
  };

  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: layout === 'vertical' ? 'column' : 'row',
        flexWrap: layout === 'horizontal' ? 'wrap' : 'nowrap',
        gap: 1,
        mt: 2
      }}
    >
      {actions.map(renderButton)}
    </Box>
  );
};

// 预定义的常用操作按钮
export const CommonActions = {
  save: (onClick: () => void, loading = false): ActionButton => ({
    key: 'save',
    label: '保存',
    icon: <Save />,
    onClick,
    loading,
    tooltip: '保存当前设置'
  }),

  download: (onClick: () => void): ActionButton => ({
    key: 'download',
    label: '下载',
    icon: <Download />,
    onClick,
    tooltip: '下载数据'
  }),

  upload: (onClick: () => void): ActionButton => ({
    key: 'upload',
    label: '上传',
    icon: <Upload />,
    onClick,
    variant: 'outlined',
    tooltip: '上传数据'
  }),

  delete: (onClick: () => void): ActionButton => ({
    key: 'delete',
    label: '删除',
    icon: <Delete />,
    onClick,
    color: 'error',
    variant: 'outlined',
    tooltip: '删除选中项'
  }),

  refresh: (onClick: () => void, loading = false): ActionButton => ({
    key: 'refresh',
    label: '刷新',
    icon: <Refresh />,
    onClick,
    loading,
    variant: 'outlined',
    tooltip: '刷新数据'
  }),

  share: (onClick: () => void): ActionButton => ({
    key: 'share',
    label: '分享',
    icon: <Share />,
    onClick,
    variant: 'outlined',
    tooltip: '分享结果'
  }),

  print: (onClick: () => void): ActionButton => ({
    key: 'print',
    label: '打印',
    icon: <Print />,
    onClick,
    variant: 'outlined',
    tooltip: '打印报告'
  })
};