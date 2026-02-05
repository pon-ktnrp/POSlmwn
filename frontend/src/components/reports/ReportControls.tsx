'use client';
import { Box, TextField, Button } from '@mui/material';

interface Props {
  dateRange: { from: string; to: string };
  onDateChange: (field: 'from' | 'to', value: string) => void;
  onFilter: () => void;
}

export default function ReportControls({ dateRange, onDateChange, onFilter }: Props) {
  return (
    <Box display="flex" gap={2} bgcolor="white" p={2} borderRadius={2} boxShadow={1}>
      <TextField
        label="From"
        type="date"
        size="small"
        value={dateRange.from}
        onChange={(e) => onDateChange('from', e.target.value)}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="To"
        type="date"
        size="small"
        value={dateRange.to}
        onChange={(e) => onDateChange('to', e.target.value)}
        InputLabelProps={{ shrink: true }}
      />
      <Button 
        variant="contained" 
        onClick={onFilter}
      >
        Filter
      </Button>
    </Box>
  );
}