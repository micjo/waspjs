import React, { useState, useEffect } from "react";
import api from '../api/DashboardAPI';
import {
    Box,
    Card,
    CardContent,
    CardActions,
    Button,
    Typography,
    Modal,
    CircularProgress,
    Alert,
} from "@mui/material";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
} from 'recharts';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: 600,
    maxHeight: '90vh',
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: 2,
    p: 4,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
};

function KeyValueDetailsModal({ open, onClose, label, field, issues = [] }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [warnings, setWarnings] = useState([]);
    const explanation = field?.explanation;
    const identifier = field?.identifier;

    useEffect(() => {
        if (open) {
            const fetchHistoryData = async () => {
                setLoading(true);
                setError(null);
                setWarnings([]);
                try {
                    const data = await api.fetchHistory(identifier);
                    if (!Array.isArray(data)) {
                        setWarnings(prev => [...prev, "API returned a non-array response. Displaying as a list."]);
                        setHistory([data]);
                    } else {
                        setHistory(data);
                    }
                } catch (err) {
                    console.error("Failed to fetch history:", err);
                    setError("Failed to load history data from API.");
                } finally {
                    setLoading(false);
                }
            };
            fetchHistoryData();
        }
    }, [open, identifier]);

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Details for "{label}"
                </Typography>
                
                {/* Display all field warnings/errors passed from KeyValueRow */}
                {issues.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        {issues.map((issue, idx) => (
                            <Alert
                                key={idx}
                                severity={
                                    issue.icon?.props?.color === "error"
                                        ? "error"
                                        : "warning"
                                }
                                sx={{ mb: 1 }}
                            >
                                {issue.message}
                            </Alert>
                        ))}
                    </Box>
                )}

                {/* Display API Errors */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Display API Warnings */}
                {warnings.length > 0 && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        <Typography
                            variant="body2"
                            component="ul"
                            sx={{ listStyleType: "none", p: 0, m: 0 }}
                        >
                            {warnings.map((w, i) => (
                                <li key={i}>{w}</li>
                            ))}
                        </Typography>
                    </Alert>
                )}

                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="body1" fontWeight="bold">
                            Current Value:
                        </Typography>
                        <Typography variant="h6">
                            {field?.value} {field?.unit}
                        </Typography>
                    </CardContent>
                </Card>

                {explanation && (
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="body1" fontWeight="bold">
                                Explanation:
                            </Typography>
                            <Typography variant="body2">{explanation}</Typography>
                        </CardContent>
                    </Card>
                )}

                <Card variant="outlined">
                    <CardContent>
                        <Typography
                            variant="body1"
                            fontWeight="bold"
                            gutterBottom
                        >
                            History
                        </Typography>
                        {loading ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    p: 4,
                                }}
                            >
                                <CircularProgress />
                            </Box>
                        ) : history.length > 0 ? (
                            field?.type === "number" ? (
                                <Box sx={{ width: "100%", height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={history}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="timestamp"
                                                tickFormatter={(ts) =>
                                                    new Date(ts).toLocaleDateString()
                                                }
                                            />
                                            <YAxis />
                                            <RechartsTooltip
                                                formatter={(value) => [
                                                    `${value} ${field?.unit}`,
                                                    "Value",
                                                ]}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#8884d8"
                                                strokeWidth={2}
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Box>
                            ) : (
                                <Box
                                    sx={{
                                        maxHeight: 200,
                                        overflowY: "auto",
                                        p: 1,
                                        bgcolor: "grey.100",
                                        borderRadius: 1,
                                    }}
                                >
                                    {history.map((entry, index) => (
                                        <Box key={index} sx={{ mb: 1 }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontSize: "0.8rem",
                                                    color: "text.secondary",
                                                }}
                                            >
                                                {new Date(
                                                    entry.timestamp
                                                ).toLocaleString()}
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                sx={{ fontWeight: "medium" }}
                                            >
                                                {typeof entry.value === "number"
                                                    ? entry.value.toFixed(2)
                                                    : entry.value}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )
                        ) : (
                            <Typography
                                variant="body2"
                                sx={{ fontStyle: "italic" }}
                            >
                                No history available.
                            </Typography>
                        )}
                    </CardContent>
                </Card>

                <CardActions sx={{ justifyContent: "flex-end", pr: 0 }}>
                    <Button onClick={onClose} variant="contained">
                        Close
                    </Button>
                </CardActions>
            </Box>
        </Modal>
    );
}

export default KeyValueDetailsModal;
