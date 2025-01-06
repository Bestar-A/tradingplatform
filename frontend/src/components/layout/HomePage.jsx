import React from "react";
import { Box, Typography, Button, Stack, Container } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";

const HomePage = () => {
  const { isAuthenticated, username, logout } = useAuth();
  const customColor = "#7d72f6"; // Updated custom color

  return (
    <Container
      maxWidth="md"
      sx={{
        textAlign: "center",
        marginTop: 14,
        padding: 4,
        borderRadius: 2,
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",   
        background: '#16171a'
      }}
    >
      <Typography variant="h3" gutterBottom>
        Welcome to the Trading App
      </Typography>
      <Typography
        variant="body1"
        color="textSecondary"
        sx={{ color: "whitesmoke" }}
      >
        Start trading today! Manage your portfolio, monitor stocks, and stay on
        top of the market.
      </Typography>
      <Box
        component="img"
        src="./img/back2.jpg" // Replace with your image URL
        alt="Trading Visualization"
        sx={{
          width: "100%",
          maxWidth: "600px",
          margin: "15px auto",
          display: "block",
          borderRadius: 2,
        }}
      />
      <Stack spacing={2} mt={4}>
        {!isAuthenticated ? (
          <>
            <Button
              variant="contained"
              sx={{
                backgroundColor: customColor,
                "&:hover": { backgroundColor: "#5c53e0" }, // Darker shade on hover
              }}
              href="/register"
            >
              Register
            </Button>
            <Button
              variant="outlined"
              sx={{
                borderColor: customColor,
                color: customColor,
                "&:hover": { borderColor: "#5c53e0", color: "#5c53e0" }, // Darker hover effect
              }}
              href="/login"
            >
              Login
            </Button>
          </>
        ) : (
          <>
            <Typography variant="h6" color="white">
              Welcome back, {username}!
            </Typography>
            <Button
              variant="contained"
              sx={{
                backgroundColor: customColor,
                "&:hover": { backgroundColor: "#5c53e0" }, // Darker shade on hover
              }}
              href="/dashboard"
            >
              Go to Dashboard
            </Button>
            <Button
              variant="outlined"
              sx={{
                borderColor: "#f50057", // Logout button in a different color
                color: "#f50057",
                "&:hover": { borderColor: "#ff4081", color: "#ff4081" },
              }}
              onClick={logout}
            >
              Logout
            </Button>
          </>
        )}
      </Stack>
    </Container>
  );
};

export default HomePage;
