import { lazy, Suspense } from 'react';
import AppRoutes from './Routes/appRoutes';

const CommandPalette = lazy(() => import('./components/CommandPalette'));

function App() {
  return (
    <>
      <Suspense fallback={null}>
        <CommandPalette />
      </Suspense>
      <AppRoutes />
    </>
  );
}

export default App;
