// src/components/DashboardSection.jsx

import React from "react";
import { Paper, Typography } from "@mui/material";
import KeyValueRow from "./KeyValueRow";

function DashboardSection({ title, values, isEditing, onChange, titleColor }) {
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
          />
        ))}
    </Paper>
  );
}

export default DashboardSection;