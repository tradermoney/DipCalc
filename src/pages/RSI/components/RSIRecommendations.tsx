import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { ExpandMore, Lightbulb } from '@mui/icons-material';

interface RSIRecommendationsProps {
  recommendations: string[];
}

export const RSIRecommendations: React.FC<RSIRecommendationsProps> = ({
  recommendations
}) => {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="h6">
          策略建议 ({recommendations.length})
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <List dense>
          {recommendations.map((rec, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <Lightbulb color="primary" />
              </ListItemIcon>
              <ListItemText primary={rec} />
            </ListItem>
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};