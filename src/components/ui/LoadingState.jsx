// src/components/ui/LoadingState.jsx

import React from "react";
import { Box, Button, CircularProgress, Typography, Alert } from "@mui/material";

function LoadingState({ isLoading, error }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
      {isLoading && !error ? (
        <>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="body1">Loading...</Typography>
          <Typography variant="body2" color="text.secondary">
            Fetching data from your backend. Please check the `Reload` button if it takes too long.
          </Typography>
        </>
      ) : (
        <>
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          <Typography variant="body1">
            Unable to fetch data. Please check the API server connection and try again.
          </Typography>
        </>
      )}
      <Button onClick={() => window.location.reload()} variant="outlined" sx={{ mt: 2 }}>Reload</Button>
    </Box>
  );
}

export default LoadingState;