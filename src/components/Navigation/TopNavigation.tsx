import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Switch,
  FormControlLabel,
  Tooltip
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  Settings,
  Menu
} from '@mui/icons-material';

interface TopNavigationProps {
  darkMode: boolean;
  onThemeToggle: () => void;
  onSettingsClick: () => void;
  onMenuToggle?: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  darkMode,
  onThemeToggle,
  onSettingsClick,
  onMenuToggle
}) => {
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        {onMenuToggle && (
          <Tooltip title="菜单">
            <IconButton
              color="inherit"
              onClick={onMenuToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <Menu />
            </IconButton>
          </Tooltip>
        )}
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          加密货币现货抄底计算器
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={onThemeToggle}
                icon={<Brightness7 />}
                checkedIcon={<Brightness4 />}
              />
            }
            label=""
          />

          <Tooltip title="设置">
            <IconButton color="inherit" onClick={onSettingsClick}>
              <Settings />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};