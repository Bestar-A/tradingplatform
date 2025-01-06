import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Create a dark theme
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    height: 400,
  },
});

export default function AdvancedView(props) {
  const { rows, columns } = props;
  
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Paper
        sx={{
          height: 320,
          width: "100%",
          backgroundColor: "inherit",
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          hideFooter 
          sx={{
            color: "white", // Adjust font color for better contrast
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
            }, // Custom cell border
          }}
        />
      </Paper>
    </ThemeProvider>
  );
}
