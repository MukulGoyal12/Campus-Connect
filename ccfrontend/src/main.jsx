import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Profile from "./Pages/Profile";
import MarketPlace from "./Pages/MarketPlace";
import ProtectedRoute from "./components/ProtectedRoute";

const appRoutes = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "auth/login", element: <Login /> },
      { path: "auth/register", element: <Register /> },

      {
        path: "home",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "marketplace",
        element: (
          <ProtectedRoute>
            <MarketPlace />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={appRoutes} />
  </React.StrictMode>
);
