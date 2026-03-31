import { RouterProvider } from 'react-router';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/sonner';
import { router } from './routes';

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="saas-builder-theme">
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
