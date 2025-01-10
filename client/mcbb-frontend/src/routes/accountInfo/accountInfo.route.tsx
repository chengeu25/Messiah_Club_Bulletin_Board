import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * AccountInfo component for viewing and editing user account details.
 *
 * @component AccountInfo
 * @description Allows users to view and edit their account details (e.g., name, email, etc.)
 *
 * @returns {JSX.Element} Fully rendered account info editing form
 *
 * @workflow
 * 1. Fetch current account info (user data)
 * 2. Render form to edit account information
 * 3. Handle form submission to save updates
 *
 * @features
 * - Dynamic data fetching for current user info
 * - Form-based data submission
 * - Error handling for account updates
 */
const AccountInfo: React.FC = () => {
  // Explicitly define the type for updatedInfo
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [updatedInfo, setUpdatedInfo] = useState<{ name: string; email: string }>({ name: '', email: '' });
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  /**
   * Fetch current account information on component mount.
   *
   * @function useEffect
   * @description Retrieves the user's current account information
   */
  useEffect(() => {
    console.log('API URL:', import.meta.env.VITE_API_BASE_URL); // Debugging line

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/account-info`, {
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        setAccountInfo(data);
        setUpdatedInfo({ name: data.name || '', email: data.email || '' }); // Pre-fill the form
      })
      .catch((error) => {
        console.error('Error fetching account info:', error);
        setError('Failed to fetch account info');
      });
  }, []); // Empty dependency array ensures the effect runs once when the component mounts

  /**
   * Handles form input change.
   *
   * @function handleChange
   * @param {React.ChangeEvent<HTMLInputElement>} event - Input change event
   * @description Updates form fields as user types
   */
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setUpdatedInfo((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Submits the updated account information.
   *
   * @function handleSubmit
   * @param {React.FormEvent} event - Form submission event
   * @description Sends the updated account information to the backend
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/user/update-account-info`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(updatedInfo),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert('Account information updated successfully');
        navigate('/dashboard/home'); // Redirect to home after successful update
      } else {
        setError(result.error || 'An error occurred');
      }
    } catch (error) {
      console.error('Error submitting account info:', error);
      setError('An error occurred');
    }
  };

  return (
    <div className="w-full h-full flex justify-center items-center bg-gray-100">
      <div className="flex flex-col w-full h-full sm:w-3/4 sm:h-3/4 justify-between items-center shadow-md rounded-lg p-5 bg-white">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 w-full h-full"
        >
          <h1 className="text-3xl font-bold">Edit Account Information</h1>
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex flex-col gap-4">
            <label>
              Name:
              <input
                type="text"
                name="name"
                value={updatedInfo.name || ''} // Ensure value is properly handled
                onChange={handleChange}
                className="w-full p-2 border"
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                name="email"
                value={updatedInfo.email || ''} // Ensure value is properly handled
                onChange={handleChange}
                className="w-full p-2 border"
              />
            </label>
          </div>
          <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg" type="submit">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccountInfo;



