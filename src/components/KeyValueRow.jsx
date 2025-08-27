import React, { useState } from "react";
import {
    Box,
    Grid,
    TextField,
    Typography,
    Checkbox,
    FormControlLabel,
    Select,
    MenuItem,
    Tooltip,
    IconButton,
} from "@mui/material";

import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Import the new modal component
import KeyValueDetailsModal from './KeyValueDetailsModal';

function KeyValueRow({ label, field, isEditing, onChange }) {
    const [openModal, setOpenModal] = useState(false);
    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);

    const { type, value, unit, options, min, max, identifier } = field;

    let textColor = 'text.primary';
    let errorText = null;
    let isFieldInError = false;
    let iconToDisplay = null;

    if (min === undefined || max === undefined) {
        textColor = "warning.main";
        errorText = "No error bounds were set for this `KeyValueRow`.";
        iconToDisplay = <WarningAmberIcon fontSize="small" color="warning" />;
    }
    if (field === undefined){
        textColor = "warning.main";
        errorText = "The identifier of this field was `undefined`.";
    }
    if (value !== undefined && typeof value === 'number') {
        if ((min !== undefined && value < min) || (max !== undefined && value > max)) {
            textColor = 'error.main';
            isFieldInError = true;
            errorText = `Value out of range [${min !== undefined ? min : '-∞'}, ${max !== undefined ? max : '∞'}]`;
            iconToDisplay = <ErrorOutlineIcon fontSize="small" color="error" />;
        }
    }

    const handleChange = (newVal) => {
        onChange(label, { ...field, value: newVal });
    };

    const isUnitField = type === "number" || type === "boolean" || type === "selection";
    const labelXs = iconToDisplay ? 5 : 6;
    const valueXs = isUnitField ? 3 : 6;
    const unitXs = 12 - (labelXs + valueXs + (iconToDisplay ? 1 : 0));
    const isTimestamp = type === "timestamp";
    const isDisabled = field.disabled;

    return (
        <>
            <Grid
                container
                spacing={1}
                alignItems="center"
                sx={{ mb: 1, p: 1, borderRadius: 1, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                onClick={isEditing ? null : handleOpenModal}
            >
                <Grid item xs={labelXs}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                        <Typography variant="body2" fontWeight="bold">
                            {label}
                        </Typography>
                    </Box>
                </Grid>
                {iconToDisplay && (
                    <Grid item xs={1}>
                        <Tooltip title={errorText} arrow>
                            <IconButton size="small" sx={{ p: 0 }}>
                                {iconToDisplay}
                            </IconButton>
                        </Tooltip>
                    </Grid>
                )}
                <Grid item xs={isTimestamp ? (isEditing ? 6 : (iconToDisplay ? 5 : 6)) : valueXs}>
                    <Box display="flex" flexDirection="column" alignItems="flex-start" gap={0.5}>
                        {isEditing ? (
                            <>
                                {type === "number" && (
                                    <TextField
                                        type="number"
                                        size="small"
                                        value={value}
                                        onChange={(e) => handleChange(Number(e.target.value))}
                                        disabled={isDisabled}
                                        error={isFieldInError}
                                        sx={{ width: '100%' }}
                                    />
                                )}
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
                            </>
                        ) : (
                            <>
                                {type === "number" && (<Typography variant="body2" color={textColor}>{value}</Typography>)}
                                {type === "text" && (<Typography variant="body2">{value}</Typography>)}
                                {type === "timestamp" && (<Typography variant="body2">{value}</Typography>)}
                                {type === "boolean" && (<Typography variant="body2">{value ? "Yes" : "No"}</Typography>)}
                                {type === "selection" && (<Typography variant="body2">{value}</Typography>)}
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
            <KeyValueDetailsModal
                open={openModal}
                onClose={handleCloseModal}
                label={label}
                field={field}
                errorText={errorText}
                isFieldInError={isFieldInError}
            />
        </>
    );
}

export default KeyValueRow;