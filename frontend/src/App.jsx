import { lazy, Suspense } from 'react';
import AppRoutes from './Routes/appRoutes';
import { ThemeProvider } from './contexts/ThemeContext'; // Import the provider

const CommandPalette = lazy(() => import('./components/CommandPalette'));

function App() {
  return (
    <ThemeProvider> {/* Wrap EVERYTHING here */}
      <Suspense fallback={null}>
        <CommandPalette />
      </Suspense>
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;