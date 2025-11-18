import React from "react";
import { Box } from "@mui/material";
import RepositoryList from "./components/RepositoryList";
import "./App.css";

function App() {
  return (
    <Box className="app-container">
      <RepositoryList />
    </Box>
  );
}

export default App;
