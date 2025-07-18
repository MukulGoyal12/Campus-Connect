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
import UserProfile from "./Pages/UserProfile";
import Notification from "./Pages/Notifications";
import Inbox from "./Pages/Inbox";
import SocketProvider from "./provider/SocketProvider";

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
            <Home />
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
      {
        path: "user/:id",
        element: (
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        ),
      },      
      {
        path: "notifications",
        element: (
          <ProtectedRoute>
            <Notification/>
          </ProtectedRoute>
        ),
      },      
      {
        path: "inbox",
        element: (
          <ProtectedRoute>
            <Inbox/>
          </ProtectedRoute>
        ),
      },      
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
<SocketProvider>
      <RouterProvider router={appRoutes} />
</SocketProvider>
  </React.StrictMode>
);
