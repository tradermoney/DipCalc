import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Typography,
  Box
} from '@mui/material';
import {
  GridOn,
  TrendingUp,
  ShowChart,
  Schedule,
  AutoGraph,
  AccountBalance,
  Home,
  Calculate
} from '@mui/icons-material';

const DRAWER_WIDTH = 280;

interface SideNavigationProps {
  open: boolean;
}

const menuItems = [
  {
    path: '/',
    label: '首页',
    icon: <Home />,
    description: '策略概览'
  },
  {
    path: '/pnl',
    label: '现货P&L计算',
    icon: <Calculate />,
    description: '现货交易损益计算'
  },
  {
    path: '/grid-dip',
    label: '等距分批抄底',
    icon: <GridOn />,
    description: 'Grid-Dip 策略'
  },
  {
    path: '/pyramid',
    label: '金字塔加仓',
    icon: <TrendingUp />,
    description: 'Martingale 策略'
  },
  {
    path: '/rsi',
    label: 'RSI超卖批次',
    icon: <ShowChart />,
    description: '技术指标驱动'
  },
  {
    path: '/dca',
    label: '定投式抄底',
    icon: <Schedule />,
    description: 'Time-Dip 策略'
  },
  {
    path: '/atr',
    label: '动态阶梯',
    icon: <AutoGraph />,
    description: 'ATR自适应策略'
  },
  {
    path: '/funding',
    label: '资金费率反向',
    icon: <AccountBalance />,
    description: '衍生品情绪指标'
  }
];

export const SideNavigation: React.FC<SideNavigationProps> = ({ open }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? DRAWER_WIDTH : 0,
        flexShrink: 0,
        transition: 'width 0.3s',
        '& .MuiDrawer-paper': {
          width: open ? DRAWER_WIDTH : 0,
          boxSizing: 'border-box',
          transition: 'width 0.3s',
          overflow: 'hidden'
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', p: 1 }}>
        <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold' }}>
          抄底策略
        </Typography>
        <Divider />
        
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <Box>
                  <ListItemText 
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                      fontWeight: location.pathname === item.path ? 'bold' : 'normal'
                    }}
                  />
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ 
                      display: 'block',
                      opacity: location.pathname === item.path ? 0.8 : 0.6
                    }}
                  >
                    {item.description}
                  </Typography>
                </Box>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            💡 提示：每种策略都有不同的风险收益特征，请根据市场情况和个人风险偏好选择合适的策略。
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};