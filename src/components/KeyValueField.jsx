import React from "react";
import {
    TextField,
    Typography,
    Checkbox,
    FormControlLabel,
    Select,
    MenuItem,
} from "@mui/material";

function KeyValueField({ type, value, autoUpdateable, options, isEditing, textColor, isFieldInError, onChange }) {
    if (isEditing) {
        switch (type) {
            case "number":
                return (
                    <TextField
                        type="number"
                        size="small"
                        value={value}
                        onChange={(e) => onChange(Number(e.target.value))}
                        disabled={autoUpdateable}
                        error={isFieldInError}
                        sx={{ width: "100%" }}
                    />
                );
            case "text":
                return (
                    <TextField
                        size="small"
                        fullWidth
                        value={value}
                        multiline
                        onChange={(e) => onChange(e.target.value)}
                        disabled={autoUpdateable}
                    />
                );
            case "timestamp":
                return (
                    <TextField
                        size="small"
                        fullWidth
                        value={value}
                        disabled
                    />
                );
            case "boolean":
                return (
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={!!value}
                                onChange={(e) => onChange(e.target.checked)}
                                disabled={autoUpdateable}
                            />
                        }
                        label=""
                    />
                );
            case "selection":
                return (
                    <Select
                        size="small"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        disabled={autoUpdateable}
                        sx={{ width: "100%" }}
                    >
                        {options.map((opt) => (
                            <MenuItem key={opt} value={opt}>
                                {opt}
                            </MenuItem>
                        ))}
                    </Select>
                );
            default:
                return null;
        }
    }

    // Read-only view
    switch (type) {
        case "number":
            return <Typography variant="body2" color={textColor}>{value}</Typography>;
        case "text":
        case "timestamp":
        case "selection":
            return <Typography variant="body2">{value}</Typography>;
        case "boolean":
            return <Typography variant="body2">{value ? "Yes" : "No"}</Typography>;
        default:
            return null;
    }
}

export default KeyValueField;
