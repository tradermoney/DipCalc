import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  useTheme,
  alpha
} from '@mui/material';
import {
  GridOn,
  Timeline,
  TrendingDown,
  Repeat,
  ShowChart,
  AccountBalance,
  BarChart,
  Storage
} from '@mui/icons-material';

interface QuickNavItem {
  icon: React.ReactElement;
  title: string;
  path: string;
  description: string;
}

const quickNavItems: QuickNavItem[] = [
  {
    icon: <GridOn />,
    title: '等距分批',
    path: '/grid-dip',
    description: '快速开始等距分批策略'
  },
  {
    icon: <Timeline />,
    title: '金字塔',
    path: '/pyramid',
    description: '配置金字塔加仓策略'
  },
  {
    icon: <TrendingDown />,
    title: 'RSI超卖',
    path: '/rsi',
    description: '基于RSI的技术分析'
  },
  {
    icon: <Repeat />,
    title: '定投式',
    path: '/dca',
    description: '设置定期投资计划'
  },
  {
    icon: <ShowChart />,
    title: '动态阶梯',
    path: '/atr',
    description: 'ATR动态调整策略'
  },
  {
    icon: <AccountBalance />,
    title: '资金费率',
    path: '/funding',
    description: '费率套利策略'
  },
  {
    icon: <BarChart />,
    title: '风险管理',
    path: '/risk-management',
    description: '查看风险分析报告'
  },
  {
    icon: <Storage />,
    title: '数据管理',
    path: '/data-persistence',
    description: '管理策略和数据'
  }
];

export const QuickNavigation: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3,
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(10px)'
      }}
    >
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
        快速导航
      </Typography>
      
      <List>
        {quickNavItems.map((item, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                }
              }}
            >
              <ListItemIcon sx={{ color: theme.palette.primary.main }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                secondary={item.description}
                primaryTypographyProps={{
                  fontWeight: 500
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};