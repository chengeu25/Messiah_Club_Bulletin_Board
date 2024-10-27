import React, { useState } from 'react';
import { Form, useSubmit } from 'react-router-dom';
import Button from '../../components/formElements/Button.component';

const EditInterest = () => {
  // Array of interests
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

  // State to manage checked interests
  const [checkedInterests, setCheckedInterests] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const submit = useSubmit();

  // Handle checkbox change
  const handleCheckboxChange = (interest: string) => {
    setCheckedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest) // Uncheck if already checked
        : [...prev, interest] // Check if not already checked
    );
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (checkedInterests.length === 0) {
      setError('Please select at least one interest.');
    } else {
      setError(null);
      const formData = new FormData(event.currentTarget);
      checkedInterests.forEach((interest) => {
        formData.append('interests[]', interest);
      });
      // Submit the form data
      submit(formData, { method: 'post' });
    }
  };

  return (
    <div className='w-full h-full flex justify-center items-center bg-gray-100'>
      <div className='flex w-full h-full sm:w-1/2 sm:h-1/2 justify-center items-center shadow-md rounded-lg p-5 bg-white'>
        <Form onSubmit={handleSubmit} className='flex flex-col gap-2 w-full h-full'>
          <h1 className='text-3xl font-bold'>Edit Interests</h1>
          {error && <p className='text-red-500'>{error}</p>}
          <div className='flex flex-col gap-2 overflow-y-auto' style={{ maxHeight: '200px' }}>
            {interests.map((interest) => (
              <label
                key={interest}
                style={{ display: 'block', margin: '10px 0' }} // Spacing for each label
              >
                <input
                  type="checkbox"
                  checked={checkedInterests.includes(interest)}
                  onChange={() => handleCheckboxChange(interest)}
                  className='mr-2' // Margin for checkbox
                />
                {interest}
              </label>
            ))}
          </div>
          <Button color='blue' text='Save Changes' type='submit' />
        </Form>
      </div>
    </div>
  );
};

export default EditInterest;