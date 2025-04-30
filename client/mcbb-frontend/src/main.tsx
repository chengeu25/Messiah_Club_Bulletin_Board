import React from 'react';
import ReactDOM from 'react-dom/client';
import Root from './routes/Root.route.tsx';
import rootLoader from './routes/Root.loader.tsx';
import './index.css';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from 'react-router-dom';
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
import logoutLoader from './routes/logout/Logout.loader.tsx';
import verifyEmailLoader from './routes/verifyEmail/verifyEmail.loader.tsx';
import loginLoader from './routes/login/Login.loader.tsx';
import changePasswordLoader from './routes/changePassword/changePassword.loader.tsx';
import ForgotPasswordToken from './routes/passwordToken/PasswordToken.route.tsx';
import forgotPasswordTokenAction from './routes/passwordToken/PasswordToken.action.tsx';
import ForgotPasswordTokenLoader from './routes/passwordToken/PasswordToken.loader.tsx';
import clubsAction from './routes/dashboard/clubs/Clubs.action.tsx';
import ClubForm from './routes/dashboard/club/edit_new/ClubForm.route.tsx';
import clubFormLoader from './routes/dashboard/club/edit_new/ClubForm.loader.tsx';
import clubFormAction from './routes/dashboard/club/edit_new/ClubForm.action.tsx';
import deleteClubLoader from './routes/dashboard/club/delete/DeleteClub.loader.tsx';
import EditInterestsAction from './routes/editinterestpage/editinterest.action.tsx';
import EditInterestLoader from './routes/editinterestpage/editinterest.loader.tsx';
import clubAction from './routes/dashboard/club/Club.action.tsx';
import AddedInterest from './routes/dashboard/addeditinterestpage/addeditinterest.route.tsx';
import addInterestAction from './routes/dashboard/addeditinterestpage/addedinterest.action.tsx';
import clubEventFormAction from './routes/dashboard/createEvent/ClubEventForm.action.tsx';
import clubEventFormLoader from './routes/dashboard/createEvent/ClubEventForm.loader.tsx';
import ClubEventForm from './routes/dashboard/createEvent/ClubEventForm.route.tsx';
import ErrorPage from './routes/error/ErrorPage.tsx';
import homeAction from './routes/dashboard/home/Home.action.tsx';
import eventAction from './routes/dashboard/event/Event.action.tsx';
import AssignFaculty from './routes/dashboard/assignFaculty/assignFaculty.route.tsx';
import assignFacultyAction from './routes/dashboard/assignFaculty/assignFaculty.action.tsx';
import assignFacultyLoader from './routes/dashboard/assignFaculty/assignFaculty.loader.tsx';
import signUpLoader from './routes/signup/SignUp.loader.tsx';
import SelectSchool from './routes/selectSchool/SelectSchool.route.tsx';
import selectSchoolLoader from './routes/selectSchool/SelectSchool.loader';
import selectSchoolAction from './routes/selectSchool/SelectSchool.action';
import { SchoolProvider } from './contexts/SchoolContext';
import LoginRedirector from './routes/login/LoginRedirecter.route.tsx';
import AdminUserForm from './routes/dashboard/adminUserForm/adminUserForm.route.tsx';
import adminUserFormLoader from './routes/dashboard/adminUserForm/adminUserForm.loader.tsx';
import adminUserFormAction from './routes/dashboard/adminUserForm/adminUserForm.action.tsx';
import emailPreferencesLoader from './routes/dashboard/emailPreferences/EmailPreferences.loader.tsx';
import emailPreferencesAction from './routes/dashboard/emailPreferences/EmailPreferences.action.tsx';
import EmailPreferences from './routes/dashboard/emailPreferences/EmailPreferences.route.tsx';
import AccountInfo from './routes/accountInfo/accountInfo.route.tsx';
import accountInfoAction from './routes/accountInfo/accountInfo.action.tsx';
import accountInfoLoader from './routes/accountInfo/accountInfo.loader.tsx';
import cohostApprovalLoader from './routes/dashboard/cohostApproval/cohostApproval.loader.tsx';
import CohostApproval from './routes/dashboard/cohostApproval/cohostApproval.route.tsx';
import { cohostApprovalAction } from './routes/dashboard/cohostApproval/cohostApproval.action.tsx';
import SendEmailForm from './routes/dashboard/club/SendEmailForm/SendEmailForm.route.tsx';
import sendEmailAction from './routes/dashboard/club/SendEmailForm/SendEmail.action.tsx';
import AboutUs from './routes/aboutus/aboutus.route.tsx';
import ContactUs from './routes/contactus/contactus.route.tsx';
import facultyEventApprovalloader from './routes/facultyEventApproval/facultyEventApproval.loader.tsx';
import { facultyEventApprovalAction } from './routes/facultyEventApproval/facultyEventApproval.action.tsx';
import FacultyEventApproval from './routes/facultyEventApproval/facultyEventApproval.route.tsx';
import Image from './routes/dashboard/images/Image.route.tsx';
import imageAction from './routes/dashboard/images/Image.action.tsx';
import SchoolEdit from './routes/schoolEdit/schoolEdit.route.tsx';
import schoolEditloader from './routes/schoolEdit/schoolEdit.loader.tsx';
import { schoolEditaction } from './routes/schoolEdit/schoolEdit.action.tsx';
// import AddSchoolPage from './routes/landingPage/addSchool/addSchool.route.tsx';
// import addSchoolsAction from './routes/landingPage/addSchool/addSchool.action.tsx';
import Faculty from './routes/faculty/Faculty.route.tsx';
import facultyLoader from './routes/faculty/Faculty.loader.tsx';
import { NotificationProvider } from './contexts/NotificationContext.tsx';
import Reports from './routes/dashboard/reports/Reports.route.tsx';
import clubReportsLoader from './routes/dashboard/reports/ClubReports.loader.tsx';
import facultyReportsLoader from './routes/dashboard/reports/SchoolWideReports.loader.tsx';
import eventReportsLoader from './routes/dashboard/reports/EventReports.loader.tsx';
import userReportsLoader from './routes/dashboard/reports/UserReports.loader.tsx';
import reportsAction from './routes/dashboard/reports/Reports.action.tsx';
import AddedInterestLoader from './routes/dashboard/addeditinterestpage/addeditinterest.loader.tsx';
import commentModerationLoader from './routes/dashboard/commentModeration/commentModeration.loader.tsx';
import commentModerationAction from './routes/dashboard/commentModeration/commentModeration.action.tsx';
import CommentModeration from './routes/dashboard/commentModeration/commentModeration.route.tsx';
import SendEmailLoader from './routes/dashboard/club/SendEmailForm/SendEmail.loader.tsx';
import landingPageLoader from './routes/landingPage/LandingPage.loader.tsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path='/'
      element={
        <SchoolProvider>
          <NotificationProvider>
            <Root />
          </NotificationProvider>
        </SchoolProvider>
      }
      loader={rootLoader}
      errorElement={<ErrorPage />}
    >
      <Route index loader={landingPageLoader} element={<LandingPage />} />
      <Route
        path='login'
        element={<LoginRedirector />}
        errorElement={<ErrorPage />}
      >
        <Route
          path=':schoolId'
          element={<Login />}
          loader={loginLoader}
          action={loginAction}
          errorElement={<ErrorPage />}
        />
      </Route>
      <Route path='logout' loader={logoutLoader} errorElement={<ErrorPage />} />
      <Route
        path='signup/:schoolId'
        element={<SignUp />}
        action={signUpAction}
        loader={signUpLoader}
        errorElement={<ErrorPage />}
      />
      <Route
        path='verifyEmail'
        element={<VerifyEmail />}
        action={verifyEmailAction}
        loader={verifyEmailLoader}
        errorElement={<ErrorPage />}
      />
      <Route
        path='forgot'
        element={<ForgotPassword />}
        action={forgotPasswordAction}
        errorElement={<ErrorPage />}
      />
      <Route
        path='changePassword'
        element={<ChangePassword />}
        action={changePasswordAction}
        loader={changePasswordLoader}
        errorElement={<ErrorPage />}
      />
      <Route
        path='forgotPasswordMessage'
        element={<ForgotPasswordMessage />}
        errorElement={<ErrorPage />}
      />
      <Route
        path='forgotPasswordToken'
        element={<ForgotPasswordToken />}
        loader={ForgotPasswordTokenLoader}
        action={forgotPasswordTokenAction}
        errorElement={<ErrorPage />}
      />
      <Route
        path='selectSchool'
        element={<SelectSchool />}
        loader={selectSchoolLoader}
        action={selectSchoolAction}
        errorElement={<ErrorPage />}
      />
      <Route path='dashboard' element={<Dashboard />} loader={dashboardLoader}>
        <Route
          path='home'
          element={<Home />}
          loader={homeLoader}
          action={homeAction}
          errorElement={<ErrorPage />}
        />
        <Route
          path='cohostApproval'
          element={<CohostApproval />}
          loader={cohostApprovalLoader}
          action={cohostApprovalAction}
          errorElement={<ErrorPage />}
        />
        <Route
          path='calendar'
          element={<Calendar />}
          loader={calendarLoader}
          action={homeAction}
          errorElement={<ErrorPage />}
        />
        <Route
          path='clubs'
          element={<Clubs />}
          loader={clubsLoader}
          action={clubsAction}
          errorElement={<ErrorPage />}
        />
        <Route
          path='addeditinterestpage'
          loader={AddedInterestLoader}
          element={<AddedInterest />}
          action={addInterestAction}
          errorElement={<ErrorPage />}
        />
        <Route
          path='userReports/:id'
          element={<Reports />}
          loader={userReportsLoader}
          action={reportsAction}
          errorElement={<ErrorPage />}
        />
        <Route path='event' errorElement={<ErrorPage />}>
          <Route
            path=':id'
            element={<Event />}
            loader={eventLoader}
            action={eventAction}
            errorElement={<ErrorPage />}
          >
            <Route
              path='images/:imageId'
              element={<Image />}
              action={imageAction}
              loader={eventLoader}
              errorElement={<ErrorPage />}
            />
          </Route>
          <Route
            path=':id/reports'
            element={<Reports />}
            loader={eventReportsLoader}
            action={reportsAction}
            errorElement={<ErrorPage />}
          />
        </Route>
        <Route
          path='club'
          element={<Club />}
          loader={clubLoader}
          errorElement={<ErrorPage />}
        />
        <Route path='club'>
          <Route
            path=':id'
            element={<Club />}
            loader={clubLoader}
            action={clubAction}
            errorElement={<ErrorPage />}
          >
            <Route
              path='images/:imageId'
              element={<Image />}
              action={imageAction}
              loader={clubLoader}
              errorElement={<ErrorPage />}
            />
          </Route>
          <Route
            path=':id/edit'
            element={<ClubForm />}
            loader={clubFormLoader}
            action={clubFormAction}
            errorElement={<ErrorPage />}
          />
          <Route
            path=':id/delete'
            loader={deleteClubLoader}
            errorElement={<ErrorPage />}
          />
          <Route
            path=':id/newEvent'
            loader={clubEventFormLoader}
            element={<ClubEventForm />}
            action={clubEventFormAction}
            errorElement={<ErrorPage />}
          />

          <Route
            path=':id/reports'
            element={<Reports />}
            loader={clubReportsLoader}
            action={reportsAction}
            errorElement={<ErrorPage />}
          />

          <Route
            path='new'
            element={<ClubForm />}
            action={clubFormAction}
            loader={clubFormLoader}
            errorElement={<ErrorPage />}
          />
        </Route>

        <Route path='faculty' element={<Faculty />} loader={facultyLoader}>
          <Route
            path='reports'
            element={<Reports />}
            loader={facultyReportsLoader}
            action={reportsAction}
            errorElement={<ErrorPage />}
          />
          <Route
            path='facultyEventApproval'
            element={<FacultyEventApproval />}
            loader={facultyEventApprovalloader}
            action={facultyEventApprovalAction}
            errorElement={<ErrorPage />}
          />
          <Route
            path='schoolEdit'
            element={<SchoolEdit />}
            loader={schoolEditloader}
            action={schoolEditaction}
            errorElement={<ErrorPage />}
          />
          <Route
            path='assignFaculty'
            element={<AssignFaculty />}
            loader={assignFacultyLoader}
            action={assignFacultyAction}
            errorElement={<ErrorPage />}
          />
          <Route
            path='adminUserForm'
            element={<AdminUserForm />}
            loader={adminUserFormLoader}
            action={adminUserFormAction}
            errorElement={<ErrorPage />}
          />
          <Route
            path='commentModeration'
            element={<CommentModeration />}
            loader={commentModerationLoader}
            action={commentModerationAction}
            errorElement={<ErrorPage />}
          />
        </Route>

        <Route
          path='emailPreferences'
          loader={emailPreferencesLoader}
          action={emailPreferencesAction}
          element={<EmailPreferences />}
          errorElement={<ErrorPage />}
        />
        <Route
          path={'accountInfo'} // '/account-info' (or whatever the path is)
          element={<AccountInfo />} // This is the AccountInfo component to render
          loader={accountInfoLoader} // Loader function to fetch user data
          action={accountInfoAction} // Action function to handle form submission or other actions (optional)
          errorElement={<ErrorPage />}
        />
      </Route>
      <Route
        path='editinterest'
        element={<EditInterest />}
        action={EditInterestsAction}
        loader={EditInterestLoader}
        errorElement={<ErrorPage />}
      />
      <Route
        path='/club/:clubId/sendEmail'
        element={<SendEmailForm />}
        loader={SendEmailLoader}
        action={sendEmailAction}
        errorElement={<ErrorPage />}
      />
      <Route
        path='aboutus'
        element={<AboutUs />}
        errorElement={<ErrorPage />}
      />
      <Route
        path='contactus'
        element={<ContactUs />}
        errorElement={<ErrorPage />}
      />{' '}
      {/* <Route
        path='/addSchool'
        element={<AddSchoolPage />}
        action={addSchoolsAction}
        errorElement={<ErrorPage />}
      /> */}
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
