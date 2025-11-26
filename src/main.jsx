import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import TasksPage from './pages/TasksPage.jsx';
import StatsPage from './pages/StatsPage.jsx';
import ConditionPage from './pages/ConditionPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import './index.css';

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <ProtectedRoute><CalendarPage /></ProtectedRoute> },
      { path: 'dashboard', element: <ProtectedRoute><DashboardPage /></ProtectedRoute> },
      { path: 'tasks', element: <ProtectedRoute><TasksPage /></ProtectedRoute> },
      { path: 'stats', element: <ProtectedRoute><StatsPage /></ProtectedRoute> },
      { path: 'condition', element: <ProtectedRoute><ConditionPage /></ProtectedRoute> },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
