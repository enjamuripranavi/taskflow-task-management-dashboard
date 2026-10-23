# TaskFlow — Modern Task Management Dashboard

TaskFlow is a clean, focused task management web application built with **React**, **JavaScript**, **CSS**, and **Vite**. Designed as a practical productivity dashboard, TaskFlow avoids distracting clutter and AI-generated novelty styling in favor of clear typography, natural spacing, predictable interactions, and reliable data persistence.

---

## 📸 Screenshots

| Desktop Dashboard | Task Creation & Edit Modal |
| :---: | :---: |
| ![Desktop Dashboard](./screenshots/desktop-dashboard.png) | ![Task Modal](./screenshots/task-modal.png) |

| Search & Filter State | Responsive Mobile View |
| :---: | :---: |
| ![Search Filter](./screenshots/search-filter.png) | ![Mobile View](./screenshots/mobile-view.png) |

---

## ✨ Features

- **Full Task Lifecycle (CRUD)**:
  - **Create**: Add new tasks with title, priority (`Low`, `Medium`, `High`), and initial status (`Pending`, `In Progress`, `Completed`).
  - **Edit**: Modify task titles and priorities in place without creating duplicates.
  - **Delete**: Safe task deletion protected by a confirmation dialog with warning context.
  - **Quick Inline Status Update**: Change task status immediately from the list row dropdown without entering edit mode.
- **Dynamic Metrics Summary**:
  - Live summary cards calculating **Total**, **Pending**, **In Progress**, and **Completed** counts.
  - Interactive cards that double as quick filter selectors.
- **Sidebar Navigation**:
  - Filter by status with real-time count badges beside each category.
  - Smooth collapsible mobile drawer navigation with backdrop support.
- **Instant Sorting**:
  - Sort dropdown with 6 options: **Newest first**, **Oldest first**, **Priority: High to Low**, **Priority: Low to High**, **Title: A to Z**, and **Title: Z to A**.
  - Operates immutably on a shallow copy of the filtered task collection without mutating original data.
- **Customizable Color Themes**:
  - **Theme A (Lavender and White)** active by default: `#7866B1` primary accent, `#EDE8FA` soft lavender surface, `#F8F7FC` background.
  - **Theme B (Navy and Light Blue)** documented and ready to toggle via CSS variables in `src/styles/index.css`.
- **Real-Time Search & Empty States**:
  - Instant title search combined with the currently selected status filter.
  - Contextual empty states for no tasks, no search matches, and empty filter categories with 1-click reset buttons.
- **Local Persistence**:
  - All tasks are saved automatically to browser `localStorage` and restored on page refresh.
  - Seeded with 4 realistic starter tasks if no existing storage data is found.
- **Responsive & Accessible Design**:
  - Fluid layout optimized across Desktop (1280px+), Tablet (768px - 1024px), and Mobile (<768px).
  - Clear input focus states (`:focus-visible`), form validation with error messages, keyboard navigation (Escape to dismiss modals, Enter to submit), and proper ARIA attributes.

---

## 🛠️ Tech Stack & Architecture

- **React 18** (`useState`, `useEffect`, `useMemo`, `useRef`)
- **Vite 6** (Fast ESM development server and production bundler)
- **CSS3** (Custom design system with CSS custom properties/variables, responsive Flexbox and Grid)
- **Browser localStorage API** (Safe JSON storage with error handling)
- **Zero Heavy UI Libraries** (Handcrafted accessible SVG icons and clean CSS components for optimal performance)

### Project Structure

```text
taskflow/
├── public/                 # Static assets
├── screenshots/            # Verified preview screenshots
│   ├── desktop-dashboard.png
│   ├── task-modal.png
│   ├── search-filter.png
│   └── mobile-view.png
├── src/
│   ├── components/
│   │   ├── ConfirmModal.jsx    # Deletion confirmation modal
│   │   ├── Header.jsx          # Top app bar with branding, title & Add Task
│   │   ├── Icons.jsx           # Crisp handcrafted SVG icon components
│   │   ├── Sidebar.jsx         # Status filter menu with task counters
│   │   ├── SummaryCards.jsx    # 4 interactive count overview cards
│   │   ├── TaskFormModal.jsx   # Create & Edit task dialog with validation
│   │   ├── TaskItem.jsx        # Individual task item with inline status selector
│   │   └── TaskList.jsx        # Search controls, filter pills & empty states
│   ├── data/
│   │   └── initialTasks.js     # Seed tasks for initial demo experience
│   ├── styles/
│   │   ├── App.css             # Main shell layout and shared buttons
│   │   ├── Components.css      # Component-level styling and responsive media queries
│   │   └── index.css           # CSS variables, typography and base resets
│   ├── App.jsx                 # Central application state and logic
│   └── main.jsx                # React root mount point
├── .gitignore              # Ignored files (node_modules, dist, etc.)
├── index.html              # HTML entry point with Inter font
├── package.json            # Scripts and project dependencies
├── verify-taskflow.mjs     # Automated headless browser verification suite
└── vite.config.js          # Vite configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)

### Installation & Setup

1. **Clone or navigate into the project directory**:
   ```bash
   cd taskflow
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Open [http://localhost:5173](http://localhost:5173) in your web browser.

---

## 🧪 Available Scripts

- `npm run dev`: Starts the local Vite development server with Hot Module Replacement (HMR).
- `npm run build`: Compiles production-ready minified HTML, CSS, and JS into the `dist/` folder.
- `npm run preview`: Locally previews the production build on [http://localhost:4173](http://localhost:4173).
- `npm test`: Runs the automated headless browser test suite verifying all 10 core features and capturing screenshots.

---

## 💡 Key React Concepts Used

- **`useState`**: Used for stateful variables such as the task collection, active filters, search query, and modal open/close visibility.
- **`useEffect`**: Synchronizes tasks to `localStorage` whenever the task list updates, and manages keyboard event listeners (`Escape` to close modals).
- **`useMemo`**: Derives calculated statistics (Total, Pending, In Progress, Completed counts) and filters the active task list efficiently without redundant re-renders.
- **Immutable State Updates**: All array operations use non-mutating functional updates (e.g., `prev.map(...)` for edits, `prev.filter(...)` for deletion, and `[newTask, ...prev]` for additions).
- **Controlled Components**: Form inputs in `TaskFormModal` and the search bar are controlled by React state, enabling real-time validation and clean submission handling.
- **Component Separation**: Logical separation of Header, Sidebar, SummaryCards, TaskList, TaskItem, and Modals keeps code readable, maintainable, and easy to explain.
