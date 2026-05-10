import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box, Container } from "@mui/material";
import Home from "./pages/Home";
import RouteMap from "./pages/RouteMap/RouteMap";

const App = () => {
  return (
    <Router>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(180deg, #f1f4fa 0%, #f8f9fd 100%)",
          py: { xs: 0, sm: 2.5 },
        }}
      >
        <Container maxWidth={false} disableGutters sx={{ display: "flex", justifyContent: "center" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/routemap" element={<RouteMap />} />
          </Routes>
        </Container>
      </Box>
    </Router>
  );
};

export default App;
