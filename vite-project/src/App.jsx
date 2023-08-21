import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from 'js-cookie';

function App() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check if the access token is present and not expired
    const accessToken = Cookies.get("authToken");
    if (accessToken) {
      const tokenExpiration = new Date(accessToken.split('.')[1]); // Extract and parse token payload
      if (tokenExpiration > new Date()) {
        setAuthenticated(true);
      } else {
        // Cookies.remove("authToken");
        // setAuthenticated(false)
        handleRefreshToken()

      }
    }
  }, []);

  const handleRefreshToken = async () => {
    try {
      const response = await axios.post('http://localhost:9191/refresh-token', null, {
        withCredentials: true,
      });

      if (response.status === 200) {
        console.log('Access token refreshed successfully.');
      }
    } catch (error) {
      console.error('Refresh token error:', error.response.data.message);
    }
  };


  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:9191/login", {
        username: "user123",
        password: "password123",
      });

      if (response.data.message === "Logged in successfully.") {
        setAuthenticated(true);
        const expirationDate = new Date();
        expirationDate.setTime(expirationDate.getTime() + 60000);
        Cookies.set("authToken", response.data.accessToken, { expires: expirationDate });
        expirationDate.setTime(expirationDate.getTime() + 300000);
        Cookies.set("refreshToken", response.data.refreshToken, { expires: expirationDate });
      }
    } catch (error) {
      console.error("Login error:", error.response.data.message);
    }
  };

  const handleProtectedRequest = async () => {
    try {
      const response = await axios.get("http://localhost:9191/protected", {
        withCredentials: true, // Send cookies with the request
      });
      console.log(response.data.message);
    } catch (error) {
      console.error("Protected request error:", error.response.data.message);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:9191/logout");
      setAuthenticated(false);
      console.log("Logged out successfully.");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div>
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleProtectedRequest} disabled={!authenticated}>
        Protected Request
      </button>
      <button onClick={handleLogout} disabled={!authenticated}>
        Logout
      </button>
    </div>
  );
}

export default App;
