import React, { useEffect, useState } from 'react';
import { Form, useLoaderData, useSubmit, useNavigate } from 'react-router-dom';
import Button from '../../components/formElements/Button.component';

const EditInterest = () => {
  const interests = [
    'Sports',
    'Outdoors',
    'Music',
    'Cultural',
    'Academic',
    'Gaming',
    'Art',
    'Computer Science (Unfortunately)'
  ];
  const interest = useLoaderData();

  const [checkedInterests, setCheckedInterests] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const submit = useSubmit();
  const navigate = useNavigate(); // Hook to handle redirection

  useEffect(() => {
    setCheckedInterests((interest as { interests: string[] }).interests);
  }, [interest]);

  const handleCheckboxChange = (interest: string) => {
    setCheckedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (checkedInterests.length === 0) {
      setError('Please select at least one interest.');
    } else {
      setError(null);
      const formData = new FormData(event.currentTarget);
      formData.append('interests', JSON.stringify(checkedInterests));

      submit(formData, { method: 'post' });
    }
  };

  // Function to handle redirect to Add Interest page
  const handleRedirect = () => {
    navigate('/dashboard/addeditinterestpage'); // Redirect to the Add Interest page
  };

  return (
    <div className='w-full h-full flex justify-center items-center bg-gray-100'>
      <div className='flex w-full h-full sm:w-1/2 sm:h-1/2 justify-center items-center shadow-md rounded-lg p-5 bg-white'>
        <Form onSubmit={handleSubmit} className='flex flex-col gap-2 w-full h-full'>
          <h1 className='text-3xl font-bold'>Edit Interests</h1>
          {error && <p className='text-red-500'>{error}</p>}
          <div className='flex flex-col gap-2 overflow-y-auto' style={{ maxHeight: '200px' }}>
            {interests.map((interest) => (
              <label key={interest} style={{ display: 'block', margin: '10px 0' }}>
                <input
                  type="checkbox"
                  checked={checkedInterests.includes(interest)}
                  onChange={() => handleCheckboxChange(interest)}
                  className='mr-2'
                />
                {interest}
              </label>
            ))}
          </div>
          <Button color='blue' text='Save Changes' type='submit' />
        </Form>

        {/* Button to redirect to the Add Interest page */}
        <div className='mt-4'>
          <Button
            text="Go to Add Interest Page"
            color="blue"
            filled={true}
            onClick={handleRedirect} // Trigger redirection
          />
        </div>
      </div>
    </div>
  );
};

export default EditInterest;
