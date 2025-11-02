import React from 'react';
import { Tooltip, IconButton } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';

interface TooltipIconProps {
  title: string;
  size?: 'small' | 'medium' | 'large';
}

const TooltipIcon: React.FC<TooltipIconProps> = ({ title, size = 'small' }) => {
  return (
    <Tooltip title={title} arrow placement="top">
      <IconButton size={size} sx={{ padding: 0.5 }} aria-label={undefined}>
        <InfoOutlined fontSize={size} />
      </IconButton>
    </Tooltip>
  );
};

export default TooltipIcon;
