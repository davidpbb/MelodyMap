import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Profile from "./pages/Profile";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";
import RegistrarEscucha from './pages/RegistrarEscucha.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Logout from './components/Logout.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/", element: <App /> },
      { path: "/profile", element: <ProtectedRoute><Profile /></ProtectedRoute> },
      { path: "/login", element: <Login /> },
      { path: "/logout", element: <ProtectedRoute><Logout /></ProtectedRoute> },
      { path: "/registrar_escucha", element: <ProtectedRoute><RegistrarEscucha /></ProtectedRoute> }
    ]
  }
]);


createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)
