// src/components/Dashboard.jsx
import React, { useContext, useEffect, useState } from "react";
import { NectarTitle } from "../App";
import {
    Box,
    Button,
    ButtonGroup,
    Grid,
    TextField,
    Typography,
    CircularProgress,
    Snackbar,
    Alert
} from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import DashboardAPI from '../api/DashboardAPI';
import DashboardSection from "./DashboardSection";
import LoadingState from "./ui/LoadingState";
import TemplatePopup from "./ui/TemplatePopup";
import KeyValueDetailsModal from './KeyValueDetailsModal';

export function Dashboard() {
    const nectarTitle = useContext(NectarTitle);

    useEffect(() => nectarTitle.setTitle("Dashboard"))

    const [dashboard, setDashboard] = useState(null);
    const [activities, setActivities] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editedDashboard, setEditedDashboard] = useState(null);
    const [lastRefresh, setLastRefresh] = useState(null);
    const [activityTitle, setActivityTitle] = useState('');
    const [currentTemplateName, setCurrentTemplateName] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshSuccessful, setIsRefreshSuccessful] = useState(false);
    const [hideAppBar, setHideAppBar] = useState(false);
    const [saveStatus, setSaveStatus] = useState({ open: false, message: '', severity: 'success' });
    const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);

    const handleOpenTitleModal = () => {
        setIsTitleModalOpen(true);
    };

    const handleCloseTitleModal = () => {
        setIsTitleModalOpen(false);
    };

    const getData = async () => {
        setIsLoading(true);
        setIsRefreshSuccessful(false);
        setError(null);
        try {
            const [data] = await Promise.all([
                DashboardAPI.fetchDashboardData(),
            ]);
            setDashboard(data);
            setEditedDashboard(data);
            setActivityTitle(data.General?.Activity?.value || '');
            setCurrentTemplateName(data.General?.Activity?.value || '');
            setIsRefreshSuccessful(true);
        } catch (err) {
            setError(err.message);
            setIsRefreshSuccessful(false);
        } finally {
            setIsLoading(false);
            setLastRefresh(new Date());
        }
    };

    useEffect(() => {
        getData();
        const params = new URLSearchParams(window.location.search);
        setHideAppBar(params.get('hide-appbar') === 'true');
    }, []);

    useEffect(() => {
        if (!isEditing) {
            const interval = setInterval(() => getData(), 10000);
            return () => clearInterval(interval);
        }
    }, [isEditing]);

    const handleFetchActivities = async () => {
        setIsLoading(true);
        try {
            const fetchedActivities = await DashboardAPI.fetchActivities();
            setActivities(fetchedActivities);
            setIsPopupOpen(true);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (section, key, newField) => {
        setEditedDashboard((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: newField,
            },
        }));
    };

    const handleLoadTemplate = async (templateName) => {
        setIsLoading(true);
        try {
            const template = await DashboardAPI.fetchTemplate(templateName);
            setEditedDashboard(template);
            setActivityTitle(template.General.Activity.value);
            setCurrentTemplateName(templateName);
            setIsPopupOpen(false);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        const updatedDashboard = {
            ...editedDashboard,
            "General": {
                ...editedDashboard.General,
                "Activity": {
                    ...editedDashboard.General.Activity,
                    value: activityTitle
                }
            }
        };

        try {
            await DashboardAPI.saveDashboard(updatedDashboard);
            setDashboard(updatedDashboard);
            setIsEditing(false);
            setSaveStatus({ open: true, message: 'Dashboard saved successfully!', severity: 'success' });
        } catch (err) {
            console.error('Save failed:', err);
            setSaveStatus({ open: true, message: `Error saving dashboard: ${err.message}`, severity: 'error' });
            setError(err.message);
        }
    };

    const handleCancel = () => {
        setEditedDashboard(dashboard);
        setActivityTitle(dashboard.General.Activity.value);
        setIsEditing(false);
    };

    if (!dashboard && (isLoading || error)) {
        return <LoadingState isLoading={isLoading} error={error} />;
    }

    const sections = Object.entries(editedDashboard || {});
    const numColumns = 5;
    const columns = Array.from({ length: numColumns }, () => []);
    sections.forEach((section, index) => {
        columns[index % numColumns].push(section);
    });

    return (
        <Box>
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ width: '33.3%', display: 'flex', justifyContent: 'flex-start', gap: 1 }}></Box>
                    <Box sx={{ width: '33.3%', textAlign: 'center' }}>
                        {isEditing ? (
                            <>
                                <TextField
                                    size="small"
                                    variant="outlined"
                                    value={activityTitle}
                                    onChange={(e) => setActivityTitle(e.target.value)}
                                    sx={{ mb: 1.5, '& .MuiInputBase-input': { fontSize: '2rem', fontWeight: 'bold', textAlign: 'center' } }}
                                />
                                {currentTemplateName && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: -1.5, mb: 1.5 }}>
                                        Template: {currentTemplateName}
                                    </Typography>
                                )}
                            </>
                        ) : (
                            <>
                                <Box
                                    onClick={handleOpenTitleModal}
                                    sx={{
                                        cursor: 'pointer',
                                        '&:hover': { textDecoration: 'underline' }
                                    }}
                                >
                                    <Typography variant="h4" sx={{ p: 1, mb: 1, borderRadius: '4px' }}>
                                        {activityTitle}
                                    </Typography>
                                </Box>
                                {currentTemplateName && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: -1.5, mb: 1.5 }}>
                                        Template: {currentTemplateName}
                                    </Typography>
                                )}
                            </>
                        )}
                    </Box>
                    <Box sx={{ width: '33.3%', display: 'flex', flexDirection: "column", alignItems: 'flex-end' }}>
                        {!hideAppBar && (
                            <ButtonGroup>
                                {isEditing ? (
                                    <>
                                        <Button variant="contained" onClick={handleSave}>Save</Button>
                                        <Button onClick={handleCancel}>Cancel</Button>
                                        <Button variant="outlined" onClick={handleFetchActivities}>Load Template</Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="outlined" onClick={() => setIsEditing(true)}>Edit</Button>
                                        <Button variant="outlined" onClick={() => window.location.reload()}>
                                            <ReplayIcon sx={{ mr: 1 }} />
                                            Reload
                                        </Button>
                                    </>
                                )}
                            </ButtonGroup>
                        )}
                        <Box display="flex" alignItems="center" mt={1}>
                            <Typography variant="body2" color="text.secondary">
                                Last Refreshed: {lastRefresh ? lastRefresh.toLocaleTimeString() : 'N/A'}
                            </Typography>
                            {isLoading ? (
                                <CircularProgress size={20} sx={{ ml: 0.5 }} />
                            ) : isRefreshSuccessful ? (
                                <CheckCircleOutlineIcon color="success" sx={{ ml: 0.5 }} />
                            ) : null}
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
                {columns.map((column, colIndex) => (
                    <Box key={colIndex} sx={{ flex: 1 }}>
                        {column.map(([section, values]) => (
                            <DashboardSection
                                key={section}
                                title={section}
                                values={editedDashboard[section]}
                                isEditing={isEditing}
                                onChange={handleChange}
                                titleColor={editedDashboard[section].color}
                            />
                        ))}
                    </Box>
                ))}
            </Box>

            <TemplatePopup
                open={isPopupOpen}
                onClose={() => setIsPopupOpen(false)}
                activities={activities}
                onSelectTemplate={handleLoadTemplate}
                isLoading={isLoading}
            />

            {dashboard?.General?.Activity && (
                <KeyValueDetailsModal
                    open={isTitleModalOpen}
                    onClose={handleCloseTitleModal}
                    label={"Activity Title"}
                    field={dashboard.General.Activity}
                />
            )}

            <Snackbar
                open={saveStatus.open || !!error}
                autoHideDuration={6000}
                onClose={() => { setSaveStatus(prev => ({ ...prev, open: false })); setError(null); }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => { setSaveStatus(prev => ({ ...prev, open: false })); setError(null); }}
                    severity={saveStatus.severity || (error ? 'error' : 'success')}
                    sx={{ width: '100%' }}
                >
                    {saveStatus.message || error}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default Dashboard;
