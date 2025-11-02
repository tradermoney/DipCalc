import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Lightbulb,
  CheckCircle,
  Warning,
  TrendingUp
} from '@mui/icons-material';

interface RiskRecommendationsProps {
  recommendations: string[];
}

export const RiskRecommendationsCard: React.FC<RiskRecommendationsProps> = ({ 
  recommendations 
}) => {
  const getRecommendationIcon = (text: string) => {
    if (text.includes('🚨') || text.includes('⚠️')) {
      return <Warning color="error" />;
    }
    if (text.includes('✅') || text.includes('📈')) {
      return <CheckCircle color="success" />;
    }
    if (text.includes('📊') || text.includes('🎯')) {
      return <TrendingUp color="primary" />;
    }
    return <Lightbulb color="info" />;
  };

  const cleanText = (text: string) => {
    // 移除emoji，保留文字内容
    return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          风险管理建议
        </Typography>

        <List dense>
          {recommendations.map((recommendation, index) => (
            <ListItem key={index} sx={{ px: 0 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                {getRecommendationIcon(recommendation)}
              </ListItemIcon>
              <ListItemText
                primary={cleanText(recommendation)}
                primaryTypographyProps={{
                  variant: 'body2',
                  color: recommendation.includes('🚨') ? 'error.main' : 
                         recommendation.includes('⚠️') ? 'warning.main' :
                         recommendation.includes('✅') ? 'success.main' : 'text.primary'
                }}
              />
            </ListItem>
          ))}
        </List>

        {recommendations.length === 0 && (
          <Typography color="text.secondary" variant="body2">
            暂无特殊建议，请继续保持当前策略
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};