require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDataFiles } = require('./utils/fileHandler');

const authRoutes = require('./routes/auth.routes');
const tasksRoutes = require('./routes/tasks.routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);

// Initialize data files and start server
initDataFiles().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
