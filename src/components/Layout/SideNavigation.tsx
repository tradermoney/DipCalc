import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Home,
  GridOn,
  Timeline,
  TrendingDown,
  Repeat,
  ShowChart,
  Calculate
} from '@mui/icons-material';

interface SideNavigationProps {
  open: boolean;
  onClose?: () => void;
}

const drawerWidth = 280;

const menuItems = [
  { path: '/', label: '首页', icon: <Home /> },
  { path: '/grid-dip', label: '等距分批', icon: <GridOn /> },
  { path: '/pyramid', label: '金字塔', icon: <Timeline /> },
  { path: '/rsi', label: 'RSI超卖', icon: <TrendingDown /> },
  { path: '/dca', label: '定投式', icon: <Repeat /> },
  { path: '/atr', label: '动态阶梯', icon: <ShowChart /> },
  { path: '/pnl', label: '现货P&L', icon: <Calculate /> },
];

export const SideNavigation: React.FC<SideNavigationProps> = ({ open, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleItemClick = (path: string) => {
    navigate(path);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const drawerContent = (
    <Box sx={{ overflow: 'auto', height: '100%' }}>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" component="div" color="primary">
          DipCalc
        </Typography>
        <Typography variant="caption" color="text.secondary">
          抄底计算器
        </Typography>
      </Box>
      
      <Divider />
      
      <List sx={{ pt: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleItemClick(item.path)}
              sx={{
                mx: 1,
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main + '20',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main + '30',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? 
                    theme.palette.primary.main : 
                    'inherit',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: location.pathname === item.path ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        position: 'absolute',
        width: drawerWidth,
        flexShrink: 0,
        display: { xs: 'none', md: 'block' }, // 只在中等屏幕以上显示
        transition: theme.transitions.create('transform', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        transform: open ? 'translateX(0)' : `translateX(-100%)`,
        '& .MuiDrawer-paper': {
          position: 'relative',
          width: drawerWidth,
          boxSizing: 'border-box',
          mt: 8, // 为顶部导航栏留出空间
          height: 'calc(100vh - 64px)',
          transition: theme.transitions.create('transform', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};