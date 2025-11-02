import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Download as LoadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { StrategyParams, PnLParams, StrategyType } from '../../../types';
import { dataAccessLayer } from '../../../services/database';

interface StrategyListProps {
  onLoadStrategy: (strategy: StrategyParams) => void;
  currentStrategyId?: string;
}

export const StrategyList: React.FC<StrategyListProps> = ({
  onLoadStrategy,
  currentStrategyId
}) => {
  const [strategies, setStrategies] = useState<StrategyParams[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [strategyToDelete, setStrategyToDelete] = useState<StrategyParams | null>(null);

  // 加载策略列表
  const loadStrategies = async () => {
    try {
      setLoading(true);
      setError(null);
      const allStrategies = await dataAccessLayer.getAllStrategies();
      setStrategies(allStrategies);
    } catch (err) {
      console.error('Failed to load strategies:', err);
      setError('加载策略列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时获取策略
  useEffect(() => {
    loadStrategies();
  }, []);

  // 处理删除
  const handleDeleteClick = (strategy: StrategyParams) => {
    setStrategyToDelete(strategy);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!strategyToDelete) return;

    try {
      await dataAccessLayer.deleteStrategy(strategyToDelete.id);
      await loadStrategies(); // 重新加载列表
      setDeleteDialogOpen(false);
      setStrategyToDelete(null);
    } catch (err) {
      console.error('Failed to delete strategy:', err);
      setError('删除策略失败');
    }
  };

  // 格式化日期
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              已保存的策略
            </Typography>
            <Button
              startIcon={<RefreshIcon />}
              onClick={loadStrategies}
              size="small"
              disabled={loading}
            >
              刷新
            </Button>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress size={24} />
            </Box>
          ) : error ? (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          ) : strategies.length === 0 ? (
            <Alert severity="info">
              暂无已保存的策略
            </Alert>
          ) : (
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {strategies.map((strategy, index) => (
                <React.Fragment key={strategy.id}>
                  <ListItem
                    sx={{
                      bgcolor: strategy.id === currentStrategyId ? 'action.hover' : 'transparent',
                      borderRadius: 1
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1">
                            {strategy.name || '未命名策略'}
                          </Typography>
                          {strategy.id === currentStrategyId && (
                            <Chip label="当前" size="small" color="primary" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            类型: {strategy.type} | 更新时间: {formatDate(strategy.updatedAt)}
                          </Typography>
                          {strategy.type === StrategyType.PNL && (strategy as PnLParams).symbol && (
                            <Typography variant="body2" color="text.secondary">
                              交易对: {(strategy as PnLParams).symbol}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box display="flex" gap={1}>
                        <IconButton
                          edge="end"
                          aria-label="load"
                          onClick={() => onLoadStrategy(strategy)}
                          disabled={strategy.id === currentStrategyId}
                          color="primary"
                        >
                          <LoadIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteClick(strategy)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < strategies.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>
            确定要删除策略 "{strategyToDelete?.name}" 吗？此操作不可撤销。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            取消
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
