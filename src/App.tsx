import React, { useState, useEffect, useRef } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = localStorage.getItem('todos');
    return savedTodos ? JSON.parse(savedTodos) : [];
  });
  const [inputValue, setInputValue] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    // Clean up video stream when component unmounts or streaming stops
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  const toggleCamera = () => {
    if (isStreaming) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const addTodo = () => {
    if (inputValue.trim()) {
      const newTodo: Todo = {
        id: Date.now(),
        text: inputValue.trim(),
        completed: false,
      };
      setTodos([...todos, newTodo]);
      setInputValue('');
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos(todos.filter((todo) => !todo.completed));
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeTodosCount = todos.filter((todo) => !todo.completed).length;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Todo List</h1>
      
      <div style={styles.cameraContainer}>
        <button 
          onClick={toggleCamera} 
          style={{
            ...styles.cameraButton,
            backgroundColor: isStreaming ? '#ff6b6b' : '#4CAF50'
          }}
        >
          {isStreaming ? 'Stop Camera' : 'Start Camera'}
        </button>
        {isStreaming && (
          <video 
            ref={videoRef}
            autoPlay
            style={styles.videoElement}
          />
        )}
      </div>
      
      <div style={styles.inputContainer}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="What needs to be done?"
          style={styles.input}
        />
        <button onClick={addTodo} style={styles.addButton}>
          Add
        </button>
      </div>
      
      {todos.length > 0 && (
        <div style={styles.filterContainer}>
          <button 
            onClick={() => setFilter('all')} 
            style={{
              ...styles.filterButton,
              ...(filter === 'all' ? styles.activeFilter : {})
            }}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('active')} 
            style={{
              ...styles.filterButton,
              ...(filter === 'active' ? styles.activeFilter : {})
            }}
          >
            Active
          </button>
          <button 
            onClick={() => setFilter('completed')} 
            style={{
              ...styles.filterButton,
              ...(filter === 'completed' ? styles.activeFilter : {})
            }}
          >
            Completed
          </button>
        </div>
      )}
      
      <ul style={styles.todoList}>
        {filteredTodos.map((todo) => (
          <li key={todo.id} style={styles.todoItem}>
            <div style={styles.todoContent}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                style={styles.checkbox}
              />
              <span style={{
                ...styles.todoText,
                ...(todo.completed ? styles.completedTodo : {})
              }}>
                {todo.text}
              </span>
            </div>
            <button
              onClick={() => deleteTodo(todo.id)}
              style={styles.deleteButton}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      
      {todos.length > 0 && (
        <div style={styles.footer}>
          <span>{activeTodosCount} item{activeTodosCount !== 1 ? 's' : ''} left</span>
          <button onClick={clearCompleted} style={styles.clearButton}>
            Clear completed
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    textAlign: 'center' as const,
    color: '#333',
    marginBottom: '20px',
  },
  cameraContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    marginBottom: '20px',
  },
  cameraButton: {
    padding: '10px 15px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '10px',
  },
  videoElement: {
    width: '100%',
    maxHeight: '300px',
    borderRadius: '4px',
    backgroundColor: '#000',
  },
  inputContainer: {
    display: 'flex',
    marginBottom: '20px',
  },
  input: {
    flex: '1',
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px 0 0 4px',
  },
  addButton: {
    padding: '10px 15px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '0 4px 4px 0',
    cursor: 'pointer',
  },
  filterContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom