import React, { useContext, useState, useEffect } from "react";
import { NectarTitle} from "../App";
import {
  Box,
  Button,
  ButtonGroup,
  Grid,
  Paper,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Snackbar,
  Alert
} from "@mui/material";
import SyncIcon from '@mui/icons-material/Sync';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import AutorenewIcon from '@mui/icons-material/Autorenew';

// Base URLs for different API purposes
const DB_API_URL = "https://db.capitan.imec.be";
const MILL_API_URL = "https://mill.capitan.imec.be";

/**
 * Fetches the current dashboard data from the API.
 */
const fetchDashboardData = async () => {
  const url = `${DB_API_URL}/dashboard/current`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
};

/**
 * Fetches the list of available activity templates from the API.
 */
const fetchActivities = async () => {
  const url = `${DB_API_URL}/dashboard/templates`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
};

/**
 * Fetches a specific data template by name from the API.
 */
const fetchTemplate = async (templateName) => {
  const url = `${DB_API_URL}/dashboard/templates/${templateName}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
};

/**
 * Fetches the mapping of updatable fields to their respective API endpoints.
 */
const fetchUpdatableEndpoints = async () => {
    const url = `${DB_API_URL}/dashboard/endpoints`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
};

function KeyValueRow({ label, field, isEditing, onChange, onUpdate, isUpdatable }) {
  const { type, value, unit, options } = field;

  const handleChange = (newVal) => {
    onChange(label, { ...field, value: newVal });
  };

  const isUnitField = type === "integer" || type === "boolean" || type === "selection";
  const labelXs = 6;
  const valueXs = isUnitField ? 3 : 6;
  const totalXs = labelXs + valueXs;
  const remainingXs = 12 - totalXs;
  const unitXs = remainingXs;

  const isTimestamp = type === "timestamp";

  return (
    <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
      <Grid item xs={labelXs}>
        <Typography variant="body2" fontWeight="bold">
          {label}
        </Typography>
      </Grid>
      <Grid item xs={isTimestamp ? 6 : valueXs}>
        <Box display="flex" alignItems="center" gap={1}>
          {isEditing ? (
            <>
              {/* Conditional rendering for different input types */}
              {type === "integer" && (
                <TextField
                  type="number"
                  size="small"
                  value={value}
                  onChange={(e) => handleChange(e.target.value)}
                />
              )}
              {type === "text" && (
                <TextField
                  size="small"
                  fullWidth
                  value={value}
                  multiline
                  onChange={(e) => handleChange(e.target.value)}
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
                      onChange={(e) => handleChange(e.target.checked)}
                    />
                  }
                  label=""
                />
              )}
              {type === "selection" && (
                <Select
                  size="small"
                  value={value}
                  onChange={(e) => handleChange(e.target.value)}
                >
                  {options.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              )}
              {/* Show the update button only if the field is updatable */}
              {isUpdatable && (
                <IconButton
                  size="small"
                  onClick={() => onUpdate(label)}
                >
                  <SyncIcon />
                </IconButton>
              )}
            </>
          ) : (
            <>
              {/* Display the value in view mode */}
              {type === "integer" && (
                <Typography variant="body2">{value}</Typography>
              )}
              {type === "text" && <Typography variant="body2">{value}</Typography>}
              {type === "timestamp" && <Typography variant="body2">{value}</Typography>}
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
  );
}

function DashboardSection({ title, values, isEditing, onChange, onUpdateField, titleColor, updatableFields }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Typography variant="body1" fontWeight="bold" sx={{ color: titleColor }}>
        {title}
      </Typography>
      {Object.entries(values)
        .filter(([key]) => key !== 'color' && key !== 'Activity')
        .map(([key, field]) => (
          <KeyValueRow
            key={key}
            label={key}
            field={field}
            isEditing={isEditing}
            onChange={(k, updatedField) => onChange(title, k, updatedField)}
            onUpdate={(k) => onUpdateField(title, k)}
            isUpdatable={!!updatableFields[`${title}.${key}`]}
          />
        ))}
    </Paper>
  );
}

export function Dashboard() {
  const nectarTitle = useContext(NectarTitle);

  useEffect( () => nectarTitle.setTitle("Dashboard"))

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
  // New state to hold the fetched updatable endpoints
  const [updatableEndpoints, setUpdatableEndpoints] = useState({});
  // New state to control the visibility of the app bar (based on URL query)
  const [hideAppBar, setHideAppBar] = useState(false);

  // New state to manage save feedback
  const [saveStatus, setSaveStatus] = useState({
      open: false,
      message: '',
      severity: 'success',
  });

  const getData = async () => {
    setIsLoading(true);
    setIsRefreshSuccessful(false);
    setError(null); // Clear any existing errors at the start of the refresh
    try {
      const data = await fetchDashboardData();
      const endpoints = await fetchUpdatableEndpoints();
      setDashboard(data);
      setEditedDashboard(data);
      setActivityTitle(data.General?.Activity?.value || '');
      setCurrentTemplateName(data.General?.Activity?.value || '');
      setUpdatableEndpoints(endpoints);
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
    // Initial fetch on component mount
    getData();
    const params = new URLSearchParams(window.location.search);
    setHideAppBar(params.get('hide-appbar') === 'true');
  }, []); // Run only on component mount

  useEffect(() => {
    // Set up auto-refresh only when not in editing mode
    if (!isEditing) {
      const interval = setInterval(() => {
        getData();
      }, 10000); // 10000 ms = 10 seconds
      // Cleanup function to clear the interval when the component unmounts or editing starts
      return () => clearInterval(interval);
    }
  }, [isEditing]); // Rerun whenever isEditing changes

  const handleFetchActivities = async () => {
    setIsLoading(true);
    try {
      const fetchedActivities = await fetchActivities();
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

  const handleUpdateField = async (section, key) => {
    // Get the full key path (e.g., "Beam.Energy")
    const fullKey = `${section}.${key}`;
    const endpointConfig = updatableEndpoints[fullKey];

    if (!endpointConfig || typeof endpointConfig.url !== 'string' || typeof endpointConfig.key !== 'string') {
      setError(`No valid update endpoint found for ${fullKey}`);
      return;
    }

    try {
      const url = `${MILL_API_URL}${endpointConfig.url}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch live data from ${url}. Status: ${response.status}`);
      }
      const data = await response.json();
      
      // Handle nested keys by splitting the key path
      const keyPath = endpointConfig.key.split('.');
      let newValue = data;
      for (const k of keyPath) {
        if (typeof newValue !== 'object' || newValue === null || !(k in newValue)) {
          throw new Error(`Invalid key path: "${endpointConfig.key}". Key "${k}" not found.`);
        }
        newValue = newValue[k];
      }
      
      if (newValue === undefined) {
          throw new Error(`Value for key path "${endpointConfig.key}" is undefined.`);
      }

      handleChange(section, key, { ...editedDashboard[section][key], value: newValue });
      setError(null);
    } catch (err) {
      setError(`Failed to update ${fullKey}: ${err.message}`);
    }
  };
  
  const handleUpdateAllFields = async () => {
    setIsLoading(true);
    try {
      // Create a list of all updatable field promises
      const updatePromises = Object.keys(updatableEndpoints).map(async fullKey => {
        const [section, key] = fullKey.split('.');
        try {
          // Await each update to ensure they happen in order and prevent race conditions
          await handleUpdateField(section, key);
        } catch (err) {
          console.error(`Error updating field ${fullKey}: ${err.message}`);
          // Do not re-throw, just log the error and continue with the next field
        }
      });
      // Wait for all updates to complete
      await Promise.all(updatePromises.map(p => p.catch(e => e)));
      // After all updates, re-fetch the dashboard data to ensure consistency.
      await getData();
      setSaveStatus({
          open: true,
          message: 'All updatable fields have been refreshed!',
          severity: 'success',
      });
    } catch (err) {
      console.error('Update all failed:', err);
      setSaveStatus({
          open: true,
          message: `Error updating all fields: ${err.message}`,
          severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadTemplate = async (templateName) => {
    setIsLoading(true);
    try {
      const template = await fetchTemplate(templateName);
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

  /**
   * Saves the current edited dashboard data to the API.
   * This function sends the data via a POST request to the configured save endpoint.
   */
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
      const response = await fetch(`${DB_API_URL}/dashboard/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDashboard),
      });

      if (!response.ok) {
        // Attempt to read the error text from the response body
        const errorText = await response.text();
        throw new Error(`Failed to save dashboard: ${response.status} ${errorText}`);
      }

      // If save is successful, update the local state and provide feedback
      setDashboard(updatedDashboard);
      setIsEditing(false);
      setSaveStatus({
          open: true,
          message: 'Dashboard saved successfully!',
          severity: 'success',
      });
    } catch (err) {
      console.error('Save failed:', err);
      // Provide user-friendly feedback on failure
      setSaveStatus({
          open: true,
          message: `Error saving dashboard: ${err.message}`,
          severity: 'error',
      });
      // Also set the general error state for the main error display
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setEditedDashboard(dashboard);
    setActivityTitle(dashboard.General.Activity.value);
    setIsEditing(false);
  };

  // Conditional rendering for the initial loading screen
  if (!dashboard && isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="body1">Loading...</Typography>
        <Typography variant="body2" color="text.secondary">
          Fetching data from your backend. Please check the `Reload` button if it takes too long.
        </Typography>
        <Button onClick={() => window.location.reload()} variant="outlined" sx={{ mt: 2 }}>Reload</Button>
      </Box>
    );
  } else if (!dashboard && error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Typography variant="body1">
          Unable to fetch data. Please check the API server connection and try again.
        </Typography>
        <Button onClick={() => window.location.reload()} variant="outlined" sx={{ mt: 2 }}>Reload</Button>
      </Box>
    );
  }

  const sections = Object.entries(editedDashboard || {});
  const numColumns = 3;
  const columns = Array.from({ length: numColumns }, () => []);

  sections.forEach((section, index) => {
    columns[index % numColumns].push(section);
  });
  
  return (
    <Box>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        mb={3}
      >
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ width: '33.3%', display: 'flex', justifyContent: 'flex-start', gap: 1 }}>
            {isEditing && (
              <>
                <Button variant="outlined" onClick={handleFetchActivities}>
                  Load Template
                </Button>
                <Button variant="outlined" onClick={handleUpdateAllFields} disabled={isLoading}>
                    <AutorenewIcon sx={{ mr: 1 }} />
                    Update All
                </Button>
              </>
            )}
          </Box>
          <Box sx={{ width: '33.3%', textAlign: 'center' }}>
            {isEditing ? (
              <>
                <TextField
                  size="small"
                  variant="outlined"
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  sx={{ mb: 1.5, '& .MuiInputBase-input': { fontSize: '2rem', fontWeight: 'bold', textAlign: 'center' }}}
                />
                {currentTemplateName && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: -1.5, mb: 1.5 }}>
                    Template: {currentTemplateName}
                  </Typography>
                )}
              </>
            ) : (
              <>
                <Typography 
                  variant="h4" 
                  sx={{
                    p: 1,
                    mb: 1,
                    borderRadius: '4px',
                  }}
                >
                  {activityTitle}
                </Typography>
                {currentTemplateName && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: -1.5, mb: 1.5 }}>
                    Template: {currentTemplateName}
                  </Typography>
                )}
              </>
            )}
          </Box>
          <Box sx={{ width: '33.3%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            {!hideAppBar && (
              <ButtonGroup>
                {isEditing ? (
                  <>
                    <Button variant="contained" onClick={handleSave}>
                      Save
                    </Button>
                    <Button onClick={handleCancel}>Cancel</Button>
                  </>
                ) : (
                  <>
                    <Button variant="outlined" onClick={() => setIsEditing(true)}>
                      Edit
                    </Button>
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
                onUpdateField={handleUpdateField}
                titleColor={editedDashboard[section].color}
                updatableFields={updatableEndpoints}
              />
            ))}
          </Box>
        ))}
      </Box>

      {/* The new template loading popup */}
      <Dialog open={isPopupOpen} onClose={() => setIsPopupOpen(false)}>
        <DialogTitle>Load Predefined Template</DialogTitle>
        <DialogContent>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {activities.map((activity) => (
                <ListItem key={activity} disablePadding>
                  <ListItemButton onClick={() => handleLoadTemplate(activity)}>
                    <ListItemText primary={activity} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPopupOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for error messages */}
      <Snackbar open={saveStatus.open || !!error} autoHideDuration={6000} onClose={() => {
          setSaveStatus(prev => ({ ...prev, open: false }));
          setError(null);
      }} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => {
            setSaveStatus(prev => ({ ...prev, open: false }));
            setError(null);
        }} severity={saveStatus.severity || (error ? 'error' : 'success')} sx={{ width: '100%' }}>
          {saveStatus.message || error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Dashboard;
