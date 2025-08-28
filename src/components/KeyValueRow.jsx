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
    // Tooltip,
    IconButton,
} from "@mui/material";
import KeyValueDetailsModal from './KeyValueDetailsModal';

import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

function KeyValueRow({ label, field, isEditing, onChange }) {
    const [openModal, setOpenModal] = useState(false);
    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);

    let { type, value, unit, options, min, max, identifier, issues, isDisabled} = field;

    // Ensure issues is an array
    if (!Array.isArray(issues)) {
        issues = [];
    }

    // Convert server-provided issues into component format
    issues = issues.map(issue => {
        if (issue.type && issue.message) {
            return {
                icon: issue.type === "error"
                    ? <ErrorOutlineIcon fontSize="small" color="error" />
                    : <WarningAmberIcon fontSize="small" color="warning" />,
                message: issue.message,
                severity: issue.type // store severity for color handling
            };
        }
        return issue;
    });

    let textColor = "text.primary";
    let isFieldInError = false;

    // Unknown type
    if (
        type !== "number" &&
        type !== "boolean" &&
        type !== "selection" &&
        type !== "timestamp" &&
        type !== "text"
    ) {
        isFieldInError = true;
        issues.push({
            icon: <WarningAmberIcon fontSize="small" color="warning" />,
            message: "Type of field is not found.",
            severity: "warning"
        });
    }

    // Range check
    if (value !== undefined && typeof value === "number") {
        if ((min !== undefined && value < min) || (max !== undefined && value > max)) {
            isFieldInError = true;
            issues.push({
                icon: <ErrorOutlineIcon fontSize="small" color="error" />,
                message: `Value out of range [${min !== undefined ? min : "-∞"}, ${
                    max !== undefined ? max : "∞"
                }]`,
                severity: "error"
            });
        }
    }

    // Update textColor based on server or local issues
    if (issues.some(issue => issue.severity === "error")) {
        textColor = "error.main";
        isFieldInError = true;
    } else if (issues.some(issue => issue.severity === "warning")) {
        textColor = "warning.main";
    }

    const handleChange = (newVal) => {
        onChange(label, { ...field, value: newVal });
    };

    const isUnitField =
        type === "number" || type === "boolean" || type === "selection";
    const labelXs = issues.length > 0 ? 5 : 6;
    const valueXs = isUnitField ? 3 : 6;
    const unitXs = 12 - (labelXs + valueXs + (issues.length > 0 ? issues.length : 0));
    const isTimestamp = type === "timestamp";

    return (
        <>
            <Grid
                container
                spacing={1}
                alignItems="center"
                sx={{
                    mb: 0.5,
                    p: 0.5,
                    borderRadius: 1,
                    cursor: "pointer",
                    "&:hover": { bgcolor: "action.hover" },
                }}
                onClick={isEditing ? null : handleOpenModal}
            >
                {/* Label */}
                <Grid item xs={labelXs}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                        <Typography variant="body2" fontWeight="bold">
                            {label}
                        </Typography>
                    </Box>
                </Grid>

                {/* Icons for warnings/errors */}
                {issues.length > 0 && (
                    <Grid item xs={issues.length}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                            {issues.map((issue, idx) => (
                                // <Tooltip key={idx} title={issue.message} arrow>
                                <IconButton size="small" sx={{ p: 0 }}>
                                    {issue.icon}
                                </IconButton>
                                // </Tooltip>
                            ))}
                        </Box>
                    </Grid>
                )}

                {/* Value field */}
                <Grid
                    item
                    xs={
                        isTimestamp
                            ? isEditing
                                ? 6
                                : issues.length > 0
                                    ? 5
                                    : 6
                            : valueXs
                    }
                >
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="flex-start"
                        gap={0.5}
                    >
                        {isEditing ? (
                            <>
                                {type === "number" && (
                                    <TextField
                                        type="number"
                                        size="small"
                                        value={value}
                                        onChange={(e) =>
                                            handleChange(Number(e.target.value))
                                        }
                                        disabled={isDisabled}
                                        error={isFieldInError}
                                        sx={{ width: "100%" }}
                                    />
                                )}
                                {type === "text" && (
                                    <TextField
                                        size="small"
                                        fullWidth
                                        value={value}
                                        multiline
                                        onChange={(e) =>
                                            handleChange(e.target.value)
                                        }
                                        disabled={isDisabled}
                                    />
                                )}
                                {type === "timestamp" && (
                                    <TextField
                                        size="small"
                                        fullWidth
                                        value={value}
                                        disabled
                                    />
                                )}
                                {type === "boolean" && (
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={!!value}
                                                onChange={(e) =>
                                                    handleChange(e.target.checked)
                                                }
                                                disabled={isDisabled}
                                            />
                                        }
                                        label=""
                                    />
                                )}
                                {type === "selection" && (
                                    <Select
                                        size="small"
                                        value={value}
                                        onChange={(e) =>
                                            handleChange(e.target.value)
                                        }
                                        disabled={isDisabled}
                                        sx={{ width: "100%" }}
                                    >
                                        {options.map((opt) => (
                                            <MenuItem key={opt} value={opt}>
                                                {opt}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                )}
                            </>
                        ) : (
                            <>
                                {type === "number" && (
                                    <Typography variant="body2" color={textColor}>
                                        {value}
                                    </Typography>
                                )}
                                {type === "text" && (
                                    <Typography variant="body2">{value}</Typography>
                                )}
                                {type === "timestamp" && (
                                    <Typography variant="body2">{value}</Typography>
                                )}
                                {type === "boolean" && (
                                    <Typography variant="body2">
                                        {value ? "Yes" : "No"}
                                    </Typography>
                                )}
                                {type === "selection" && (
                                    <Typography variant="body2">{value}</Typography>
                                )}
                            </>
                        )}
                    </Box>
                </Grid>

                {/* Unit field */}
                {isUnitField && (
                    <Grid item xs={unitXs}>
                        {unit && (
                            <Typography variant="body2" color="text.secondary">
                                {unit}
                            </Typography>
                        )}
                    </Grid>
                )}
            </Grid>

            <KeyValueDetailsModal
                open={openModal}
                onClose={handleCloseModal}
                label={label}
                field={field}
                issues={issues}
            />
        </>
    );
}

export default KeyValueRow;
