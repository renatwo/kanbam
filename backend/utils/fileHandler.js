const fs = require('fs/promises');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

// Ensure data directory and files exist
async function initDataFiles() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    try {
      await fs.access(USERS_FILE);
    } catch {
      await fs.writeFile(USERS_FILE, '[]');
    }

    try {
      await fs.access(TASKS_FILE);
    } catch {
      await fs.writeFile(TASKS_FILE, '[]');
    }
    console.log('Data files initialized correctly.');
  } catch (error) {
    console.error('Error initializing data files:', error);
  }
}

async function readData(file) {
  const filePath = file === 'users' ? USERS_FILE : TASKS_FILE;
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${file} data:`, error);
    return [];
  }
}

async function writeData(file, data) {
  const filePath = file === 'users' ? USERS_FILE : TASKS_FILE;
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${file} data:`, error);
    return false;
  }
}

module.exports = {
  initDataFiles,
  readData,
  writeData
};
