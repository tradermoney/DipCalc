import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Box,
  Alert
} from '@mui/material';
import {
  Warning,
  Error,
  Info,
  AccessTime
} from '@mui/icons-material';
import { RiskAlert } from '../../services/risk/RiskManager';

interface RiskAlertsCardProps {
  alerts: RiskAlert[];
}

export const RiskAlertsCard: React.FC<RiskAlertsCardProps> = ({ alerts }) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'danger': return <Error color="error" />;
      case 'warning': return <Warning color="warning" />;
      case 'info': return <Info color="info" />;
      default: return <Info />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'danger': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  const getSeverityLabel = (severity: number) => {
    if (severity >= 9) return '紧急';
    if (severity >= 7) return '重要';
    if (severity >= 5) return '中等';
    return '一般';
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            风险警报
          </Typography>
          <Alert severity="success">
            暂无风险警报，策略运行正常
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const criticalAlerts = alerts.filter(a => a.severity >= 8);
  const warningAlerts = alerts.filter(a => a.severity >= 5 && a.severity < 8);
  // const infoAlerts = alerts.filter(a => a.severity < 5);

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Warning />
          <Typography variant="h6">风险警报</Typography>
          <Chip 
            label={`${alerts.length} 条警报`}
            color={criticalAlerts.length > 0 ? 'error' : warningAlerts.length > 0 ? 'warning' : 'info'}
          />
        </Box>

        {criticalAlerts.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            发现 {criticalAlerts.length} 条紧急警报，请立即处理！
          </Alert>
        )}

        <List dense>
          {alerts.slice(0, 10).map((alert) => (
            <ListItem key={alert.id} sx={{ px: 0 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                {getAlertIcon(alert.type)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">
                      {alert.message}
                    </Typography>
                    <Chip 
                      label={getSeverityLabel(alert.severity)}
                      size="small"
                      color={getAlertColor(alert.type) as any}
                    />
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <AccessTime fontSize="small" color="disabled" />
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(alert.timestamp)}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>

        {alerts.length > 10 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            显示前 10 条警报，共 {alerts.length} 条
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};