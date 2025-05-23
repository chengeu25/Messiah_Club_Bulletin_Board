import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';

/**
 * EditInterests component for managing user interests.
 *
 * @component EditInterests
 * @description Allows users to view, select, and update their interests
 *
 * @returns {JSX.Element} Fully rendered interests editing form
 *
 * @workflow
 * 1. Fetch all available interests
 * 2. Fetch user's current interests
 * 3. Render checkboxes for interest selection
 * 4. Handle interest selection and submission
 *
 * @features
 * - Dynamic interest list fetching
 * - Checkbox-based interest selection
 * - Error handling for interest updates
 * - Redirect to add interest page
 */
const EditInterests: React.FC = () => {
  // State for managing interests
  const [allInterests, setAllInterests] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [initialInterests, setInitialInterests] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);
  const [isFaculty, setIsFaculty] = useState<boolean>(false); // Add state for user role

  /**
   * Fetch available and user's current interests on component mount.
   *
   * @function useEffect
   * @description Retrieves all interests and user's selected interests
   */
  useEffect(() => {
    // Fetch user role
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admintools/user/role`, {
      credentials: 'include'
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('User role data:', data); // Debugging log
        if (data.role) {
          setIsFaculty(data.role === 'faculty');
        }
      })
      .catch((error) => {
        console.error('Error fetching user role:', error);
        setError('Failed to fetch user role');
      });

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
          setInitialInterests(data.interests);
        }
      })
      .catch((error) =>
        console.error('Error fetching selected interests:', error)
      );

    setIsMounted(true);
  }, []);

  const message = useMemo(() => searchParams.get('message'), [searchParams]);

  useEffect(() => {
    if (message !== null && isMounted) {
      addNotification(message, 'info');
    }
  }, [message, isMounted]);

  /**
   * Toggles interest selection in the selectedInterests state.
   *
   * @function handleCheckboxChange
   * @param {string} interest - The interest to toggle
   * @description Adds or removes an interest from the selected list
   */
  const handleCheckboxChange = (interest: string) => {
    setSelectedInterests(
      (prev) =>
        prev.includes(interest)
          ? prev.filter((i) => i !== interest) // Remove interest
          : [...prev, interest] // Add interest
    );
  };

  /**
   * Submits updated interests to the backend.
   *
   * @function handleSubmit
   * @param {React.FormEvent} event - Form submission event
   * @description Sends selected interests to backend and handles response
   */
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
        addNotification('Interests updated successfully', 'success');
        navigate('/dashboard');
      } else {
        setError(result.error || 'An error occurred');
      }
    } catch (error) {
      console.error('Error submitting interests:', error);
      setError('An error occurred');
    }
  };

  /**
   * Redirects to the Add Interest page.
   *
   * @function handleRedirect
   * @description Navigates user to the page for adding new interests
   */
  const handleRedirect = () => {
    window.location.href = '/dashboard/addeditinterestpage';
  };

  return (
    <div className='w-full h-full flex justify-center items-center bg-gray-100'>
      <div className='flex flex-col w-full h-full sm:w-3/4 sm:h-3/4 justify-between items-center shadow-md rounded-lg p-5 bg-white'>
        <form
          onSubmit={handleSubmit}
          className='flex flex-col gap-4 w-full h-full'
        >
          <h1 className='text-3xl font-bold'>Edit Interests</h1>
          {error && <p className='text-red-500'>{error}</p>}
          <div
            className='flex flex-col gap-2 overflow-y-auto flex-grow'
            style={{ maxHeight: '400px' }} // Increased maxHeight for more interests
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
          <div className='flex w-full'>
            <button
              className={`foreground-filled-focusable ${
                selectedInterests === initialInterests
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              } text-white py-4 flex-1 mr-2 rounded-lg`}
              type='submit'
              disabled={selectedInterests === initialInterests}
            >
              Save Changes
            </button>
            {isFaculty && ( // Conditionally render the button
              <button
                className='foreground-filled-focusable text-white py-4 flex-1 ml-2 rounded-lg'
                type='button'
                onClick={handleRedirect}
              >
                Go to Add Interest Page
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInterests;
