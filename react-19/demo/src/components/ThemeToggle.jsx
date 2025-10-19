import { memo } from 'react';
import { useTheme } from '../context/ThemeContext';

// Optimized with React.memo
const ThemeToggle = memo(function ThemeToggle({ logEvent }) {
  const { theme, toggleTheme } = useTheme();

  const handleToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    logEvent('theme', `Theme changed to ${newTheme} mode`, [
      'useContext → useTheme()',
      'context value → theme',
      'context fn → toggleTheme()',
      'useState → setTheme() [in ThemeContext]'
    ]);
    toggleTheme();
  };

  return (
    <button onClick={handleToggle} className="theme-toggle" aria-label="Toggle theme">
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
});

export default ThemeToggle;
