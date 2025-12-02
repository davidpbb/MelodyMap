import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Profile from "./pages/Profile";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/", element: <App /> },
      { path: "/profile", element: <Profile /> },
      { path: "/login", element: <Login /> }
    ]
  }
]);


createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)
