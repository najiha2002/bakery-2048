// handles login and registration UI interactions

class AuthUI {
  constructor() {
    this.authScreen = document.getElementById('authScreen')
    this.gameScreen = document.getElementById('gameScreen')
    
    // auth form elements
    this.authForm = document.getElementById('authForm')
    this.usernameInput = document.getElementById('username')
    this.emailInput = document.getElementById('email')
    this.passwordInput = document.getElementById('password')
    this.submitBtn = document.getElementById('submitBtn')
    this.toggleBtn = document.getElementById('toggleAuthMode')
    this.errorMessage = document.getElementById('errorMessage')
    this.successMessage = document.getElementById('successMessage')
    this.loadingSpinner = document.getElementById('loadingSpinner')
    
    // menu elements
    this.menuBtn = document.getElementById('menuBtn')
    this.menuDropdown = document.getElementById('menuDropdown')
    this.playerUsername = document.getElementById('playerUsername')
    this.helpBtn = document.getElementById('helpBtn')
    this.logoutBtn = document.getElementById('logoutBtn')
    
    this.isLoginMode = true
    
    this.setupEventListeners()
    this.updateFormUI() // set initial form state
    this.checkAuthStatus()
  }

  setupEventListeners() {
    // handle form submission
    this.authForm.addEventListener('submit', (e) => this.handleFormSubmit(e))
    
    // toggle between login and register
    this.toggleBtn.addEventListener('click', () => this.toggleAuthMode())
    
    // open/close menu button
    this.menuBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      this.toggleMenu()
    })
    
    // show game instructions
    this.helpBtn.addEventListener('click', () => {
      this.closeMenu()
      alert('Game Instructions:\n\n• Use arrow keys to move tiles\n• Merge same items to create new ones\n• Reach the Whole Cake to win!\n• Complete it before time runs out!')
    })
    
    // handle logout
    this.logoutBtn.addEventListener('click', () => this.handleLogout())
    
    // close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.menuDropdown.contains(e.target) && e.target !== this.menuBtn) {
        this.closeMenu()
      }
    })
  }

  toggleMenu() {
    this.menuDropdown.classList.toggle('active')
  }

  closeMenu() {
    this.menuDropdown.classList.remove('active')
  }

  // check if user is already logged in
  checkAuthStatus() {
    if (isAuthenticated()) {
      this.showGameScreen()
    } else {
      this.showAuthScreen()
    }
  }

  // show login/register screen
  showAuthScreen() {
    this.authScreen.style.display = 'block'
    this.gameScreen.style.display = 'none'
    this.clearForm()
    this.clearMessages()
  }

  // show the game screen
  showGameScreen() {
    this.authScreen.style.display = 'none'
    this.gameScreen.style.display = 'block'
    
    // display username in menu
    this.updateUsername()
    
    // start the game if not already running
    if (!window.game) {
      window.game = new Game('gameCanvas')
    }
  }

  // update the displayed username
  updateUsername() {
    const username = localStorage.getItem('bakery_username')
    if (username) {
      this.playerUsername.textContent = `Welcome, ${username}!`
    }
  }

  // switch between login and register forms
  toggleAuthMode() {
    this.isLoginMode = !this.isLoginMode
    this.updateFormUI()
    this.clearForm()
    this.clearMessages()
  }

  // update form labels and buttons based on mode
  updateFormUI() {
    const emailGroup = this.emailInput.parentElement
    
    if (this.isLoginMode) {
      // login mode - hide email field
      this.submitBtn.textContent = 'Login'
      this.toggleBtn.textContent = "Don't have an account? Register"
      emailGroup.style.display = 'none'
      this.emailInput.removeAttribute('required')
      this.authForm.querySelector('h2').textContent = 'Login'
    } else {
      // register mode - show email field
      this.submitBtn.textContent = 'Register'
      this.toggleBtn.textContent = 'Already have an account? Login'
      emailGroup.style.display = 'block'
      this.emailInput.setAttribute('required', 'required')
      this.authForm.querySelector('h2').textContent = 'Register'
    }
  }

  // handle form submission for login or register
  async handleFormSubmit(e) {
    e.preventDefault()
    
    const username = this.usernameInput.value.trim()
    const password = this.passwordInput.value.trim()
    const email = this.emailInput.value.trim()
    
    // check required fields
    if (!username || !password) {
      this.showError('Please fill in all fields')
      return
    }
    
    if (!this.isLoginMode && !email) {
      this.showError('Please fill in all fields')
      return
    }
    
    // validate email for registration
    if (!this.isLoginMode && !this.isValidEmail(email)) {
      this.showError('Please enter a valid email address')
      return
    }
    
    // check password length
    if (password.length < 8) {
      this.showError('Password must be at least 8 characters long')
      return
    }
    
    this.showLoading(true)
    this.clearMessages()
    
    try {
      let result
      if (this.isLoginMode) {
        result = await login(username, password)
        localStorage.setItem('bakery_username', result.username)
        this.showSuccess('Login successful! Redirecting...')
      } else {
        result = await register(username, email, password)
        localStorage.setItem('bakery_username', result.username)
        this.showSuccess('Account created! Redirecting...')
      }
      
      // brief delay before showing game
      setTimeout(() => {
        this.showGameScreen()
      }, 1500)
    } catch (error) {
      this.showError(error.message || 'Authentication failed')
    } finally {
      this.showLoading(false)
    }
  }

  // handle user logout
  handleLogout() {
    this.closeMenu()
    if (confirm('Are you sure you want to logout?')) {
      logout()
      localStorage.removeItem('bakery_username')
      this.showAuthScreen()
      this.showSuccess('Logged out successfully')
    }
  }

  // display error message
  showError(message) {
    this.errorMessage.textContent = message
    this.errorMessage.style.display = 'block'
    this.successMessage.style.display = 'none'
  }

  // display success message
  showSuccess(message) {
    this.successMessage.textContent = message
    this.successMessage.style.display = 'block'
    this.errorMessage.style.display = 'none'
  }

  // show or hide loading spinner
  showLoading(isLoading) {
    if (isLoading) {
      this.loadingSpinner.style.display = 'block'
      this.submitBtn.disabled = true
    } else {
      this.loadingSpinner.style.display = 'none'
      this.submitBtn.disabled = false
    }
  }

  // reset form inputs
  clearForm() {
    this.authForm.reset()
    this.usernameInput.focus()
  }

  // hide all messages
  clearMessages() {
    this.errorMessage.style.display = 'none'
    this.successMessage.style.display = 'none'
  }

  // validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

// start auth UI when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.authUI = new AuthUI()
})
