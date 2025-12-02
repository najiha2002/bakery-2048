// tiles loader - loads tile configurations from backend API

class TilesLoader {
  constructor() {
    this.tiles = null
    this.isLoaded = false
  }

  // load tiles from backend API
  async loadTiles() {
    if (!isAuthenticated()) {
      console.log('Not authenticated, using default tiles')
      return false
    }

    try {
      console.log('Loading tiles from backend...')
      const tiles = await getAllTiles()
      
      if (!tiles || tiles.length === 0) {
        console.warn('No tiles returned from API, using defaults')
        return false
      }

      this.tiles = tiles
      this.applyTilesToGame()
      this.isLoaded = true
      console.log('Tiles loaded successfully:', tiles.length, 'tiles')
      return true
      
    } catch (error) {
      console.error('Failed to load tiles from API:', error)
      return false
    }
  }

  // apply loaded tiles to game constants
  applyTilesToGame() {
    if (!this.tiles) return

    // create mapping from tile values to API tiles
    const tileMap = {}
    
    this.tiles.forEach(tile => {
      // map tile value (2, 4, 8, etc.) to API tile data
      const value = tile.tileValue || tile.value
      if (value) {
        tileMap[value] = {
          emoji: tile.icon || tile.emoji || '',
          name: tile.itemName || tile.name || tile.label || `Tile ${value}`,
          color: tile.color || tile.backgroundColor || this.getDefaultColor(value)
        }
      }
    })

    // update TILE_LABELS constant
    Object.keys(tileMap).forEach(value => {
      TILE_LABELS[value] = {
        emoji: tileMap[value].emoji,
        name: tileMap[value].name
      }
    })

    // update COLORS constant for tile colors
    Object.keys(tileMap).forEach(value => {
      COLORS[value] = tileMap[value].color
    })

    console.log('Tiles applied to game:', Object.keys(tileMap).length, 'tiles updated')
  }

  // fallback colors if API doesn't provide them
  getDefaultColor(value) {
    const defaultColors = {
      2: '#fcefe6',
      4: '#f2e8cb',
      8: '#f5b682',
      16: '#f29446',
      32: '#f88973ff',
      64: '#ed7056ff',
      128: '#ede291',
      256: '#fce130',
      512: '#ffdb4a',
      1024: '#f0b922',
      2048: '#fad74d'
    }
    return defaultColors[value] || '#3c3a32'
  }

  // get tile info for display
  getTileInfo(value) {
    if (this.tiles) {
      const tile = this.tiles.find(t => (t.tileValue || t.value) === value)
      if (tile) {
        return {
          emoji: tile.icon || tile.emoji || '',
          name: tile.itemName || tile.name || tile.label || `Tile ${value}`
        }
      }
    }
    
    // fallback to constants
    return TILE_LABELS[value] || { emoji: '', name: `${value}` }
  }

  // ========================================
  // Tile CRUD Operations
  // ========================================

  // create a new tile
  async createTile(tileData) {
    try {
      const newTile = await createTile(tileData)
      console.log('Tile created:', newTile)
      await this.loadTiles() // reload tiles
      return newTile
    } catch (error) {
      console.error('Failed to create tile:', error)
      throw error
    }
  }

  // update an existing tile
  async updateTile(id, tileData) {
    try {
      const updatedTile = await updateTile(id, tileData)
      console.log('Tile updated:', updatedTile)
      await this.loadTiles() // reload tiles
      return updatedTile
    } catch (error) {
      console.error('Failed to update tile:', error)
      throw error
    }
  }

  // delete a tile
  async deleteTile(id) {
    try {
      await deleteTile(id)
      console.log('Tile deleted:', id)
      await this.loadTiles() // reload tiles
      return true
    } catch (error) {
      console.error('Failed to delete tile:', error)
      throw error
    }
  }

  // get tile by ID
  async getTileById(id) {
    try {
      return await getTileById(id)
    } catch (error) {
      console.error('Failed to get tile:', error)
      throw error
    }
  }

  // get all tiles from API
  async getAllTiles() {
    try {
      return await getAllTiles()
    } catch (error) {
      console.error('Failed to get all tiles:', error)
      throw error
    }
  }
}

// initialize tiles loader
window.tilesLoader = new TilesLoader()

// load tiles when authenticated
document.addEventListener('DOMContentLoaded', () => {
  // wait for auth to complete
  setTimeout(async () => {
    if (isAuthenticated()) {
      await window.tilesLoader.loadTiles()
    }
  }, 1000)
})
