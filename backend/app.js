const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const morgan = require('morgan')
const cors = require('cors')
const app = express();

app.use(express.json())
app.use(cors({ 
    origin: 'http://localhost:5174', // Change this to your client's origin
    credentials: true, // Allow credentials (cookies) to be sent
  }));
app.use(cookieParser());
app.use(morgan('dev'))

const SECRET_KEY = 'your-secret-key';
const REFRESH_SECRET_KEY = 'your-refresh-secret-key';

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Authenticate user and generate tokens
  const user = { id: 123, username };
  const accessToken = jwt.sign(user, SECRET_KEY, { expiresIn: '1m' });
  const refreshToken = jwt.sign(user, REFRESH_SECRET_KEY, { expiresIn: '5m' });

  // Store the refresh token on the server (e.g., in a database)

  res.cookie('authToken', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  });

  res.status(200).json({ message: 'Logged in successfully.', accessToken, refreshToken });
});

app.post('/refresh-token', (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token not provided.' });
  }

  jwt.verify(refreshToken, REFRESH_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid refresh token.' });
    }

    const user = { id: decoded.id, username: decoded.username };
    const newAccessToken = jwt.sign(user, SECRET_KEY, { expiresIn: '1m' });

    res.cookie('authToken', newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    res.status(200).json({ message: 'Access token refreshed successfully.' });
  });
});

app.get('/protected', (req, res) => {

  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
        console.log(err)
      return res.status(403).json({ message: 'Invalid token.' });
    }
    // Token is valid, allow access to protected route
    res.json({ message: 'Access granted to protected route.' });
  });
});

app.get('/logout', (req, res) => {
  res.clearCookie('authToken');
  res.json({ message: 'Logged out successfully.' });
});

app.listen(9191, () => {
  console.log('Server is running on port 9191');
});
