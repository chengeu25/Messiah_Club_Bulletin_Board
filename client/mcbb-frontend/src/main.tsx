import React from 'react';
import ReactDOM from 'react-dom/client';
import Root from './routes/Root.tsx';
import './index.css';
import { createRoutesFromElements, Route, RouterProvider } from 'react-router';
import { createBrowserRouter } from 'react-router-dom';
import Login from './routes/login/Login.tsx';
import rootLoader from './routes/Root.loader.tsx';
import NavigateToLogin from './routes/navigateToLogin/NavigateToLogin.tsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Root />} loader={rootLoader}>
      <Route path='/' element={<NavigateToLogin />} />
      <Route path='login' element={<Login />} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
