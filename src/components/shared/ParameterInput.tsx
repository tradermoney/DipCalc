import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  InputAdornment
} from '@mui/material';

interface ParameterInputProps {
  label: string;
  value: any;
  onChange: (value: any) => void;
  type?: 'text' | 'number' | 'radio';
  options?: { value: any; label: string }[];
  adornment?: string;
  helperText?: string;
  required?: boolean;
}

export const ParameterInput: React.FC<ParameterInputProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  options = [],
  adornment,
  helperText,
  required = false
}) => {
  if (type === 'radio' && options.length > 0) {
    return (
      <FormControl component="fieldset" sx={{ mb: 2 }}>
        <FormLabel component="legend">{label}</FormLabel>
        <RadioGroup
          row
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio />}
              label={option.label}
            />
          ))}
        </RadioGroup>
      </FormControl>
    );
  }

  return (
    <TextField
      fullWidth
      label={label}
      type={type}
      value={value}
      onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
      required={required}
      helperText={helperText}
      InputProps={adornment ? {
        startAdornment: adornment.startsWith('$') ? 
          <InputAdornment position="start">{adornment}</InputAdornment> : undefined,
        endAdornment: adornment.endsWith('%') ? 
          <InputAdornment position="end">{adornment}</InputAdornment> : undefined,
      } : undefined}
      sx={{ mb: 2 }}
    />
  );
};