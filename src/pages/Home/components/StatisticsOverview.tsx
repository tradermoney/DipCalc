import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Assessment
} from '@mui/icons-material';

interface StatItem {
  icon: React.ReactElement;
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  progress?: number;
}

// 模拟统计数据
const stats: StatItem[] = [
  {
    icon: <AccountBalance />,
    title: '总投资金额',
    value: '$125,430',
    change: '+12.5%',
    changeType: 'positive',
    progress: 75
  },
  {
    icon: <TrendingUp />,
    title: '总收益',
    value: '$15,680',
    change: '+8.3%',
    changeType: 'positive',
    progress: 60
  },
  {
    icon: <Assessment />,
    title: '活跃策略',
    value: '8',
    change: '+2',
    changeType: 'positive',
    progress: 80
  },
  {
    icon: <TrendingDown />,
    title: '最大回撤',
    value: '-5.2%',
    change: '-1.1%',
    changeType: 'negative',
    progress: 25
  }
];

export const StatisticsOverview: React.FC = () => {
  const theme = useTheme();

  const getChangeColor = (changeType?: string) => {
    switch (changeType) {
      case 'positive': return theme.palette.success.main;
      case 'negative': return theme.palette.error.main;
      default: return theme.palette.text.secondary;
    }
  };

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
        投资概览
      </Typography>
      
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4],
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      mr: 2
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography variant="h6" component="h3">
                    {stat.value}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {stat.title}
                </Typography>
                
                {stat.change && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: getChangeColor(stat.changeType),
                      fontWeight: 500
                    }}
                  >
                    {stat.change}
                  </Typography>
                )}
                
                {stat.progress !== undefined && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={stat.progress}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                        }
                      }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};