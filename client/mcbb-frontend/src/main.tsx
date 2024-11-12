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
import ForgotPasswordMessage from './routes/forgotPasswordMessage/ForgotPasswordMessage.route.tsx';
import Calendar from './routes/dashboard/calendar/Calendar.route.tsx';
import Clubs from './routes/dashboard/clubs/Clubs.route.tsx';
import changePasswordAction from './routes/changePassword/changePassword.action.tsx';
import ChangePassword from './routes/changePassword/changePassword.route.tsx';
import Event from './routes/dashboard/event/Event.route.tsx';
import Club from './routes/dashboard/club/Club.route.tsx';
import EditInterest from './routes/editinterestpage/editinterest.route.tsx';
import SignUp from './routes/signup/SignUp.route.tsx';
import signUpAction from './routes/signup/SignUp.action.tsx';
import homeLoader from './routes/dashboard/home/Home.loader.tsx';
import calendarLoader from './routes/dashboard/calendar/Calendar.loader.tsx';
import clubsLoader from './routes/dashboard/clubs/Clubs.loader.tsx';
import eventLoader from './routes/dashboard/event/Event.loader.tsx';
import clubLoader from './routes/dashboard/club/Club.loader.tsx';
import changePasswordLoader from './routes/changePassword/changePassword.loader.tsx';
import ResetPassword from './routes/resetPassword/resetPassword.route.tsx';
import resetPasswordAction from './routes/resetPassword/resetPassword.action.tsx';
import ForgotPasswordToken from './routes/passwordToken/PasswordToken.route.tsx';
import forgotPasswordTokenAction from './routes/passwordToken/PasswordToken.action.tsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Root />} loader={rootLoader}>
      <Route path='/' element={<LandingPage />} />
      <Route path='login' element={<Login />} action={loginAction} />
      <Route path='signup' element={<SignUp />} action={signUpAction} />
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
        loader={changePasswordLoader}
      />
      <Route
        path='resetPassword'
        element={<ResetPassword />}
        action={resetPasswordAction}
      />
      <Route
        path='forgotPasswordMessage'
        element={<ForgotPasswordMessage />}
      />
      <Route
        path='forgotPasswordToken'
        element={<ForgotPasswordToken />}
        action={forgotPasswordTokenAction}
      />
      <Route path='dashboard' element={<Dashboard />} loader={dashboardLoader}>
        <Route path='home' element={<Home />} loader={homeLoader} />
        <Route path='calendar' element={<Calendar />} loader={calendarLoader} />
        <Route path='clubs' element={<Clubs />} loader={clubsLoader} />
        <Route path='event' element={<Event />} loader={eventLoader} />
        <Route path='club' element={<Club />} loader={clubLoader} />
      </Route>
      <Route path='editinterest' element={<EditInterest />} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
