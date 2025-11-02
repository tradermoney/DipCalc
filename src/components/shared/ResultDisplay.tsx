import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  useTheme,
  alpha
} from '@mui/material';

interface ResultDisplayProps {
  title: string;
  data: Array<{
    label: string;
    value: string | number;
    color?: string;
    subtitle?: string;
  }>;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  title,
  data
}) => {
  const theme = useTheme();

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        
        <Grid container spacing={2}>
          {data.map((item, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: alpha(
                    item.color || theme.palette.primary.main, 
                    0.1
                  ),
                  border: `1px solid ${alpha(
                    item.color || theme.palette.primary.main, 
                    0.2
                  )}`
                }}
              >
                <Typography color="text.secondary" variant="caption" gutterBottom>
                  {item.label}
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: item.color || theme.palette.text.primary,
                    fontWeight: 600
                  }}
                >
                  {item.value}
                </Typography>
                {item.subtitle && (
                  <Typography variant="caption" color="text.secondary">
                    {item.subtitle}
                  </Typography>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};