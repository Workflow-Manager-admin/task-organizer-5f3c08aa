import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// PUBLIC_INTERFACE
/**
 * Main App component for the To-Do list application.
 * Implements modern, minimalistic UI with task CRUD, status filtering, responsive design.
 * API connectivity placeholders use REACT_APP_APP_SUPABASE_URL/KEY via env.
 */
function App() {
  // Color palette - used for inline style overrides
  const COLOR = {
    accent: '#e94e77',     // pink-accent
    primary: '#4a90e2',    // blue-main
    secondary: '#50e3c2',  // teal-support
  };

  // --- Task structure: {id, title, completed, createdAt}
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [editTaskId, setEditTaskId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, completed
  const inputRef = useRef(null);

  // PUBLIC_INTERFACE
  // Simulate initial data load (replace with backend call in production)
  useEffect(() => {
    // Minimal example data
    setTasks([
      { id: 1, title: 'Read React docs', completed: false, createdAt: Date.now() - 500000 },
      { id: 2, title: 'Write To-Do app', completed: true, createdAt: Date.now() - 300000 },
      { id: 3, title: 'Refactor CSS', completed: false, createdAt: Date.now() - 100000 }
    ]);
  }, []);

  // PUBLIC_INTERFACE
  /**
   * Add a new task. Integrate Supabase API here for persistent storage.
   */
  const handleAddTask = (e) => {
    e.preventDefault();
    const value = input.trim();
    if (!value) return;
    // Placeholder: integrate with Supabase REST call here
    setTasks(prev => [
      ...prev,
      {
        id: Date.now(),
        title: value,
        completed: false,
        createdAt: Date.now()
      }
    ]);
    setInput('');
    if (inputRef.current) inputRef.current.focus();
  };

  // PUBLIC_INTERFACE
  /**
   * Begin editing a task by setting edit mode.
   */
  const beginEditTask = (taskId, currentTitle) => {
    setEditTaskId(taskId);
    setEditValue(currentTitle);
  };

  // PUBLIC_INTERFACE
  /**
   * Save edits to an existing task.
   */
  const handleSaveEdit = (taskId) => {
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, title: editValue.trim() || t.title } : t
    ));
    setEditTaskId(null);
    setEditValue('');
  };

  // PUBLIC_INTERFACE
  /**
   * Delete a task. Place API call here for persistent deletion.
   */
  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    // Placeholder: Supabase delete here
  };

  // PUBLIC_INTERFACE
  /**
   * Toggle the completed status of a task.
   */
  const handleToggleComplete = (taskId) => {
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
    // Placeholder: Supabase update here
  };

  // PUBLIC_INTERFACE
  /**
   * Filter tasks by status: all/active/completed.
   */
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  // PUBLIC_INTERFACE
  /**
   * Utility to get environment variables (REACT_APP_APP_SUPABASE_URL/KEY).
   * Replace with real API usage for backend integration.
   */
  const getSupabaseEnv = () => {
    return {
      url: process.env.REACT_APP_APP_SUPABASE_URL,
      key: process.env.REACT_APP_APP_SUPABASE_KEY,
    };
  };

  // PUBLIC_INTERFACE
  /**
   * Handle Enter/Escape for editing
   */
  const handleEditKeyDown = (e, taskId) => {
    if (e.key === 'Enter') {
      handleSaveEdit(taskId);
    } else if (e.key === 'Escape') {
      setEditTaskId(null);
      setEditValue('');
    }
  };

  // Minimalistic header
  function Header() {
    return (
      <header
        style={{
          background: COLOR.primary,
          color: '#fff',
          padding: '2rem 0 1rem 0',
          borderBottom: `4px solid ${COLOR.accent}`,
        }}
        className="todo-header"
      >
        <h1 style={{
          letterSpacing: '0.02em',
          fontWeight: 800,
          margin: 0,
          fontSize: 'clamp(2rem, 5vw, 2.7rem)',
        }}>
          <span style={{ color: COLOR.accent }}>kavia</span>
          <span style={{ color: COLOR.secondary }}>.</span>
          To-Do
        </h1>
        <p style={{ margin: '.4rem 0 0', fontWeight: 400, color: COLOR.secondary }}>
          A minimal task organizer.
        </p>
      </header>
    );
  }

  // Input task form
  function TaskInput() {
    return (
      <form
        onSubmit={handleAddTask}
        style={{
          display: 'flex', gap: '0.8rem', marginTop: '2rem', width: '100%',
          maxWidth: 456, marginLeft: 'auto', marginRight: 'auto',
        }}
        data-testid="task-input-form"
      >
        <input
          className="task-input"
          ref={inputRef}
          type="text"
          placeholder="Add new task..."
          value={input}
          onChange={e => setInput(e.target.value)}
          aria-label="Add new task"
          style={{
            flex: 1, padding: '1rem', fontSize: '1rem',
            outline: 'none',
            border: `1.5px solid ${COLOR.primary}`,
            borderRadius: '10px',
            fontWeight: 400,
            background: '#fff',
            color: COLOR.primary
          }}
          maxLength={120}
        />
        <button
          type="submit"
          className="btn-primary"
          aria-label="Add task"
          style={{
            background: COLOR.accent, color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '0 1.3rem',
            fontWeight: 700,
            fontSize: '1rem',
            minHeight: '100%',
            transition: 'background 0.2s'
          }}
        >
          Add
        </button>
      </form>
    );
  }

  // PUBLIC_INTERFACE
  /**
   * Filter controls: All / Active / Completed
   */
  function FilterControls() {
    return (
      <div className="filter-controls"
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          margin: '2rem 0 0.5rem 0'
        }}
      >
        {['all', 'active', 'completed'].map(f => (
          <button
            key={f}
            className="filter-btn"
            style={{
              background: filter === f ? COLOR.secondary : '#f9f9f9',
              color: filter === f ? '#fff' : COLOR.primary,
              fontWeight: filter === f ? 700 : 500,
              border: `1.5px solid ${COLOR.primary}`,
              borderRadius: '8px',
              padding: '0.45rem 1.3rem',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
    );
  }

  // PUBLIC_INTERFACE
  /**
   * Renders each task row (including editing UI).
   */
  function TaskRow({ task }) {
    const isEditing = editTaskId === task.id;
    return (
      <li
        className="task-row"
        style={{
          display: 'flex', alignItems: 'center', gap: '1rem',
          padding: '0.9rem 0.7rem', borderBottom: '1px solid #e9ecef',
          background: task.completed ? '#fbfbfb' : '#fff',
          opacity: task.completed ? 0.67 : 1
        }}
      >
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => handleToggleComplete(task.id)}
          aria-label="Mark as completed"
          style={{
            accentColor: COLOR.accent,
            width: 22, height: 22,
            marginRight: 10,
            cursor: 'pointer'
          }}
        />
        {isEditing ? (
          <input
            className="edit-input"
            type="text"
            value={editValue}
            autoFocus
            maxLength={120}
            style={{
              flex: 1,
              border: `1.5px solid ${COLOR.accent}`,
              borderRadius: '8px',
              padding: '0.7rem',
              fontSize: '1rem'
            }}
            onChange={e => setEditValue(e.target.value)}
            onBlur={() => handleSaveEdit(task.id)}
            onKeyDown={e => handleEditKeyDown(e, task.id)}
            aria-label="Edit task"
          />
        ) : (
          <span
            style={{
              flex: 1, fontSize: '1.08rem', wordBreak: 'break-word',
              textDecoration: task.completed ? 'line-through' : 'none',
              color: task.completed ? COLOR.primary : '#333',
              fontWeight: 500
            }}
          >
            {task.title}
          </span>
        )}
        {!isEditing &&
          <div className="task-actions" style={{ display: 'flex', gap: '0.18rem' }}>
            <button
              className="action-edit"
              onClick={() => beginEditTask(task.id, task.title)}
              style={{
                background: COLOR.primary,
                color: '#fff',
                padding: '0.4rem 0.75rem',
                border: 'none',
                borderRadius: '7px',
                fontWeight: 600,
                cursor: 'pointer',
                marginRight: 3,
                fontSize: '0.98rem'
              }}
              aria-label="Edit task"
            >Edit</button>
            <button
              className="action-delete"
              onClick={() => handleDeleteTask(task.id)}
              style={{
                background: COLOR.accent, color: '#fff',
                padding: '0.4rem 0.7rem',
                border: 'none',
                borderRadius: '7px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.98rem'
              }}
              aria-label="Delete task"
            >Delete</button>
          </div>
        }
      </li>
    );
  }

  // List of all tasks (filtered)
  function TaskList() {
    return (
      <ul
        className="task-list"
        style={{
          width: '100%',
          maxWidth: 560,
          margin: '1.5rem auto 0 auto',
          background: '#fff',
          borderRadius: '14px',
          boxShadow: '0 0 10px 0 rgba(74,144,226,0.07)',
          padding: 0,
          listStyle: 'none'
        }}
      >
        {filteredTasks.length === 0 ? (
          <li style={{ padding: '2rem', color: '#aaa', textAlign: 'center', fontWeight: 500 }}>
            <span>No tasks {filter === 'all' ? 'found' : `in ${filter} filter`}.</span>
          </li>
        ) : (
          filteredTasks.map(task =>
            <TaskRow task={task} key={task.id} />
          )
        )}
      </ul>
    );
  }

  // Footer with info
  function AppFooter() {
    const env = getSupabaseEnv();
    return (
      <footer style={{
        padding: '1.8rem 0 1.2rem 0',
        textAlign: 'center',
        color: '#bbb',
        fontSize: '1rem',
        background: 'none',
        marginTop: 'auto'
      }}>
        <span>
          Made with <span style={{ color: COLOR.accent }}>❤</span> for KAVIA
        </span>
        <br />
        <span style={{ fontSize: '0.92rem', color: '#ccc', display: 'block', marginTop: '0.35rem' }}>
          Env backend: {env.url ? <code>connected</code> : <code>not set</code>}
        </span>
      </footer>
    );
  }

  // Responsive main container
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8f9fa',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Header />
      <main
        style={{
          padding: '2.2rem 1.2rem 1.2rem 1.2rem',
          width: '100%',
          maxWidth: 700,
          margin: '0 auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <TaskInput />
        <FilterControls />
        <TaskList />
      </main>
      <AppFooter />
    </div>
  );
}

export default App;
