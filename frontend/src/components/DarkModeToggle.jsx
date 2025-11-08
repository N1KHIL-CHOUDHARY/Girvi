import { useTheme } from '../contexts/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi'; // Assuming you have react-icons installed

export default function DarkModeToggle() {
  // Get the current state and the toggle function from your context
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 rounded-full 
        transition-all duration-300 ease-in-out
        text-neutral-800 dark:text-yellow-400
        bg-gray-200 dark:bg-neutral-800
        hover:bg-gray-300 dark:hover:bg-neutral-700
        focus:outline-none focus:ring-2 focus:ring-offset-2 
        focus:ring-indigo-500
      `}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {isDarkMode ? (
        // If it IS dark mode, show the SUN icon
        <FiSun className="w-5 h-5" />
      ) : (
        // If it is NOT dark mode (light mode), show the MOON icon
        <FiMoon className="w-5 h-5" />
      )}
    </button>
  );
}