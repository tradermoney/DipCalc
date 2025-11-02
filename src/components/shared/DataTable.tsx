import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  useTheme
} from '@mui/material';

interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  title: string;
  columns: TableColumn[];
  data: any[];
  size?: 'small' | 'medium';
}

export const DataTable: React.FC<DataTableProps> = ({
  title,
  columns,
  data,
  size = 'small'
}) => {
  const theme = useTheme();

  const renderCell = (column: TableColumn, value: any, row: any) => {
    if (column.render) {
      return column.render(value, row);
    }
    
    if (column.format) {
      return column.format(value);
    }
    
    return value;
  };

  return (
    <Card sx={{ width: '100%', maxWidth: 'none' }}>
      <CardContent sx={{ width: '100%', maxWidth: 'none', p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        
        <TableContainer 
          component={Paper} 
          variant="outlined" 
          sx={{ 
            width: '100%', 
            maxWidth: 'none', 
            overflow: 'auto',
            maxHeight: 600
          }}
        >
          <Table 
            size={size} 
            sx={{ 
              width: '100%', 
              maxWidth: 'none', 
              minWidth: 650 
            }}
            stickyHeader
          >
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell 
                    key={column.key}
                    align={column.align || 'left'}
                    sx={{
                      backgroundColor: theme.palette.background.paper,
                      fontWeight: 600
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <TableRow 
                  key={index}
                  sx={{
                    '&:nth-of-type(odd)': {
                      backgroundColor: theme.palette.action.hover,
                    },
                    '&:hover': {
                      backgroundColor: theme.palette.action.selected,
                    }
                  }}
                >
                  {columns.map((column) => (
                    <TableCell 
                      key={column.key}
                      align={column.align || 'left'}
                    >
                      {renderCell(column, row[column.key], row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};