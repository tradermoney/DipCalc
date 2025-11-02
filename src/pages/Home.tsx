import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
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
  Security,
  BarChart,
  Storage,
  TrendingUp,
  Calculate,
  Speed,
  Shield
} from '@mui/icons-material';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const strategies = [
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

  const features = [
    {
      icon: <Calculate />,
      title: '精确计算',
      description: '多种抄底策略的精确计算和模拟'
    },
    {
      icon: <Speed />,
      title: '实时分析',
      description: '实时市场数据分析和策略优化建议'
    },
    {
      icon: <Shield />,
      title: '风险管理',
      description: '完善的风险控制和资金管理工具'
    },
    {
      icon: <BarChart />,
      title: '数据可视化',
      description: '直观的图表展示和历史回测分析'
    }
  ];

  const handleStrategyClick = (path: string) => {
    navigate(path);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* 欢迎区域 */}
      <Paper
        elevation={0}
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          p: 4,
          mb: 4,
          us: 3,
          textAlign: 'center'
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          DipCalc 抄底计算器
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3, maxWidth: 800, mx: 'auto' }}>
          专业的加密货币抄底策略计算工具，帮助您在市场下跌时制定科学的投资策略，
          降低投资风险，提高收益率
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={<TrendingUp />}
            label="6种抄底策略"
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<Calculate />}
            label="精确计算"
            color="secondary"
            variant="outlined"
          />
          <Chip
            icon={<BarChart />}
            label="数据可视化"
            color="success"
            variant="outlined"
          />
        </Box>
      </Paper>

      {/* 核心功能 */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom textAlign="center" fontWeight="bold">
          核心功能
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          为您提供全方位的投资决策支持
        </Typography>
        
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      p: 2,
                      borderRadius: '50%',
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      mb: 2
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 抄底策略 */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom textAlign="center" fontWeight="bold">
          抄底策略
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          选择适合您的投资策略，开始科学抄底
        </Typography>
        
        <Grid container spacing={3}>
          {strategies.map((strategy, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[12]
                  }
                }}
                onClick={() => handleStrategyClick(strategy.path)}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        backgroundColor: alpha(strategy.color, 0.1),
                        color: strategy.color,
                        mr: 2
                      }}
                    >
                      {strategy.icon}
                    </Box>
                    <Typography variant="h6" component="h3" fontWeight="bold">
                      {strategy.title}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {strategy.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {strategy.features.map((feature, featureIndex) => (
                      <Chip
                        key={featureIndex}
                        label={feature}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: alpha(strategy.color, 0.3),
                          color: strategy.color,
                          fontSize: '0.75rem'
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>
                
                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      backgroundColor: strategy.color,
                      '&:hover': {
                        backgroundColor: alpha(strategy.color, 0.8)
                      }
                    }}
                  >
                    开始计算
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 快速导航 */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
                风险管理工具
              </Typography>
              <List dense>
                <ListItem button onClick={() => navigate('/risk')}>
                  <ListItemIcon>
                    <Shield />
                  </ListItemIcon>
                  <ListItemText
                    primary="风险评估"
                    secondary="评估投资组合风险水平"
                  />
                </ListItem>
                <ListItem button onClick={() => navigate('/visualization')}>
                  <ListItemIcon>
                    <BarChart />
                  </ListItemIcon>
                  <ListItemText
                    primary="数据可视化"
                    secondary="图表分析和历史回测"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Storage sx={{ mr: 1, verticalAlign: 'middle' }} />
                数据管理
              </Typography>
              <List dense>
                <ListItem button onClick={() => navigate('/data')}>
                  <ListItemIcon>
                    <Storage />
                  </ListItemIcon>
                  <ListItemText
                    primary="数据持久化"
                    secondary="保存和管理您的计算数据"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Calculate />
                  </ListItemIcon>
                  <ListItemText
                    primary="历史记录"
                    secondary="查看历史计算和策略表现"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;