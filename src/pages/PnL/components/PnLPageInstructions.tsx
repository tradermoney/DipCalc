import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography
} from '@mui/material';

export const PnLPageInstructions: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          使用说明
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • <strong>策略管理</strong>：点击"查看策略列表"可以查看所有已保存的策略。支持加载已保存的策略和删除不需要的策略。
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • <strong>保存策略</strong>：点击"保存"按钮可以将当前交易记录保存为策略。支持多次保存同一策略（会覆盖之前的保存）。
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • <strong>添加交易记录</strong>：点击"添加买入"或"添加卖出"按钮来记录您的交易。可以添加多笔买卖交易，系统会自动计算累计持仓和盈亏。
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • <strong>拖拽排序</strong>：拖拽左侧的拖拽图标可以调整交易记录的顺序。系统会按照排序后的顺序计算持仓变化。
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • <strong>启用/禁用</strong>：点击启用复选框可以控制该笔交易是否参与计算。禁用后的交易记录会保留但不参与盈亏计算。
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • <strong>插入交易</strong>：点击某行的上箭头可以在该记录上方插入新交易，点击下箭头可以在下方插入。插入的交易会继承当前交易的类型。
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • <strong>计算逻辑</strong>：系统按照交易顺序计算累计持仓。买入增加持仓，卖出减少持仓并计算已实现盈亏。未卖出的部分计算未实现盈亏。
        </Typography>
      </CardContent>
    </Card>
  );
};
