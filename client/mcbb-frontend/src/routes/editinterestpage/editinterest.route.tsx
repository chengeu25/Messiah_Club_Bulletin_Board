import React, { useEffect, useState } from 'react';

const EditInterests: React.FC = () => {
  const [allInterests, setAllInterests] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch all available interests
    fetch(
      `${
        import.meta.env.VITE_API_BASE_URL
      }/api/interests/get-available-interest-names`,
      {
        credentials: 'include'
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.interests) {
          setAllInterests(data.interests);
        }
      })
      .catch((error) => console.error('Error fetching all interests:', error));

    // Fetch the user's current selected interests
    fetch(
      `${
        import.meta.env.VITE_API_BASE_URL
      }/api/interests/get-current-user-interests`,
      {
        credentials: 'include'
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.interests) {
          setSelectedInterests(data.interests);
        }
      })
      .catch((error) =>
        console.error('Error fetching selected interests:', error)
      );
  }, []);

  const handleCheckboxChange = (interest: string) => {
    setSelectedInterests(
      (prev) =>
        prev.includes(interest)
          ? prev.filter((i) => i !== interest) // Remove interest
          : [...prev, interest] // Add interest
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/interests/edit-interests`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ interests: selectedInterests })
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert(result.message);
      } else {
        setError(result.error || 'An error occurred');
      }
    } catch (error) {
      console.error('Error submitting interests:', error);
      setError('An error occurred');
    }
  };

  const handleRedirect = () => {
    window.location.href = '/dashboard/addeditinterestpage';
  };

  return (
    <div className='w-full h-full flex justify-center items-center bg-gray-100'>
      <div className='flex w-full h-full sm:w-3/4 sm:h-3/4 justify-center items-center shadow-md rounded-lg p-5 bg-white'>
        <form
          onSubmit={handleSubmit}
          className='flex flex-col gap-2 w-full h-full'
        >
          <h1 className='text-3xl font-bold'>Edit Interests</h1>
          {error && <p className='text-red-500'>{error}</p>}
          <div
            className='flex flex-col gap-2 overflow-y-auto'
            style={{ maxHeight: '200px' }}
          >
            {allInterests.map((interest) => (
              <label
                key={interest}
                style={{ display: 'block', margin: '10px 0' }}
              >
                <input
                  type='checkbox'
                  checked={selectedInterests.includes(interest)}
                  onChange={() => handleCheckboxChange(interest)}
                  className='mr-2'
                />
                {interest}
              </label>
            ))}
          </div>
          <button
            className='bg-blue-950 text-white py-2 px-4 rounded hover:bg-blue-900'
            type='submit'
          >
            Save Changes
          </button>
          <button
            className='bg-blue-950 text-white py-2 px-4 rounded hover:bg-blue-900'
            type='button'
            onClick={handleRedirect}
          >
            Go to Add Interest Page
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditInterests;
