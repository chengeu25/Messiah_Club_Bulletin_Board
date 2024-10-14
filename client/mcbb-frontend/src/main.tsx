import React from 'react';
import ReactDOM from 'react-dom/client';
import Root from './routes/Root.route.tsx';
import rootLoader from './routes/Root.loader.tsx';
import './index.css';
import { createRoutesFromElements, Route, RouterProvider } from 'react-router';
import { createBrowserRouter } from 'react-router-dom';
import Login from './routes/login/Login.route.tsx';
import loginAction from './routes/login/Login.action.tsx';
import LandingPage from './routes/landingPage/LandingPage.route.tsx';
import VerifyEmail from './routes/verifyEmail/verifyEmail.route.tsx';
import Dashboard from './routes/dashboard/Dashboard.route.tsx';
import dashboardLoader from './routes/dashboard/Dashboard.loader.tsx';
import verifyEmailAction from './routes/verifyEmail/verifyEmail.action.tsx';
import Home from './routes/dashboard/home/Home.route.tsx';
import ForgotPassword from './routes/forgotPassword/ForgotPassword.route.tsx';
import forgotPasswordAction from './routes/forgotPassword/ForgotPassword.action.tsx';
import Calendar from './routes/dashboard/calendar/Calendar.route.tsx';
import Clubs from './routes/dashboard/clubs/Clubs.route.tsx';
import changePasswordAction from './routes/changePassword/changePassword.action.tsx';
import ChangePassword from './routes/changePassword/changePassword.route.tsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Root />} loader={rootLoader}>
      <Route path='/' element={<LandingPage />} />
      <Route path='login' element={<Login />} action={loginAction} />
      <Route
        path='verifyEmail'
        element={<VerifyEmail />}
        action={verifyEmailAction}
      />
      <Route
        path='forgot'
        element={<ForgotPassword />}
        action={forgotPasswordAction}
      />
      <Route
        path='changePassword'
        element={<ChangePassword />}
        action={changePasswordAction}
      />
      <Route path='dashboard' element={<Dashboard />} loader={dashboardLoader}>
        <Route path='home' element={<Home />} />
        <Route path='calendar' element={<Calendar />} />
        <Route path='clubs' element={<Clubs />} />
      </Route>
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
