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
import logoutLoader from './routes/logout/Logout.loader.tsx';
import verifyEmailLoader from './routes/verifyEmail/verifyEmail.loader.tsx';
import loginLoader from './routes/login/Login.loader.tsx';
import clubsAction from './routes/dashboard/clubs/Clubs.action.tsx';
import ClubForm from './routes/dashboard/club/edit_new/ClubForm.route.tsx';
import clubFormLoader from './routes/dashboard/club/edit_new/ClubForm.loader.tsx';
import clubFormAction from './routes/dashboard/club/edit_new/ClubForm.action.tsx';
import deleteClubLoader from './routes/dashboard/club/delete/DeleteClub.loader.tsx';
import EditInterestsAction from './routes/editinterestpage/editinterest.action.tsx';
import EditInterestLoader from './routes/editinterestpage/editinterest.loader.tsx';
import clubAction from './routes/dashboard/club/Club.action.tsx';
import ClubEventForm from './routes/dashboard/createEvent/ClubEventForm.route.tsx';
import clubEventFormLoader from './routes/dashboard/createEvent/ClubEventForm.loader.tsx';
import clubEventFormAction from './routes/dashboard/createEvent/ClubEventForm.action.tsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Root />} loader={rootLoader}>
      <Route path='/' element={<LandingPage />} />
      <Route
        path='login'
        element={<Login />}
        loader={loginLoader}
        action={loginAction}
      />
      <Route path='logout' loader={logoutLoader} />
      <Route path='signup' element={<SignUp />} action={signUpAction} />
      <Route
        path='verifyEmail'
        element={<VerifyEmail />}
        action={verifyEmailAction}
        loader={verifyEmailLoader}
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
      <Route path='forgotPasswordMessage' element={<ForgotPasswordMessage />} />
      <Route
        path='forgotPasswordToken'
        element={<ForgotPasswordToken />}
        action={forgotPasswordTokenAction}
      />
      <Route path='dashboard' element={<Dashboard />} loader={dashboardLoader}>
        <Route path='home' element={<Home />} loader={homeLoader} />
        <Route path='calendar' element={<Calendar />} loader={calendarLoader} />
        <Route
          path='clubs'
          element={<Clubs />}
          loader={clubsLoader}
          action={clubsAction}
        />
        <Route path='event' element={<Event />} loader={eventLoader} />
        <Route path='club'>
          <Route
            path=':id'
            element={<Club />}
            loader={clubLoader}
            action={clubAction}
          />
          <Route
            path=':id/edit'
            element={<ClubForm />}
            loader={clubFormLoader}
            action={clubFormAction}
          />
          <Route path=':id/delete' loader={deleteClubLoader} />
          <Route path=':id/newEvent' loader={clubEventFormLoader} element={<ClubEventForm />} action={clubEventFormAction} /> 
          
          <Route
            path='new'
            element={<ClubForm />}
            action={clubFormAction}
            loader={clubFormLoader}
          />
        </Route>
      </Route>
      <Route
        path='editinterest'
        element={<EditInterest />}
        action={EditInterestsAction}
        loader={EditInterestLoader}
      />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
