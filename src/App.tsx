import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from './components/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Analytics } from './pages/Analytics';
import { Costs } from './pages/Costs';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Toaster } from './components/ui/sonner';
import { LampProvider } from './context/LampContext';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { ProtectedRoute } from './components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <SettingsProvider>
                  <LampProvider>
                    <AppLayout>
                      <Routes>
                        <Route path="/" element={<Analytics />} />
                        <Route path="/carte" element={<Dashboard />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/couts" element={<Costs />} />
                        <Route path="/settings" element={<Settings />} />
                      </Routes>
                    </AppLayout>
                  </LampProvider>
                  </SettingsProvider>
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
