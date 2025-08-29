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
    ButtonGroup
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
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: 1000,
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

const TIME_RANGES = {
    DAY: 'day',
    MONTH: 'month',
    YTD: 'ytd'
};

function KeyValueDetailsModal({ open, onClose, label, field, issues = [] }) {
    const [processedData, setProcessedData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [warnings, setWarnings] = useState([]);
    const [timeRange, setTimeRange] = useState(TIME_RANGES.MONTH);
    const [startTimestamp, setStartTimestamp] = useState(null);

    const explanation = field?.explanation;
    const identifier = field?.identifier;
    const min = field?.min;
    const max = field?.max;

    const computeStartTimestamp = (range) => {
        const now = new Date();
        let start;
        switch (range) {
            case TIME_RANGES.DAY:
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case TIME_RANGES.MONTH:
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case TIME_RANGES.YTD:
                start = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                start = new Date(0);
        }
        return start.getTime();
    };

    const fetchData = async (range, startTs = null) => {
        setLoading(true);
        setError(null);
        setWarnings([]);
        try {
            const start = startTs ?? computeStartTimestamp(range);
            setStartTimestamp(start);
            const rawData = await api.fetchHistory(identifier, start);
            const data = rawData.map(d => ({
                time: d.timestamp,
                value: d.value
            }));
            setProcessedData(data);
        } catch (err) {
            console.error("Failed to fetch history:", err);
            setError("Failed to load history data from API.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchData(timeRange);
        }
    }, [open, identifier, timeRange]);

    const handleTimeRangeChange = (range) => {
        setTimeRange(range);
        fetchData(range);
    };

    const handleGoBack = () => {
        let newStart;
        const start = startTimestamp ? new Date(startTimestamp) : new Date();
        switch (timeRange) {
            case TIME_RANGES.DAY:
                newStart = new Date(start.setDate(start.getDate() - 1));
                break;
            case TIME_RANGES.MONTH:
                newStart = new Date(start.setMonth(start.getMonth() - 1));
                break;
            case TIME_RANGES.YTD:
                newStart = new Date(start.setFullYear(start.getFullYear() - 1));
                break;
            default:
                newStart = start;
        }
        fetchData(timeRange, newStart.getTime());
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Details for "{label}"
                </Typography>

                {issues.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        {issues.map((issue, idx) => (
                            <Alert
                                key={idx}
                                severity={issue.icon?.props?.color === "error" ? "error" : "warning"}
                                sx={{ mb: 1 }}
                            >
                                {issue.message}
                            </Alert>
                        ))}
                    </Box>
                )}

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {warnings.length > 0 && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        <Typography variant="body2" component="ul" sx={{ listStyleType: "none", p: 0, m: 0 }}>
                            {warnings.map((w, i) => (<li key={i}>{w}</li>))}
                        </Typography>
                    </Alert>
                )}

                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="body1" fontWeight="bold">Current Value:</Typography>
                        <Typography variant="h6">{field?.value} {field?.unit}</Typography>
                        {(min !== undefined || max !== undefined) && (
                            <Typography variant="body2" color="text.secondary">
                                {min !== undefined && <>Min: {min} </>}
                                {max !== undefined && <>Max: {max}</>}
                            </Typography>
                        )}
                    </CardContent>
                </Card>

                {explanation && (
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="body1" fontWeight="bold">Explanation:</Typography>
                            <Typography variant="body2">{explanation}</Typography>
                        </CardContent>
                    </Card>
                )}

                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="body1" fontWeight="bold" gutterBottom>History</Typography>

                        {/* Time range buttons */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <ButtonGroup size="small">
                                {Object.values(TIME_RANGES).map(range => (
                                    <Button
                                        key={range}
                                        onClick={() => handleTimeRangeChange(range)}
                                        variant={timeRange === range ? 'contained' : 'outlined'}
                                    >
                                        {range.charAt(0).toUpperCase() + range.slice(1)}
                                    </Button>
                                ))}
                            </ButtonGroup>
                            <Button onClick={handleGoBack} startIcon={<ArrowBackIosIcon />}>Back</Button>
                        </Box>

                        {loading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : processedData.length > 0 ? (
                            field?.type === "number" ? (
                                <Box sx={{ width: "100%", height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={processedData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="time"
                                                type="number"
                                                domain={['auto', 'auto']}
                                                scale="time"
                                                tickFormatter={(ms) =>
                                                    new Date(ms).toLocaleString("en-GB", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        hour12: false
                                                    }).replace(",", "")
                                                }
                                            />
                                            <YAxis />
                                            <RechartsTooltip
                                                labelFormatter={(ms) =>
                                                    new Date(ms).toLocaleString("en-GB", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        hour12: false
                                                    }).replace(",", "")
                                                }
                                            />
                                            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={false} />
                                            {min !== undefined && <Line type="monotone" dataKey={() => min} stroke="green" strokeWidth={1} dot={false} />}
                                            {max !== undefined && <Line type="monotone" dataKey={() => max} stroke="red" strokeWidth={1} dot={false} />}
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Box>
                            ) : (
                                <Box sx={{ maxHeight: 200, overflowY: "auto", p: 1, bgcolor: "grey.100", borderRadius: 1 }}>
                                    {processedData.map((entry, index) => (
                                        <Box key={index} sx={{ mb: 1 }}>
                                            <Typography variant="body2" sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                                                {new Date(entry.time).toLocaleString("en-GB", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: false
                                                }).replace(",", "")}
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                                                {typeof entry.value === "number" ? entry.value.toFixed(2) : entry.value}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )
                        ) : (
                            <Typography variant="body2" sx={{ fontStyle: "italic" }}>No history available.</Typography>
                        )}
                    </CardContent>
                </Card>

                <CardActions sx={{ justifyContent: "flex-end", pr: 0 }}>
                    <Button onClick={onClose} variant="contained">Close</Button>
                </CardActions>
            </Box>
        </Modal>
    );
}

export default KeyValueDetailsModal;
