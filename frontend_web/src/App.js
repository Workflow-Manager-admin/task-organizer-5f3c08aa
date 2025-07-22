import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { createClient } from '@supabase/supabase-js';

// PUBLIC_INTERFACE
/**
 * Main App component for the To-Do list application using Supabase for all CRUD.
 * 
 * ENVIRONMENT:
 *   Your .env file in project root MUST include:
 *     REACT_APP_SUPABASE_URL=https://your-supabase-project.supabase.co
 *     REACT_APP_SUPABASE_KEY=your-anon-or-service-role-key
 *   You MUST restart npm after editing .env
 *   In Supabase, create table 'tasks' as:
 *     id: bigint (PK, generated always as identity)
 *     title: text
 *     completed: boolean (default false)
 *     created_at: timestamp (default now())
 * 
 * All CRUD logic below connects live to Supabase project!
 */
function App() {
  // --- Color palette for styling
  const COLOR = {
    accent: '#e94e77',
    primary: '#4a90e2',
    secondary: '#50e3c2'
  };

  // --- Supabase client initialization using standard env vars
  const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
  const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY;
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // --- Core app state
  const [tasks, setTasks] = useState([]); // Supabase data
  const [input, setInput] = useState('');
  const [editTaskId, setEditTaskId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [filter, setFilter] = useState('all'); // all | active | completed
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // PUBLIC_INTERFACE
  /**
   * Load tasks from Supabase on mount/connection change
   */
  useEffect(() => {
    async function fetchTasks() {
      setLoading(true);
      setError('');
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) {
        setError('Failed to load tasks');
        setTasks([]);
      } else {
        setTasks(
          (data || []).map(t => ({
            id: t.id,
            title: t.title,
            completed: !!t.completed,
            created_at: t.created_at
          }))
        );
      }
      setLoading(false);
    }
    fetchTasks();
    // Optionally: subscribe to realtime updates here (see Supabase docs)
    // eslint-disable-next-line
  }, [SUPABASE_URL, SUPABASE_KEY]);

  // PUBLIC_INTERFACE
  /**
   * Add a new task to Supabase ('tasks' table) and local state
   */
  const handleAddTask = async (e) => {
    e.preventDefault();
    const value = input.trim();
    if (!value) return;
    setLoading(true);
    setError('');
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ title: value, completed: false }])
      .select();
    if (error) {
      setError('Failed to add task');
    } else if (data && data.length > 0) {
      setTasks(prev => [
        ...prev,
        {
          id: data[0].id,
          title: data[0].title,
          completed: !!data[0].completed,
          created_at: data[0].created_at
        }
      ]);
      setInput('');
      if (inputRef.current) inputRef.current.focus();
    }
    setLoading(false);
  };

  // PUBLIC_INTERFACE
  /**
   * Begin editing a task (show edit input for a task)
   */
  const beginEditTask = (taskId, currentTitle) => {
    setEditTaskId(taskId);
    setEditValue(currentTitle);
  };

  // PUBLIC_INTERFACE
  /**
   * Save edits to a task (persist to Supabase)
   */
  const handleSaveEdit = async (taskId) => {
    const value = editValue.trim();
    if (!value) {
      setEditTaskId(null);
      setEditValue('');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await supabase
      .from('tasks')
      .update({ title: value })
      .eq('id', taskId);
    if (error) {
      setError('Failed to update task');
    } else {
      setTasks(tasks.map(t =>
        t.id === taskId ? { ...t, title: value } : t
      ));
    }
    setEditTaskId(null);
    setEditValue('');
    setLoading(false);
  };

  // PUBLIC_INTERFACE
  /**
   * Delete a task from Supabase and update UI
   */
  const handleDeleteTask = async (taskId) => {
    setLoading(true);
    setError('');
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
    if (error) {
      setError('Failed to delete task');
    } else {
      setTasks(tasks.filter(t => t.id !== taskId));
    }
    setLoading(false);
  };

  // PUBLIC_INTERFACE
  /**
   * Toggle the completed status and update Supabase
   */
  const handleToggleComplete = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newCompleted = !task.completed;
    setLoading(true);
    setError('');
    const { error } = await supabase
      .from('tasks')
      .update({ completed: newCompleted })
      .eq('id', taskId);
    if (error) {
      setError('Failed to update completed status');
    } else {
      setTasks(tasks.map(t =>
        t.id === taskId ? { ...t, completed: newCompleted } : t
      ));
    }
    setLoading(false);
  };

  // PUBLIC_INTERFACE
  /**
   * Filter visible tasks list
   */
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  // PUBLIC_INTERFACE
  /**
   * Utility: get env data for Supabase (for footer display)
   */
  const getSupabaseEnv = () => {
    return {
      url: SUPABASE_URL,
      key: SUPABASE_KEY,
    };
  };

  // PUBLIC_INTERFACE
  /**
   * Key handling for edit input
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

  // Task input form for adding new task
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
          disabled={loading}
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
          disabled={loading}
        >
          {loading ? '...' : 'Add'}
        </button>
      </form>
    );
  }

  // PUBLIC_INTERFACE
  /**
   * Filter controls: all / active / completed
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
   * A single task row (with edit/delete)
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
          disabled={loading}
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
            disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
            >Delete</button>
          </div>
        }
      </li>
    );
  }

  // PUBLIC_INTERFACE
  /**
   * List of tasks. Shows loading/error states.
   */
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
        {loading && (
          <li style={{ padding: '2rem', color: COLOR.primary, textAlign: 'center', fontWeight: 500 }}>
            Loading...
          </li>
        )}
        {!!error && (
          <li style={{ padding: '2rem', color: COLOR.accent, textAlign: 'center', fontWeight: 500 }}>
            {error}
          </li>
        )}
        {!loading && !error && filteredTasks.length === 0 ? (
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

  // PUBLIC_INTERFACE
  /**
   * Footer with Supabase connection status and quick instructions
   */
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
          Supabase: <code>
            {env.url && env.key
              ? 'connected'
              : 'not connected: check .env for REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_KEY'}
          </code>
        </span>
        <br />
        <span style={{ fontSize: '0.89rem', color: '#aaa', marginTop: '.2rem', display: 'block' }}>
          <strong>Tip:</strong> Your .env should have<br />
          <code>REACT_APP_SUPABASE_URL=...</code><br />
          <code>REACT_APP_SUPABASE_KEY=...</code><br />
          <em>After editing .env, fully stop &amp; restart <code>npm start</code>.</em>
          <br />
          Never commit actual keys to public repos.<br />
          See: <a href="https://supabase.com/docs/" style={{ color: COLOR.primary }}>Supabase Docs</a>
        </span>
      </footer>
    );
  }

  // --- MAIN COMPONENT RENDER
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
