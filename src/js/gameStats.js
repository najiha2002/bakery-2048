// handles saving game progress to the backend

class GameStats {
  constructor() {
    this.playerId = null
    this.startTime = null
    this.moveCount = 0
    this.highestTile = 0
    this.autoSaveInterval = null
    this.lastSaveTime = null
    this.loadPlayerProfile()
    this.setupAutoSave()
  }

  // load player profile when game starts
  async loadPlayerProfile() {
    if (!isAuthenticated()) return

    try {
      const playerId = getPlayerId()
      if (playerId) {
        this.playerId = playerId
        const player = await getPlayerById(playerId)
        
        // update best score display from backend
        if (player.highestScore) {
          const bestScoreEl = document.getElementById('bestScore')
          if (bestScoreEl) {
            bestScoreEl.textContent = player.highestScore
          }
        }
      }
    } catch (error) {
      console.error('Failed to load player profile:', error)
    }
  }

  // start tracking a new game session
  startGame() {
    this.startTime = Date.now()
    this.moveCount = 0
    this.highestTile = 0
    this.startAutoSave()
  }

  // increment move counter
  recordMove() {
    this.moveCount++
  }

  // track highest tile achieved
  updateHighestTile(tileValue) {
    if (tileValue > this.highestTile) {
      this.highestTile = tileValue
    }
  }

  // calculate total play time in seconds
  getPlayTime() {
    if (!this.startTime) return 0
    return Math.floor((Date.now() - this.startTime) / 1000)
  }

  // format playtime as HH:MM:SS
  formatPlayTime(seconds) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // save game result to backend
  async saveGameResult(currentScore, isWin = false) {
    console.log('Saving game result...', { currentScore, isWin, playerId: this.playerId })
    
    if (!isAuthenticated()) {
      console.log('Not authenticated, skipping save')
      return
    }
    
    if (!this.playerId) {
      console.log('No player ID, attempting to fetch...')
      await this.setPlayerIdFromUsername()
      
      if (!this.playerId) {
        console.error('Still no player ID after fetch, cannot save')
        return
      }
    }

    try {
      // get current player data first
      console.log('Fetching current player data...')
      const currentPlayer = await getPlayerById(this.playerId)
      console.log('Current player:', currentPlayer)
      
      const playTime = this.getPlayTime()
      const totalPlayTime = this.formatPlayTime(
        this.parsePlayTime(currentPlayer.totalPlayTime) + playTime
      )

      // prepare update data
      const updateData = {
        currentScore: currentScore,
        highestScore: Math.max(currentScore, currentPlayer.highestScore || 0),
        bestTileAchieved: Math.max(this.highestTile, currentPlayer.bestTileAchieved || 0),
        level: currentPlayer.level || 1,
        gamesPlayed: (currentPlayer.gamesPlayed || 0) + 1,
        averageScore: parseFloat((((currentPlayer.averageScore || 0) * (currentPlayer.gamesPlayed || 0) + currentScore) / ((currentPlayer.gamesPlayed || 0) + 1)).toFixed(2)),
        totalPlayTime: totalPlayTime,
        winStreak: isWin ? (currentPlayer.winStreak || 0) + 1 : 0,
        totalMoves: (currentPlayer.totalMoves || 0) + this.moveCount,
        powerUpsUsed: currentPlayer.powerUpsUsed || 0,
        favoriteItem: currentPlayer.favoriteItem || null
      }

      console.log('Updating player with data:', updateData)
      
      // update player stats in backend
      const result = await updatePlayer(this.playerId, updateData)
      
      console.log('Game stats saved successfully:', result)
      
      // stop auto-save since game ended
      this.stopAutoSave()
    } catch (error) {
      console.error('Failed to save game stats:', error)
    }
  }

  // parse playtime string (HH:MM:SS) to seconds
  parsePlayTime(timeString) {
    if (!timeString) return 0
    const parts = timeString.split(':')
    if (parts.length === 3) {
      return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2])
    }
    return 0
  }

  // setup auto-save on page unload
  setupAutoSave() {
    window.addEventListener('beforeunload', () => {
      this.saveProgressBeforeUnload()
    })
  }

  // start periodic auto-save (every 30 seconds)
  startAutoSave() {
    this.stopAutoSave() // clear any existing interval
    this.autoSaveInterval = setInterval(() => {
      this.autoSaveProgress()
    }, 30000) // 30 seconds
  }

  // stop auto-save interval
  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
      this.autoSaveInterval = null
    }
  }

  // auto-save current progress (non-blocking)
  async autoSaveProgress() {
    if (!isAuthenticated() || !this.playerId || !this.startTime) return

    // don't save if game just started (less than 10 seconds)
    const playTime = this.getPlayTime()
    if (playTime < 10) return

    try {
      const currentPlayer = await getPlayerById(this.playerId)
      const totalPlayTime = this.formatPlayTime(
        this.parsePlayTime(currentPlayer.totalPlayTime) + playTime
      )

      const updateData = {
        currentScore: currentPlayer.currentScore || 0,
        highestScore: currentPlayer.highestScore || 0,
        bestTileAchieved: Math.max(this.highestTile, currentPlayer.bestTileAchieved || 0),
        level: currentPlayer.level || 1,
        gamesPlayed: currentPlayer.gamesPlayed || 0,
        averageScore: currentPlayer.averageScore || 0,
        totalPlayTime: totalPlayTime,
        winStreak: currentPlayer.winStreak || 0,
        totalMoves: (currentPlayer.totalMoves || 0) + this.moveCount,
        powerUpsUsed: currentPlayer.powerUpsUsed || 0,
        favoriteItem: currentPlayer.favoriteItem || null
      }

      await updatePlayer(this.playerId, updateData)
      this.lastSaveTime = Date.now()
      console.log('Progress auto-saved')
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }

  // save progress synchronously on page unload
  saveProgressBeforeUnload() {
    if (!isAuthenticated() || !this.playerId || !this.startTime) return

    const playTime = this.getPlayTime()
    if (playTime < 5) return // don't save very short sessions

    // use synchronous XMLHttpRequest for beforeunload
    try {
      const token = getToken()
      if (!token) return

      const xhr = new XMLHttpRequest()
      xhr.open('GET', `${API_BASE_URL}/players/${this.playerId}`, false)
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      xhr.send()

      if (xhr.status === 200) {
        const currentPlayer = JSON.parse(xhr.responseText)
        const totalPlayTime = this.formatPlayTime(
          this.parsePlayTime(currentPlayer.totalPlayTime) + playTime
        )

        const updateData = {
          currentScore: currentPlayer.currentScore || 0,
          highestScore: currentPlayer.highestScore || 0,
          bestTileAchieved: Math.max(this.highestTile, currentPlayer.bestTileAchieved || 0),
          level: currentPlayer.level || 1,
          gamesPlayed: currentPlayer.gamesPlayed || 0,
          averageScore: currentPlayer.averageScore || 0,
          totalPlayTime: totalPlayTime,
          winStreak: currentPlayer.winStreak || 0,
          totalMoves: (currentPlayer.totalMoves || 0) + this.moveCount,
          powerUpsUsed: currentPlayer.powerUpsUsed || 0,
          favoriteItem: currentPlayer.favoriteItem || null
        }

        const updateXhr = new XMLHttpRequest()
        updateXhr.open('PUT', `${API_BASE_URL}/players/${this.playerId}`, false)
        updateXhr.setRequestHeader('Authorization', `Bearer ${token}`)
        updateXhr.setRequestHeader('Content-Type', 'application/json')
        updateXhr.send(JSON.stringify(updateData))

        console.log('Progress saved on unload')
      }
    } catch (error) {
      console.error('Failed to save on unload:', error)
    }
  }

  // get player ID from backend after login
  async setPlayerIdFromUsername() {
    const username = localStorage.getItem('bakery_username')
    if (!username) return

    try {
      // get all players and find current user
      const players = await getAllPlayers()
      const currentPlayer = players.find(p => p.username === username)
      
      if (currentPlayer) {
        this.playerId = currentPlayer.id
        setPlayerId(currentPlayer.id)
      }
    } catch (error) {
      console.error('Failed to get player ID:', error)
    }
  }
}

// initialize game stats
let gameStats = null

// initialize when auth is ready
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (isAuthenticated()) {
      gameStats = new GameStats()
    }
  }, 500)
})
