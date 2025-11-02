import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  useTheme,
  alpha
} from '@mui/material';

// 导入拆分后的组件
import { StrategyCards } from './components/StrategyCards';
import { FeatureIntroduction } from './components/FeatureIntroduction';
import { QuickNavigation } from './components/QuickNavigation';
import { StatisticsOverview } from './components/StatisticsOverview';

const HomePageRefactored: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        py: 4
      }}
    >
      <Container maxWidth="xl">
        {/* 页面标题 */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            现货抄底计算器
          </Typography>
          
          <Typography 
            variant="h5" 
            color="text.secondary" 
            sx={{ 
              maxWidth: 600, 
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            专业的数字货币抄底策略计算工具，帮您科学制定投资计划，控制风险，提高收益
          </Typography>
        </Box>

        {/* 统计概览 */}
        <StatisticsOverview />

        {/* 策略卡片 */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
            抄底策略
          </Typography>
          <StrategyCards />
        </Box>

        {/* 主要内容区域 */}
        <Grid container spacing={4}>
          {/* 功能介绍 */}
          <Grid item xs={12} lg={8}>
            <FeatureIntroduction />
          </Grid>

          {/* 快速导航 */}
          <Grid item xs={12} lg={4}>
            <QuickNavigation />
          </Grid>
        </Grid>

        {/* 底部说明 */}
        <Box sx={{ textAlign: 'center', mt: 8, py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            本工具仅供学习和研究使用，投资有风险，入市需谨慎
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePageRefactored;
export { HomePageRefactored };