import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from './components/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { Toaster } from './components/ui/sonner';
import { LampProvider } from './context/LampContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LampProvider>
        <Router>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Analytics />} />
              <Route path="/carte" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </AppLayout>
          <Toaster />
        </Router>
      </LampProvider>
    </QueryClientProvider>
  );
}

export default App;
