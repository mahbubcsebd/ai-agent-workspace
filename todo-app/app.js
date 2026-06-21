// App State Management
let todos = [];

// DOM Elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoCategory = document.getElementById('todo-category');
const todoList = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');
const filterBtns = document.querySelectorAll('.filter-btn');
const themeToggleBtn = document.getElementById('theme-toggle');

// Stats Elements
const completionPercentage = document.getElementById('completion-percentage');
const progressBar = document.getElementById('progress-bar');
const activeCount = document.getElementById('active-count');
const completedCount = document.getElementById('completed-count');

// Initialize App
function init() {
  loadTheme();
  loadTodos();
  setupEventListeners();
  render();
}

// Load Theme from LocalStorage
function loadTheme() {
  const currentTheme = localStorage.getItem('aura_theme') || 'dark';
  if (currentTheme === 'light') {
    document.body.setAttribute('data-theme', 'light');
    themeToggleBtn.textContent = '☀️';
  } else {
    document.body.removeAttribute('data-theme');
    themeToggleBtn.textContent = '🌙';
  }
}

// Toggle Theme
function toggleTheme() {
  const isLight = document.body.getAttribute('data-theme') === 'light';
  if (isLight) {
    document.body.removeAttribute('data-theme');
    themeToggleBtn.textContent = '🌙';
    localStorage.setItem('aura_theme', 'dark');
  } else {
    document.body.setAttribute('data-theme', 'light');
    themeToggleBtn.textContent = '☀️';
    localStorage.setItem('aura_theme', 'light');
  }
}

// Load Todos from LocalStorage
function loadTodos() {
  const stored = localStorage.getItem('aura_todos');
  if (stored) {
    todos = JSON.parse(stored);
  } else {
    // Demo items for first load
    todos = [
      { id: 1, text: 'Design the new dashboard header', category: 'Work', completed: false },
      { id: 2, text: 'Refactor theme colors with HSL variables', category: 'Coding', completed: true },
      { id: 3, text: 'Buy items for workspace setup', category: 'Shopping', completed: false }
    ];
    saveTodos();
  }
}

// Save Todos to LocalStorage
function saveTodos() {
  localStorage.setItem('aura_todos', JSON.stringify(todos));
}

// Event Listeners Configuration
function setupEventListeners() {
  // Theme Toggle Button Click
  themeToggleBtn.addEventListener('click', toggleTheme);

  // Add Todo Form Submit
  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addTodo(todoInput.value.trim(), todoCategory.value);
    todoInput.value = '';
    todoInput.focus();
  });

  // Real-time Search Input
  searchInput.addEventListener('input', () => {
    render();
  });

  // Filter Buttons Click
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      render();
    });
  });
}

// Add New Todo
function addTodo(text, category) {
  if (!text) return;
  const newTodo = {
    id: Date.now(),
    text: text,
    category: category,
    completed: false
  };
  todos.unshift(newTodo);
  saveTodos();
  render();
}

// Delete Todo
function deleteTodo(id) {
  const todoElement = document.querySelector(`[data-id="${id}"]`);
  if (todoElement) {
    todoElement.style.opacity = '0';
    todoElement.style.transform = 'translateY(12px)';
    setTimeout(() => {
      todos = todos.filter(t => t.id !== id);
      saveTodos();
      render();
    }, 250); // Match transition speed
  }
}

// Toggle Todo Completed Status
function toggleCompleted(id) {
  todos = todos.map(t => {
    if (t.id === id) {
      return { ...t, completed: !t.completed };
    }
    return t;
  });
  saveTodos();
  
  // Minor delay to let checkmark animation show before re-rendering
  setTimeout(() => {
    render();
  }, 150);
}

// Get Active Filter
function getActiveFilter() {
  const activeBtn = document.querySelector('.filter-btn.active');
  return activeBtn ? activeBtn.dataset.filter : 'all';
}

// Calculate Stats and Update UI
function updateStats() {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const active = total - completed;
  
  activeCount.textContent = active;
  completedCount.textContent = completed;

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  completionPercentage.textContent = `${percentage}%`;
  progressBar.style.width = `${percentage}%`;
}

// Render Todos list based on filters and search
function render() {
  const filter = getActiveFilter();
  const searchQuery = searchInput.value.toLowerCase().trim();

  // Filter & Search Logic
  const filtered = todos.filter(todo => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'completed' && todo.completed) || 
      (filter === 'pending' && !todo.completed);
    
    const matchesSearch = todo.text.toLowerCase().includes(searchQuery);

    return matchesFilter && matchesSearch;
  });

  // Render Items
  todoList.innerHTML = '';
  
  if (filtered.length === 0) {
    emptyState.classList.add('show');
  } else {
    emptyState.classList.remove('show');
    
    filtered.forEach(todo => {
      const li = document.createElement('li');
      li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
      li.setAttribute('data-id', todo.id);

      li.innerHTML = `
        <div class="item-left">
          <label class="checkbox-container">
            <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleCompleted(${todo.id})">
            <span class="checkmark"></span>
          </label>
          <div class="task-content">
            <span class="task-text">${escapeHTML(todo.text)}</span>
            <span class="category-badge">${todo.category}</span>
          </div>
        </div>
        <button class="delete-btn" onclick="deleteTodo(${todo.id})" title="Delete Task">🗑️</button>
      `;
      todoList.appendChild(li);
    });
  }

  updateStats();
}

// Helper to escape HTML and prevent XSS
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Launch the Application
document.addEventListener('DOMContentLoaded', init);
