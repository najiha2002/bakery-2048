// tiles management UI for bakery 2048

class TilesUI {
  constructor() {
    this.modal = document.getElementById('tilesModal')
    this.formModal = document.getElementById('tileFormModal')
    this.manageTilesBtn = document.getElementById('manageTilesBtn')
    this.closeBtn = document.getElementById('closeTiles')
    this.closeTileFormBtn = document.getElementById('closeTileForm')
    this.addTileBtn = document.getElementById('addTileBtn')
    this.tileForm = document.getElementById('tileForm')
    this.cancelFormBtn = document.getElementById('cancelTileForm')
    
    this.loadingEl = document.getElementById('tilesLoading')
    this.contentEl = document.getElementById('tilesContent')
    this.errorEl = document.getElementById('tilesError')
    this.tilesGrid = document.getElementById('tilesGrid')
    
    this.isEditMode = false
    this.currentTileId = null
    
    this.initEventListeners()
  }
  
  initEventListeners() {
    // open tiles modal
    this.manageTilesBtn?.addEventListener('click', () => {
      this.show()
    })
    
    // close tiles modal
    this.closeBtn?.addEventListener('click', () => {
      this.hide()
    })
    
    // open add tile form
    this.addTileBtn?.addEventListener('click', () => {
      this.showTileForm()
    })
    
    // close tile form
    this.closeTileFormBtn?.addEventListener('click', () => {
      this.hideTileForm()
    })
    
    this.cancelFormBtn?.addEventListener('click', () => {
      this.hideTileForm()
    })
    
    // submit tile form
    this.tileForm?.addEventListener('submit', (e) => {
      e.preventDefault()
      this.handleFormSubmit()
    })
    
    // close on backdrop click
    this.modal?.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide()
      }
    })
    
    this.formModal?.addEventListener('click', (e) => {
      if (e.target === this.formModal) {
        this.hideTileForm()
      }
    })
    
    // close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.formModal.classList.contains('show')) {
          this.hideTileForm()
        } else if (this.modal.classList.contains('show')) {
          this.hide()
        }
      }
    })
  }
  
  show() {
    this.modal.classList.add('show')
    this.loadTiles()
    this.checkAdminAccess()
  }

  hide() {
    this.modal.classList.remove('show')
  }

  // check if user is admin and disable buttons accordingly
  checkAdminAccess() {
    const isPlayerOnly = !isAdmin()
    
    // disable add tile button for players
    if (this.addTileBtn) {
      this.addTileBtn.disabled = isPlayerOnly
      this.addTileBtn.style.opacity = isPlayerOnly ? '0.5' : '1'
      this.addTileBtn.style.cursor = isPlayerOnly ? 'not-allowed' : 'pointer'
      this.addTileBtn.title = isPlayerOnly ? 'Only Admins can add tiles' : ''
    }
  }
  
  showTileForm(tile = null) {
    this.isEditMode = !!tile
    this.currentTileId = tile?.id || null
    
    const titleEl = document.getElementById('tileFormTitle')
    titleEl.textContent = this.isEditMode ? 'Edit Tile' : 'Add New Tile'
    
    if (tile) {
      console.log('Editing tile:', tile) // debug log
      document.getElementById('tileId').value = tile.id
      document.getElementById('tileValue').value = tile.value || tile.tileValue || ''
      document.getElementById('tileName').value = tile.itemName || tile.name || tile.label || ''
      document.getElementById('tileEmoji').value = tile.icon || tile.emoji || ''
      document.getElementById('tileColor').value = tile.color || tile.backgroundColor || '#fcefe6'
      document.getElementById('tileDescription').value = tile.description || ''
    } else {
      this.tileForm.reset()
      document.getElementById('tileColor').value = '#fcefe6'
    }
    
    this.formModal.classList.add('show')
  }
  
  hideTileForm() {
    this.formModal.classList.remove('show')
    this.tileForm.reset()
    this.isEditMode = false
    this.currentTileId = null
  }
  
  async loadTiles() {
    this.loadingEl.style.display = 'block'
    this.contentEl.style.display = 'none'
    this.errorEl.style.display = 'none'
    
    try {
      const tiles = await window.tilesLoader.getAllTiles()
      
      if (!tiles || tiles.length === 0) {
        this.showError('No tiles found. Create your first tile!')
        return
      }
      
      // sort by value
      const sortedTiles = tiles.sort((a, b) => {
        const valA = a.value || a.tileValue || 0
        const valB = b.value || b.tileValue || 0
        return valA - valB
      })
      
      this.renderTiles(sortedTiles)
      
    } catch (error) {
      console.error('Failed to load tiles:', error)
      this.showError('Failed to load tiles. Please try again.')
    }
  }
  
  renderTiles(tiles) {
    this.tilesGrid.innerHTML = ''
    
    const isPlayerOnly = !isAdmin()
    
    tiles.forEach(tile => {
      const tileValue = tile.value || tile.tileValue
      const tileName = tile.itemName || tile.name || tile.label || `Tile ${tileValue}`
      const tileEmoji = tile.icon || tile.emoji || '❓'
      const tileColor = tile.color || tile.backgroundColor || '#fcefe6'
      const tileDesc = tile.description || ''
      
      const card = document.createElement('div')
      card.className = 'tile-card'
      card.style.backgroundColor = tileColor
      
      // if player only, disable edit/delete buttons
      const editDeleteHtml = isPlayerOnly 
        ? `
          <button class="tile-action-btn tile-edit-btn" disabled style="opacity: 0.5; cursor: not-allowed;" title="Only Admins can edit">Edit</button>
          <button class="tile-action-btn tile-delete-btn" disabled style="opacity: 0.5; cursor: not-allowed;" title="Only Admins can delete">Delete</button>
        `
        : `
          <button class="tile-action-btn tile-edit-btn" data-id="${tile.id}">Edit</button>
          <button class="tile-action-btn tile-delete-btn" data-id="${tile.id}">Delete</button>
        `
      
      card.innerHTML = `
        <div class="tile-card-header">
          <span class="tile-emoji">${tileEmoji}</span>
          <span class="tile-value">${tileValue}</span>
        </div>
        <div class="tile-card-body">
          <div class="tile-name">${this.escapeHtml(tileName)}</div>
          ${tileDesc ? `<div class="tile-description">${this.escapeHtml(tileDesc)}</div>` : ''}
        </div>
        <div class="tile-card-footer">
          ${editDeleteHtml}
        </div>
      `
      
      // only add listeners if admin
      if (!isPlayerOnly) {
        // edit button
        const editBtn = card.querySelector('.tile-edit-btn')
        editBtn.addEventListener('click', () => {
          this.showTileForm(tile)
        })
        
        // delete button
        const deleteBtn = card.querySelector('.tile-delete-btn')
        deleteBtn.addEventListener('click', () => {
          this.handleDelete(tile)
        })
      }
      
      this.tilesGrid.appendChild(card)
    })
    
    this.loadingEl.style.display = 'none'
    this.contentEl.style.display = 'block'
    
    // show admin-only message for players (only once)
    if (isPlayerOnly) {
      // check if message already exists
      const existingMessage = this.contentEl.querySelector('.admin-only-message')
      if (!existingMessage) {
        const message = document.createElement('div')
        message.className = 'admin-only-message'
        message.style.marginTop = '20px'
        message.style.padding = '15px'
        message.style.backgroundColor = '#fff3cd'
        message.style.borderRadius = '6px'
        message.style.textAlign = 'center'
        message.style.color = '#856404'
        message.textContent = '⛔ Only Admins can edit or delete tiles'
        this.contentEl.appendChild(message)
      }
    }
  }
  
  async handleFormSubmit() {
    const tileData = {
      tileValue: parseInt(document.getElementById('tileValue').value),
      itemName: document.getElementById('tileName').value,
      icon: document.getElementById('tileEmoji').value,
      color: document.getElementById('tileColor').value,
      description: document.getElementById('tileDescription').value
    }
    
    try {
      if (this.isEditMode && this.currentTileId) {
        await window.tilesLoader.updateTile(this.currentTileId, tileData)
        alert('Tile updated successfully!')
      } else {
        await window.tilesLoader.createTile(tileData)
        alert('Tile created successfully!')
      }
      
      this.hideTileForm()
      this.loadTiles()
      
    } catch (error) {
      console.error('Failed to save tile:', error)
      
      // Extract error message from API response
      let errorMessage = 'Failed to save tile.'
      
      if (error.data && error.data.errors) {
        // Handle validation errors from API
        const errors = error.data.errors
        const errorMessages = Object.values(errors).flat()
        errorMessage = errorMessages.join('\n')
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert(errorMessage)
    }
  }
  
  async handleDelete(tile) {
    const tileName = tile.itemName || tile.name || tile.label || 'this tile'
    const confirmed = confirm(`Are you sure you want to delete "${tileName}"?`)
    
    if (!confirmed) return
    
    try {
      await window.tilesLoader.deleteTile(tile.id)
      alert('Tile deleted successfully!')
      this.loadTiles()
      
    } catch (error) {
      console.error('Failed to delete tile:', error)
      alert('Failed to delete tile. Please try again.')
    }
  }
  
  showError(message) {
    this.loadingEl.style.display = 'none'
    this.contentEl.style.display = 'none'
    this.errorEl.style.display = 'block'
    this.errorEl.textContent = message
  }
  
  escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}

// initialize tiles UI when dom is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.tilesUI = new TilesUI()
  })
} else {
  window.tilesUI = new TilesUI()
}
