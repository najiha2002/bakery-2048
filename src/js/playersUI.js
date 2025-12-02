// players management UI for bakery 2048 - admin only

class PlayersUI {
  constructor() {
    this.modal = document.getElementById('playersModal')
    this.managePlayersBtn = document.getElementById('managePlayersBtn')
    this.closeBtn = document.getElementById('closePlayers')
    
    this.loadingEl = document.getElementById('playersLoading')
    this.contentEl = document.getElementById('playersContent')
    this.errorEl = document.getElementById('playersError')
    this.playersGrid = document.getElementById('playersGrid')
    
    this.initEventListeners()
    this.checkAdminAccess()
  }
  
  // check if user is admin and show/hide button accordingly
  checkAdminAccess() {
    if (!this.managePlayersBtn) return
    
    if (isAdmin()) {
      this.managePlayersBtn.style.display = 'flex'
    } else {
      this.managePlayersBtn.style.display = 'none'
    }
  }
  
  initEventListeners() {
    // open players modal
    this.managePlayersBtn?.addEventListener('click', () => {
      this.show()
    })
    
    // close players modal
    this.closeBtn?.addEventListener('click', () => {
      this.hide()
    })
    
    // close on backdrop click
    this.modal?.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide()
      }
    })
    
    // close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('show')) {
        this.hide()
      }
    })
  }
  
  show() {
    this.modal.classList.add('show')
    this.loadPlayers()
  }
  
  hide() {
    this.modal.classList.remove('show')
  }
  
  async loadPlayers() {
    this.loadingEl.style.display = 'block'
    this.contentEl.style.display = 'none'
    this.errorEl.style.display = 'none'
    
    try {
      const players = await getAllPlayers(100)
      
      if (!players || players.length === 0) {
        this.showError('No players found.')
        return
      }
      
      // sort by highest score
      const sortedPlayers = players.sort((a, b) => {
        return (b.highestScore || 0) - (a.highestScore || 0)
      })
      
      this.renderPlayers(sortedPlayers)
      
    } catch (error) {
      console.error('Failed to load players:', error)
      this.showError('Failed to load players. Please try again.')
    }
  }
  
  renderPlayers(players) {
    this.playersGrid.innerHTML = ''
    
    players.forEach((player, index) => {
      const card = document.createElement('div')
      card.className = 'player-card'
      
      card.innerHTML = `
        <div class="player-card-header">
          <div class="player-rank">#${index + 1}</div>
          <div class="player-username">${this.escapeHtml(player.username)}</div>
        </div>
        <div class="player-card-body">
          <div class="player-stat">
            <span class="stat-label">High Score</span>
            <span class="stat-value">${this.formatNumber(player.highestScore || 0)}</span>
          </div>
          <div class="player-stat">
            <span class="stat-label">Games</span>
            <span class="stat-value">${player.gamesPlayed || 0}</span>
          </div>
          <div class="player-stat">
            <span class="stat-label">Win Streak</span>
            <span class="stat-value">${player.winStreak || 0}</span>
          </div>
          <div class="player-stat">
            <span class="stat-label">Total Moves</span>
            <span class="stat-value">${this.formatNumber(player.totalMoves || 0)}</span>
          </div>
          <div class="player-stat">
            <span class="stat-label">Best Tile</span>
            <span class="stat-value">${this.formatNumber(player.bestTileAchieved || 0)}</span>
          </div>
          <div class="player-stat">
            <span class="stat-label">Avg Score</span>
            <span class="stat-value">${this.formatNumber(Math.round(player.averageScore || 0))}</span>
          </div>
        </div>
        <div class="player-card-footer">
          <button class="player-action-btn player-view-btn" data-id="${player.id}">View</button>
          <button class="player-action-btn player-delete-btn" data-id="${player.id}">Delete</button>
        </div>
      `
      
      // view button
      const viewBtn = card.querySelector('.player-view-btn')
      viewBtn.addEventListener('click', () => {
        this.handleView(player)
      })
      
      // delete button
      const deleteBtn = card.querySelector('.player-delete-btn')
      deleteBtn.addEventListener('click', () => {
        this.handleDelete(player)
      })
      
      this.playersGrid.appendChild(card)
    })
    
    this.loadingEl.style.display = 'none'
    this.contentEl.style.display = 'block'
  }
  
  handleView(player) {
    const stats = `
Player: ${player.username}
Email: ${player.email}

Statistics:
- Highest Score: ${this.formatNumber(player.highestScore || 0)}
- Current Score: ${this.formatNumber(player.currentScore || 0)}
- Games Played: ${player.gamesPlayed || 0}
- Average Score: ${Math.round(player.averageScore || 0)}
- Win Streak: ${player.winStreak || 0}
- Total Moves: ${this.formatNumber(player.totalMoves || 0)}
- Best Tile: ${this.formatNumber(player.bestTileAchieved || 0)}
- Total Play Time: ${player.totalPlayTime || '0:00:00'}
- Power-Ups Used: ${player.powerUpsUsed || 0}
- Joined: ${new Date(player.dateCreated).toLocaleDateString()}
    `
    alert(stats)
  }
  
  async handleDelete(player) {
    const confirmed = confirm(`Are you sure you want to delete player "${player.username}"? This action cannot be undone.`)
    
    if (!confirmed) return
    
    try {
      await deletePlayer(player.id)
      alert('Player deleted successfully!')
      this.loadPlayers()
      
    } catch (error) {
      console.error('Failed to delete player:', error)
      alert('Failed to delete player. Please try again.')
    }
  }
  
  showError(message) {
    this.loadingEl.style.display = 'none'
    this.contentEl.style.display = 'none'
    this.errorEl.style.display = 'block'
    this.errorEl.textContent = message
  }
  
  formatNumber(num) {
    return num.toLocaleString()
  }
  
  escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}

// initialize players UI when dom is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.playersUI = new PlayersUI()
  })
} else {
  window.playersUI = new PlayersUI()
}
