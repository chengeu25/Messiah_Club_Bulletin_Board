import React from 'react';
import ReactDOM from 'react-dom/client';
import Root from './routes/Root.route.tsx';
import rootLoader from './routes/Root.loader.tsx';
import './index.css';
import { createRoutesFromElements, Route, RouterProvider } from 'react-router';
import { createBrowserRouter } from 'react-router-dom';
import Login from './routes/login/Login.route.tsx';
import loginAction from './routes/login/Login.action.tsx';
import NavigateToLogin from './routes/navigateToLogin/NavigateToLogin.route.tsx';
import VerifyEmail from './routes/verifyEmail/verifyEmail.route.tsx';
import Dashboard from './routes/dashboard/Dashboard.route.tsx';
import dashboardLoader from './routes/dashboard/Dashboard.loader.tsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Root />} loader={rootLoader}>
      <Route path='/' element={<NavigateToLogin />} />
      <Route path='login' element={<Login />} action={loginAction} />
      <Route path='verifyEmail' element={<VerifyEmail />} />
      <Route path='dashboard' element={<Dashboard />} loader={dashboardLoader}>
        <Route path='home' element={<div>Home</div>} />
        <Route path='calendar' element={<div>Calendar</div>} />
        <Route path='clubs' element={<div>Clubs</div>} />
      </Route>
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
