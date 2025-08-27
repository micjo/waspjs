// src/components/ui/TemplatePopup.jsx

import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemButton, ListItemText, CircularProgress, Button, Box } from "@mui/material";

function TemplatePopup({ open, onClose, activities, onSelectTemplate, isLoading }) {
  return (
    <Dialog open={open} onClose={onClose}>
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
                <ListItemButton onClick={() => onSelectTemplate(activity)}>
                  <ListItemText primary={activity} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}

export default TemplatePopup;