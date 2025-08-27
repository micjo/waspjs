// src/components/KeyValueRow.jsx

import React from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
} from "@mui/material";

function KeyValueRow({ label, field, isEditing, onChange }) {
  const { type, value, unit, options, min, max } = field;
  // TODO: Remove updateable endpoints
  
  let textColor = 'text.primary';
  let errorText = null;
  let isFieldInError = false;


  if (value !== undefined && typeof value === 'number') {
    if ((min !== undefined && value < min) || (max !== undefined && value > max)) {
        textColor = 'error.main';
        isFieldInError = true;
        errorText = `Value out of range [${min !== undefined ? min : '-∞'}, ${max !== undefined ? max : '∞'}]`;
    }
  }

  const handleChange = (newVal) => {
    onChange(label, { ...field, value: newVal });
  };

  const isUnitField = type === "number" || type === "boolean" || type === "selection";
  const labelXs = 6;
  const valueXs = isUnitField ? 3 : 6;
  const unitXs = 12 - (labelXs + valueXs);
  const isTimestamp = type === "timestamp";
  const isDisabled = field.disabled;

  return (
    <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
      <Grid item xs={labelXs}>
        <Typography variant="body2" fontWeight="bold">
          {label}
        </Typography>
      </Grid>
      <Grid item xs={isTimestamp ? 6 : valueXs}>
        <Box display="flex" flexDirection="column" alignItems="flex-start" gap={0.5}>
          {isEditing ? (
            <>
              {type === "number" && (
                <TextField
                  type="number"
                  size="small"
                  value={value}
                  onChange={(e) => handleChange(e.target.value)}
                  disabled={isDisabled}
                  error={isFieldInError}
                  helperText={isFieldInError ? errorText : null}
                  sx={{ width: '100%' }}
                />
              )}
              {/* ... other input types */}
              {type === "text" && (
                <TextField size="small" fullWidth value={value} multiline onChange={(e) => handleChange(e.target.value)} disabled={isDisabled} />
              )}
              {type === "timestamp" && (
                <TextField size="small" fullWidth value={value} disabled />
              )}
              {type === "boolean" && (
                <FormControlLabel control={<Checkbox checked={!!value} onChange={(e) => handleChange(e.target.checked)} disabled={isDisabled} />} label="" />
              )}
              {type === "selection" && (
                <Select size="small" value={value} onChange={(e) => handleChange(e.target.value)} disabled={isDisabled} sx={{ width: '100%' }}>
                  {options.map((opt) => (<MenuItem key={opt} value={opt}>{opt}</MenuItem>))}
                </Select>
              )}
              {!['number', 'text', 'timestamp', 'boolean', 'selection'].includes(type) && isFieldInError && (
                <Typography variant="caption" color="error.main">{errorText}</Typography>
              )}
            </>
          ) : (
            <>
              {/* ... view mode rendering */}
              {type === "number" && (<Typography variant="body2" color={textColor}>{value}</Typography>)}
              {type === "text" && (<Typography variant="body2">{value}</Typography>)}
              {type === "timestamp" && (<Typography variant="body2">{value}</Typography>)}
              {type === "boolean" && (<Typography variant="body2">{value ? "Yes" : "No"}</Typography>)}
              {type === "selection" && (<Typography variant="body2">{value}</Typography>)}
              {errorText && (<Typography variant="caption" color="error.main">{errorText}</Typography>)}
            </>
          )}
        </Box>
      </Grid>
      {isUnitField && (
        <Grid item xs={unitXs}>
          {unit && (<Typography variant="body2" color="text.secondary">{unit}</Typography>)}
        </Grid>
      )}
    </Grid>
  );
}

export default KeyValueRow;