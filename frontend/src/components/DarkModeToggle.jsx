import { useTheme } from '../contexts/ThemeContext'
import { FiSun, FiMoon } from 'react-icons/fi'

export default function DarkModeToggle() {
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <div className="relative inline-flex items-center">
      <button
        onClick={toggleTheme}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
          ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}
        `}
        aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      >
        {/* Sliding indicator */}
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ease-in-out
            ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}
          `}
        >
          {/* Icons inside the sliding indicator */}
          <span className="absolute inset-0 flex items-center justify-center">
            {isDarkMode ? (
              <FiSun className="w-3 h-3 text-yellow-500" />
            ) : (
              <FiMoon className="w-3 h-3 text-gray-600" />
            )}
          </span>
        </span>
      </button>
    </div>
  )
}