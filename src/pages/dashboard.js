import { React, useState, useEffect } from "react";
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

function KeyValueRow({ label, field, isEditing, onChange, updatableEndpoints }) {
  const { type, value, unit, options, min, max } = field; // Destructure min and max

  // Find the endpoint information for this field
  const endpointInfo = updatableEndpoints[`${label}.${field.key}`];
  const warningBounds = endpointInfo ? endpointInfo['warning-bounds'] : null;
  const errorBounds = endpointInfo ? endpointInfo['error-bounds'] : null;

  // Determine the color based on bounds
  let textColor = 'text.primary';
  let errorText = null;
  let isFieldInError = false;

  if (value !== undefined && typeof value === 'number') {
    // Check for min/max bounds from the field itself (NEW)
    if ((min !== undefined && value < min) || (max !== undefined && value > max)) {
        textColor = 'error.main'; // Red for out of min/max bounds
        isFieldInError = true;
        errorText = `Value out of range [${min !== undefined ? min : '-∞'}, ${max !== undefined ? max : '∞'}]`;
    } 
    // Existing checks for warning/error bounds from endpointInfo, only if not already in min/max error
    else if (errorBounds && (value < errorBounds[0] || value > errorBounds[1])) {
      textColor = 'error.main'; // Red for API error bounds
      isFieldInError = true;
      errorText = `Value out of API error bounds [${errorBounds[0]}, ${errorBounds[1]}]`;
    } else if (warningBounds && (value < warningBounds[0] || value > warningBounds[1])) {
      textColor = 'warning.main'; // Orange for API warning bounds
      errorText = `Value out of API warning bounds [${warningBounds[0]}, ${warningBounds[1]}]`;
    }
  }

  const handleChange = (newVal) => {
    onChange(label, { ...field, value: newVal });
  };

  const isUnitField = type === "number" || type === "boolean" || type === "selection";
  const labelXs = 6;
  const valueXs = isUnitField ? 3 : 6;
  const totalXs = labelXs + valueXs;
  const remainingXs = 12 - totalXs;
  const unitXs = remainingXs;
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
        <Box display="flex" flexDirection="column" alignItems="flex-start" gap={0.5}> {/* Adjusted for helperText */}
          {isEditing ? (
            <>
              {/* Conditional rendering for different input types */}
              {type === "number" && (
                <TextField
                  type="number"
                  size="small"
                  value={value}
                  onChange={(e) => handleChange(e.target.value)}
                  disabled={isDisabled} // Now only depends on field.disabled
                  error={isFieldInError} // Show error state for TextField
                  helperText={isFieldInError ? errorText : null} // Show error message
                  sx={{ width: '100%' }} // Ensure TextField takes full available width
                />
              )}
              {type === "text" && (
                <TextField
                  size="small"
                  fullWidth
                  value={value}
                  multiline
                  onChange={(e) => handleChange(e.target.value)}
                  disabled={isDisabled} // Now only depends on field.disabled
                />
              )}
              {type === "timestamp" && (
                <TextField
                  size="small"
                  fullWidth
                  value={value}
                  disabled // Timestamps are always disabled for editing
                />
              )}
              {type === "boolean" && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!value}
                      onChange={(e) => handleChange(e.target.checked)}
                      disabled={isDisabled} // Now only depends on field.disabled
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
                  disabled={isDisabled} // Now only depends on field.disabled
                  sx={{ width: '100%' }} // Ensure Select takes full available width
                >
                  {options.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              )}
              {/* Display error text if in error state and not a number field or if number field has no specific input component */}
              {!['number', 'text', 'timestamp', 'boolean', 'selection'].includes(type) && isFieldInError && (
                <Typography variant="caption" color="error.main">{errorText}</Typography>
              )}
            </>
          ) : (
            <>
              {/* Display the value in view mode with conditional color */}
              {type === "number" && (
                <Typography variant="body2" color={textColor}>{value}</Typography>
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
              {/* Display error text in view mode */}
              {errorText && (
                <Typography variant="caption" color="error.main">{errorText}</Typography>
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

// Rest of the components remain the same

function DashboardSection({ title, values, isEditing, onChange, titleColor, updatableEndpoints }) {
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
            updatableEndpoints={updatableEndpoints}
          />
        ))}
    </Paper>
  );
}

export function Dashboard() {
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
            {/* The load template button has been moved to the right */}
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
          <Box sx={{ width: '33.3%', display: 'flex', flexDirection:"column", alignItems: 'flex-end' }}>
            {!hideAppBar && (
              <ButtonGroup>
                {isEditing ? (
                  <>
                    <Button variant="contained" onClick={handleSave}>
                      Save
                    </Button>
                    <Button onClick={handleCancel}>Cancel</Button>
                    <Button variant="outlined" onClick={handleFetchActivities}>
                      Load Template
                    </Button>
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
                titleColor={editedDashboard[section].color}
                updatableEndpoints={updatableEndpoints}
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