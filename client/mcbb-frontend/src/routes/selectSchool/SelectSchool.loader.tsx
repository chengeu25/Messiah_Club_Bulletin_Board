import { LoaderFunction, json } from 'react-router-dom';

const selectSchoolLoader: LoaderFunction = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/school/all`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch schools');
    }

    const schools = await response.json();
    return json(schools, { status: 200 });
  } catch (error) {
    console.error('Error in selectSchoolLoader:', error);
    return json({ error: 'Unable to load schools' }, { status: 500 });
  }
};

export default selectSchoolLoader;
