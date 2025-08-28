import React, { useState } from "react";
import {
    Box,
    Grid,
    Typography,
    IconButton,
} from "@mui/material";
import KeyValueDetailsModal from "./KeyValueDetailsModal";
import KeyValueField from "./KeyValueField";

import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import LinkIcon from '@mui/icons-material/Link';

function KeyValueRow({ label, field, isEditing, onChange }) {
    const [openModal, setOpenModal] = useState(false);
    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);

    let { type, value, unit, options, min, max, issues, autoUpdateable } = field;

    if (!Array.isArray(issues)) {
        issues = [];
    }

    issues = issues.map((issue) => {
        if (issue.type && issue.message) {
            return {
                icon:
                    issue.type === "error" ? (
                        <ErrorOutlineIcon fontSize="small" color="error" />
                    ) : (
                        <WarningAmberIcon fontSize="small" color="warning" />
                    ),
                message: issue.message,
                severity: issue.type,
            };
        }
        return issue;
    });

    let textColor = "text.primary";
    let isFieldInError = false;

    if (!["number", "boolean", "selection", "timestamp", "text"].includes(type)) {
        isFieldInError = true;
        issues.push({
            icon: <WarningAmberIcon fontSize="small" color="warning" />,
            message: "Type of field is not found.",
            severity: "warning",
        });
    }

    if (value !== undefined && typeof value === "number") {
        if ((min !== undefined && value < min) || (max !== undefined && value > max)) {
            isFieldInError = true;
            issues.push({
                icon: <ErrorOutlineIcon fontSize="small" color="error" />,
                message: `Value out of range [${min ?? "-∞"}, ${max ?? "∞"}]`,
                severity: "error",
            });
        }
    }

    if (issues.some((issue) => issue.severity === "error")) {
        textColor = "error.main";
        isFieldInError = true;
    } else if (issues.some((issue) => issue.severity === "warning")) {
        textColor = "warning.main";
    }

    const handleChange = (newVal) => {
        onChange(label, { ...field, value: newVal });
    };

    const isUnitField = ["number", "boolean", "selection"].includes(type);

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
                <Grid item xs={4}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                        <Typography variant="body2" fontWeight="bold">
                            {label}
                        </Typography>
                    </Box>
                </Grid>

                {/* Icons */}
                {(issues.length > 0 || autoUpdateable) && (
                    <Grid item xs="auto">
                        <Box display="flex" alignItems="center" gap={0.5}>
                            {issues.map((issue, idx) => (
                                <IconButton size="small" sx={{ p: 0 }} key={idx}>
                                    {issue.icon}
                                </IconButton>
                            ))}
                            {autoUpdateable && (
                                <IconButton size="small" sx={{ p: 0 }}>
                                    <LinkIcon fontSize="small" color="action" />
                                </IconButton>
                            )}
                        </Box>
                    </Grid>
                )}

                {/* Value */}
                <Grid item xs>
                    <Box display="flex" flexDirection="column" alignItems="flex-start" gap={0.5}>
                        <KeyValueField
                            type={type}
                            value={value}
                            autoUpdateable={autoUpdateable}
                            options={options}
                            isEditing={isEditing}
                            textColor={textColor}
                            isFieldInError={isFieldInError}
                            onChange={handleChange}
                        />
                    </Box>
                </Grid>

                {/* Unit */}
                {isUnitField && (
                    <Grid item xs="auto">
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
