import { useState } from 'react';
import {
  useLoaderData,
  useSearchParams,
  Form,
  useNavigation
} from 'react-router-dom';
import Button from '../../components/formElements/Button.component';
import { SchoolType } from '../../types/databaseTypes';
import { useSchool } from '../../contexts/SchoolContext';
import Loading from '../../components/ui/Loading';

const SelectSchool = () => {
  const schools = useLoaderData() as SchoolType[];
  const [searchParams] = useSearchParams();
  const { setCurrentSchool } = useSchool();
  const navigation = useNavigation();
  const [selectedSchool, setSelectedSchool] = useState<SchoolType | null>(null);
  const routeType = searchParams.get('route') || 'login';

  const handleSchoolSelect = (school: SchoolType) => {
    setSelectedSchool(school);
    setCurrentSchool(school);
  };

  if (navigation.state === 'loading') {
    return <Loading />;
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-[100dvh] bg-gray-100 p-4'>
      <div className='w-full max-w-md bg-white rounded-lg shadow-md p-6'>
        <h1 className='text-2xl font-bold mb-4 text-center'>
          Select Your School
        </h1>
        <div className='space-y-4'>
          {schools.map((school) => (
            <div key={school.id} onClick={() => handleSchoolSelect(school)}>
              <Form method='post'>
                <input type='hidden' name='route' value={routeType} />
                <input
                  type='hidden'
                  name='schoolId'
                  value={school.id.toString()}
                />
                <Button
                  type='submit'
                  text={school.name}
                  className={`w-full ${
                    selectedSchool?.id === school.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                  filled={selectedSchool?.id === school.id}
                />
              </Form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectSchool;
