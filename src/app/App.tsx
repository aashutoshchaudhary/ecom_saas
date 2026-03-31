import { RouterProvider } from 'react-router';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './lib/auth-context';
import { router } from './routes';

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="saas-builder-theme">
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
