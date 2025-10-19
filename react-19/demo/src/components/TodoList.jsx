import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { mockApi } from '../api/mockApi';
import TodoForm from './TodoForm';
import TodoItem from './TodoItem';

const TodoList = memo(function TodoList({ list, onDelete, logEvent }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState('date'); // 'date' or 'priority'

  useEffect(() => {
    // PATTERN: Cleanup flag to prevent memory leaks
    // Prevents state updates if component unmounts during async operation
    let isMounted = true;

    const fetchItems = async () => {
      try {
        // Async API call to fetch items for this list
        const data = await mockApi.getItemsByList(list.id);

        // Only update state if component is still mounted
        if (isMounted) {
          setItems(data);
        }
      } catch (error) {
        console.error('Failed to fetch items:', error);
      }
    };

    fetchItems();

    // CLEANUP FUNCTION: Runs when component unmounts or deps change
    // Sets flag to false so pending async operations don't update state
    return () => {
      isMounted = false;
    };
  }, [list.id]);

  const sortedItems = useMemo(() => {
    // Create copy to avoid mutating original array
    const itemsCopy = [...items];

    if (sortBy === 'priority') {
      // P1 (highest priority) -> P2 -> P3 (lowest)
      const priorityOrder = { P1: 1, P2: 2, P3: 3 };
      return itemsCopy.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else {
      // Sort by date: newest items first
      return itemsCopy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, [items, sortBy]);

  const handleAddItem = useCallback(async (title, priority) => {
    setIsLoading(true);

    logEvent('item-add', `Adding "${title}" (${priority}) to "${list.title}"`, [
      'useCallback → handleAddItem',
      'param → title, priority',
      'useState → setIsLoading(true)',
      'prop → list.id, list.title'
    ]);

    try {
      // Async API call to create item
      const newItem = await mockApi.createItem(list.id, title, priority);

      // PATTERN: Functional update to avoid stale closure
      setItems(prev => [...prev, newItem]);

      logEvent('item-add', `Item added successfully to "${list.title}"`, [
        'useCallback → handleAddItem',
        'useState → setItems(prev => [...prev, newItem])',
        'async/await → mockApi.createItem()'
      ]);
    } catch (error) {
      console.error('Failed to add item:', error);
      logEvent('item-add', 'Failed to add item', [
        'useCallback → handleAddItem',
        'async/await → mockApi.createItem() [error]'
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [list.id, list.title, logEvent]);

  // Handler: Delete item from this list
  // deps: [items, list.title, logEvent] - needs items to find title for logging
  const handleDeleteItem = useCallback(async (id) => {
    const itemToDelete = items.find(i => i.id === id);

    logEvent('item-delete', `Deleting "${itemToDelete?.title}" from "${list.title}"`, [
      'useCallback → handleDeleteItem',
      'param → id',
      'state → items'
    ]);

    try {
      // Async API call to delete item
      await mockApi.deleteItem(id);

      // PATTERN: Functional update with filter
      setItems(prev => prev.filter(item => item.id !== id));

      logEvent('item-delete', `Item deleted from "${list.title}"`, [
        'useCallback → handleDeleteItem',
        'useState → setItems(prev => prev.filter())',
        'async/await → mockApi.deleteItem(id)'
      ]);
    } catch (error) {
      console.error('Failed to delete item:', error);
      logEvent('item-delete', 'Failed to delete item', [
        'useCallback → handleDeleteItem',
        'async/await → mockApi.deleteItem() [error]'
      ]);
    }
  }, [items, list.title, logEvent]);

  // Handler: Change sort order (priority vs date)
  // deps: [list.title, logEvent]
  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort);

    // Note: Changing sortBy triggers useMemo recalculation of sortedItems
    logEvent('sort', `Sorted "${list.title}" by ${newSort}`, [
      'useCallback → handleSortChange',
      'param → newSort',
      'useState → setSortBy(newSort)',
      'useMemo → sortedItems recalculates'
    ]);
  }, [list.title, logEvent]);

  return (
    <div className="todo-list">
      {/* List header with title and delete button */}
      <div className="todo-list-header">
        <h2>{list.title}</h2>
        <button
          onClick={() => onDelete(list.id)}
          className="btn-delete"
          aria-label="Delete list"
        >
          Delete List
        </button>
      </div>

      {/* Form to add new items (uses useRef, memoized with React.memo) */}
      <TodoForm onAdd={handleAddItem} isLoading={isLoading} />

      {/* Sort filters - only show if items exist */}
      {items.length > 0 && (
        <div className="todo-filters">
          <label>Sort by:</label>
          <button
            onClick={() => handleSortChange('priority')}
            className={`filter-btn ${sortBy === 'priority' ? 'active' : ''}`}
          >
            Priority
          </button>
          <button
            onClick={() => handleSortChange('date')}
            className={`filter-btn ${sortBy === 'date' ? 'active' : ''}`}
          >
            Date
          </button>
        </div>
      )}

      {/* Items list - renders sortedItems from useMemo */}
      <div className="todo-items">
        {sortedItems.length === 0 ? (
          <p className="empty-state">No todos yet. Add one above!</p>
        ) : (
          // PATTERN: List rendering with unique keys
          sortedItems.map(item => (
            <TodoItem
              key={item.id}
              item={item}
              onDelete={handleDeleteItem}
            />
          ))
        )}
      </div>

      {/* Stats footer */}
      <div className="todo-stats">
        <span>Total: {items.length}</span>
      </div>
    </div>
  );
});

export default TodoList;
