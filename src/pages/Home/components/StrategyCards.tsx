import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Chip,
  Box,
  useTheme,
  alpha
} from '@mui/material';
import {
  GridOn,
  Timeline,
  TrendingDown,
  Repeat,
  ShowChart,
  AccountBalance
} from '@mui/icons-material';

interface Strategy {
  title: string;
  description: string;
  icon: React.ReactElement;
  path: string;
  color: string;
  features: string[];
}

const strategies: Strategy[] = [
  {
    title: '等距分批',
    description: '在价格下跌过程中等距离分批买入，平摊成本',
    icon: <GridOn />,
    path: '/grid-dip',
    color: '#1976d2',
    features: ['固定间距', '风险分散', '适合震荡市']
  },
  {
    title: '金字塔',
    description: '价格越低买入越多，形成金字塔式仓位结构',
    icon: <Timeline />,
    path: '/pyramid',
    color: '#388e3c',
    features: ['递增买入', '底部加仓', '长期投资']
  },
  {
    title: 'RSI超卖',
    description: '基于RSI指标识别超卖区域进行抄底',
    icon: <TrendingDown />,
    path: '/rsi',
    color: '#f57c00',
    features: ['技术指标', '超卖信号', '精准入场']
  },
  {
    title: '定投式',
    description: '定期定额投资，不择时，长期持有',
    icon: <Repeat />,
    path: '/dca',
    color: '#7b1fa2',
    features: ['定期投资', '平滑波动', '简单易行']
  },
  {
    title: '动态阶梯',
    description: '基于ATR动态调整买入间距和数量',
    icon: <ShowChart />,
    path: '/atr',
    color: '#d32f2f',
    features: ['动态调整', 'ATR指标', '适应性强']
  },
  {
    title: '资金费率',
    description: '利用永续合约资金费率进行套利交易',
    icon: <AccountBalance />,
    path: '/funding',
    color: '#0288d1',
    features: ['费率套利', '稳定收益', '低风险']
  }
];

export const StrategyCards: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Grid container spacing={3}>
      {strategies.map((strategy, index) => (
        <Grid item xs={12} md={6} lg={4} key={index}>
          <Card 
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8],
              }
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    backgroundColor: alpha(strategy.color, 0.1),
                    color: strategy.color,
                    mr: 2
                  }}
                >
                  {strategy.icon}
                </Box>
                <Typography variant="h6" component="h3">
                  {strategy.title}
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {strategy.description}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {strategy.features.map((feature, featureIndex) => (
                  <Chip
                    key={featureIndex}
                    label={feature}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      borderColor: alpha(strategy.color, 0.3),
                      color: strategy.color
                    }}
                  />
                ))}
              </Box>
            </CardContent>
            
            <CardActions>
              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate(strategy.path)}
                sx={{
                  backgroundColor: strategy.color,
                  '&:hover': {
                    backgroundColor: alpha(strategy.color, 0.8),
                  }
                }}
              >
                开始使用
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};