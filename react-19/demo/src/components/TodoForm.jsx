import { useState, useRef, memo } from 'react';

// Optimized with React.memo
const TodoForm = memo(function TodoForm({ onAdd, isLoading }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('P2');

  // useRef: Focus the input after submission without causing re-render
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      // useRef example: Focus input on validation error
      inputRef.current?.focus();
      return;
    }

    await onAdd(title, priority);

    // Reset form
    setTitle('');
    setPriority('P2');

    // useRef example: Focus input for next entry
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter todo title..."
        className="todo-input"
        disabled={isLoading}
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className="todo-select"
        disabled={isLoading}
      >
        <option value="P1">P1</option>
        <option value="P2">P2</option>
        <option value="P3">P3</option>
      </select>
      <button type="submit" className="btn-add" disabled={isLoading}>
        {isLoading ? 'Adding...' : 'Add'}
      </button>
    </form>
  );
});

export default TodoForm;
