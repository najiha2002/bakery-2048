// API Service - handles all backend communication

const API_BASE_URL = 'http://localhost:5130/api'
const TOKEN_STORAGE_KEY = 'bakery_jwt_token'
const PLAYER_ID_STORAGE_KEY = 'bakery_player_id'

// retrieve the stored authentication token
function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

// save authentication token to browser storage
function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  }
}

// remove authentication token and player data
function clearToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(PLAYER_ID_STORAGE_KEY)
}

// get user role from JWT token
function getUserRole() {
  const token = getToken()
  if (!token) return 'Player'
  
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]))
    return decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'Player'
  } catch (e) {
    return 'Player'
  }
}

// check if user is admin
function isAdmin() {
  return getUserRole() === 'Admin'
}

// core function to make HTTP requests to the backend
async function makeRequest(endpoint, method = 'GET', body = null, requiresAuth = true) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const headers = {
    'Content-Type': 'application/json'
  }
  
  const token = getToken()
  
  // check if user needs to be logged in for this request
  if (requiresAuth && !token) {
    throw new Error('Authentication required. Please login or register first.')
  }
  
  // include auth token in request if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const config = {
    method,
    headers
  }
  
  // attach request body for POST/PUT operations
  if (body) {
    config.body = JSON.stringify(body)
  }
  
  try {
    const response = await fetch(url, config)
    
    if (response.ok) {
      // some endpoints return no content
      if (response.status === 204) {
        return null
      }
      return await response.json()
    }
    
    // extract error message from response
    const errorData = await response.json().catch(() => ({}))
    const error = new Error(errorData.message || errorData.error || 'API Error')
    error.status = response.status
    error.data = errorData
    
    // if unauthorized and not on auth endpoints, redirect to login
    if (response.status === 401 && !endpoint.includes('/auth/')) {
      clearToken()
      if (window.authUI) {
        window.authUI.showAuthScreen()
        window.authUI.showError('Your session has expired. Please login again.')
      }
    }
    
    throw error
  } catch (error) {
    // console.error(`API Error [${method} ${endpoint}]:`, error)
    throw error
  }
}

// get the current player's ID from storage
function getPlayerId() {
  return localStorage.getItem(PLAYER_ID_STORAGE_KEY)
}

// save player ID to browser storage
function setPlayerId(playerId) {
  if (playerId) {
    localStorage.setItem(PLAYER_ID_STORAGE_KEY, playerId)
  }
}

// check if user is currently logged in
function isAuthenticated() {
  return getToken() !== null
}

// ensure user is logged in before proceeding
function requireAuth() {
  if (!isAuthenticated()) {
    throw new Error('Authentication required. Please login or register first.')
  }
}

// ========================================
// Authentication
// ========================================

// create a new user account
async function register(username, email, password, role = 'Player') {
  const response = await makeRequest('/auth/register', 'POST', {
    username,
    email,
    password,
    role
  }, false) // No auth needed for registration
  
  if (response.token) {
    setToken(response.token)
  }
  
  return response
}

// log in with existing credentials
async function login(username, password) {
  const response = await makeRequest('/auth/login', 'POST', {
    username,
    password
  }, false) // No auth needed for login
  
  if (response.token) {
    setToken(response.token)
  }
  
  return response
}

// log out and clear session data
function logout() {
  clearToken()
}

// ========================================
// Player Management
// ========================================

// get all players, optionally limiting results
async function getAllPlayers(top = null) {
  const endpoint = top ? `/players?top=${top}` : '/players'
  return await makeRequest(endpoint, 'GET', null, true)
}

// get a specific player's profile by ID
async function getPlayerById(id) {
  return await makeRequest(`/players/${id}`, 'GET', null, true)
}

// update player statistics and info
async function updatePlayer(id, playerData) {
  return await makeRequest(`/players/${id}`, 'PUT', playerData, true)
}

// delete a player (admin only)
async function deletePlayer(id) {
  return await makeRequest(`/players/${id}`, 'DELETE', null, true)
}

// ========================================
// Bakery Tiles
// ========================================

// get all available bakery item tiles
async function getAllTiles() {
  return await makeRequest('/tiles', 'GET')
}

// get a specific tile by ID
async function getTileById(id) {
  return await makeRequest(`/tiles/${id}`, 'GET')
}

// create a new tile (admin only)
async function createTile(tileData) {
  return await makeRequest('/tiles', 'POST', tileData)
}

// update an existing tile (admin only)
async function updateTile(id, tileData) {
  return await makeRequest(`/tiles/${id}`, 'PUT', tileData)
}

// remove a tile from the game (admin only)
async function deleteTile(id) {
  return await makeRequest(`/tiles/${id}`, 'DELETE')
}

// ========================================
// Power-Ups
// ========================================

// get all available power-ups
async function getAllPowerUps() {
  return await makeRequest('/powerups', 'GET')
}

// get a specific power-up by ID
async function getPowerUpById(id) {
  return await makeRequest(`/powerups/${id}`, 'GET')
}

// create a new power-up (admin only)
async function createPowerUp(powerUpData) {
  return await makeRequest('/powerups', 'POST', powerUpData)
}

// update a power-up's properties (admin only)
async function updatePowerUp(id, powerUpData) {
  return await makeRequest(`/powerups/${id}`, 'PUT', powerUpData)
}

// remove a power-up from the game (admin only)
async function deletePowerUp(id) {
  return await makeRequest(`/powerups/${id}`, 'DELETE')
}

