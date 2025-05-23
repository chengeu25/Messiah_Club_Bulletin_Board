import { Navigate, useParams, Outlet, useSearchParams } from 'react-router-dom';
import { useSchool } from '../../contexts/SchoolContext';

const LoginRedirector = () => {
  const { schoolId } = useParams();
  const [searchParams] = useSearchParams();
  const { currentSchool } = useSchool();

  // If a schoolId is already in the URL, render the login page
  if (schoolId) {
    return <Outlet />;
  }

  // If no schoolId in URL, but currentSchool exists, redirect to that school's login
  if (currentSchool) {
    return (
      <Navigate
        to={`/login/${currentSchool.id}/?serviceTo=${searchParams.get(
          'serviceTo'
        )}`}
        replace
      />
    );
  }

  // If no schoolId and no currentSchool, redirect to school selection
  return (
    <Navigate
      to={`/selectSchool/?serviceTo=${searchParams.get('serviceTo') || ''}`}
      replace
    />
  );
};

export default LoginRedirector;
