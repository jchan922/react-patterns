import { memo } from 'react';

// Optimized with React.memo to prevent unnecessary re-renders
// Only re-renders when props actually change
const TodoItem = memo(function TodoItem({ item, onDelete }) {
  console.log('TodoItem rendered:', item.id);

  return (
    <div className="todo-item">
      <div className="todo-content">
        <span className="todo-title">{item.title}</span>
        <span className={`todo-priority priority-${item.priority.toLowerCase()}`}>
          {item.priority}
        </span>
      </div>
      <button
        onClick={() => onDelete(item.id)}
        className="btn-delete"
        aria-label="Delete todo"
      >
        ×
      </button>
    </div>
  );
});

export default TodoItem;
