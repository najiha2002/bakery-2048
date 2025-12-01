// leaderboard manager for bakery 2048
class LeaderboardUI {
  constructor() {
    this.modal = document.getElementById('leaderboardModal')
    this.leaderboardBtn = document.getElementById('leaderboardBtn')
    this.closeBtn = document.getElementById('closeLeaderboard')
    this.loadingEl = document.getElementById('leaderboardLoading')
    this.contentEl = document.getElementById('leaderboardContent')
    this.errorEl = document.getElementById('leaderboardError')
    this.bodyEl = document.getElementById('leaderboardBody')
    
    this.initEventListeners()
  }
  
  initEventListeners() {
    // open leaderboard
    this.leaderboardBtn?.addEventListener('click', () => {
      this.show()
    })
    
    // close leaderboard
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
    this.loadLeaderboard()
  }
  
  hide() {
    this.modal.classList.remove('show')
  }
  
  async loadLeaderboard() {
    // show loading state
    this.loadingEl.style.display = 'block'
    this.contentEl.style.display = 'none'
    this.errorEl.style.display = 'none'
    
    try {
      // fetch top players from api
      const players = await getAllPlayers(20)
      
      if (!players || players.length === 0) {
        this.showError('No players found')
        return
      }
      
      // sort by highest score
      const sortedPlayers = players
        .filter(p => p.highestScore > 0) // only show players with scores
        .sort((a, b) => b.highestScore - a.highestScore)
        .slice(0, 10) // top 10
      
      this.renderLeaderboard(sortedPlayers)
      
    } catch (error) {
      console.error('Failed to load leaderboard:', error)
      this.showError('Failed to load leaderboard. Please try again.')
    }
  }
  
  renderLeaderboard(players) {
    // clear existing rows
    this.bodyEl.innerHTML = ''
    
    // get current player id from localStorage (updated on each render)
    const currentPlayerId = localStorage.getItem('bakery_player_id')
    
    players.forEach((player, index) => {
      const rank = index + 1
      const isCurrentPlayer = player.id === currentPlayerId
      
      const row = document.createElement('tr')
      if (isCurrentPlayer) {
        row.style.backgroundColor = '#fff9e6'
      }
      
      row.innerHTML = `
        <td class="rank-cell">
          ${this.getRankDisplay(rank)}
        </td>
        <td class="player-cell ${isCurrentPlayer ? 'current-player' : ''}">
          ${this.escapeHtml(player.username)}${isCurrentPlayer ? ' (You)' : ''}
        </td>
        <td class="score-cell">${this.formatNumber(player.highestScore)}</td>
        <td>${player.gamesPlayed || 0}</td>
        <td>${player.winStreak || 0}</td>
      `
      
      this.bodyEl.appendChild(row)
    })
    
    // show content
    this.loadingEl.style.display = 'none'
    this.contentEl.style.display = 'block'
  }
  
  getRankDisplay(rank) {
    const medals = {
      1: '🥇',
      2: '🥈',
      3: '🥉'
    }
    
    return medals[rank] 
      ? `<span class="rank-medal">${medals[rank]}</span>`
      : rank
  }
  
  formatNumber(num) {
    return num.toLocaleString()
  }
  
  escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
  
  showError(message) {
    this.loadingEl.style.display = 'none'
    this.contentEl.style.display = 'none'
    this.errorEl.style.display = 'block'
    this.errorEl.textContent = message
  }
}

// initialize leaderboard when dom is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.leaderboardUI = new LeaderboardUI()
  })
} else {
  window.leaderboardUI = new LeaderboardUI()
}
