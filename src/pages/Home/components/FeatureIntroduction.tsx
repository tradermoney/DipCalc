import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  alpha
} from '@mui/material';
import {
  Calculate,
  Speed,
  Shield,
  BarChart,
  Storage,
  Security
} from '@mui/icons-material';

interface Feature {
  icon: React.ReactElement;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <Calculate />,
    title: '精确计算',
    description: '多种抄底策略的精确计算和模拟'
  },
  {
    icon: <Speed />,
    title: '实时分析',
    description: '实时价格分析和策略执行建议'
  },
  {
    icon: <Shield />,
    title: '风险控制',
    description: '内置风险管理和资金保护机制'
  },
  {
    icon: <BarChart />,
    title: '数据可视化',
    description: '直观的图表和数据展示'
  },
  {
    icon: <Storage />,
    title: '数据持久化',
    description: '策略和计算结果的本地存储'
  },
  {
    icon: <Security />,
    title: '安全可靠',
    description: '本地计算，数据安全有保障'
  }
];

export const FeatureIntroduction: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
        核心功能
      </Typography>
      
      <Grid container spacing={3}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                textAlign: 'center',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4],
                }
              }}
            >
              <CardContent>
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
  );
};