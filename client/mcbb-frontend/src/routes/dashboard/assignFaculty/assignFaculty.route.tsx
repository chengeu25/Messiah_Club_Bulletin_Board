import React, { useEffect, useState } from 'react';
import { Form, useLocation } from 'react-router-dom';
import Input from '../../../components/formElements/Input.component';
import Button from '../../../components/formElements/Button.component';
import checkUser from '../../../helper/checkUser';
import { UserType as User } from '../../../types/databaseTypes';

/**
 * Represents a faculty member's data structure.
 *
 * @typedef {Object} FacultyData
 * @property {string} name - Name of the faculty member
 * @property {string} email - Email address of the faculty member
 * @property {boolean} can_delete_faculty - Permission to delete faculty
 */
type FacultyData = {
  name: string;
  email: string;
  can_delete_faculty: boolean;
};

/**
 * AssignFaculty dashboard component for managing faculty assignments.
 *
 * @component
 * @description Provides functionality to:
 * - Assign new faculty members
 * - Manage faculty deletion permissions
 * - Remove faculty members
 *
 * @returns {React.ReactElement} Rendered faculty assignment dashboard
 */
const AssignFaculty = () => {
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [canDelete, setCanDelete] = useState<boolean>(false);
  const [tableData, setTableData] = useState<FacultyData[]>([]);
  const [emailList, setEmailList] = useState<string[]>([]);

  /**
   * Fetches faculty data from the server on component mount.
   *
   * @function
   * @description Retrieves faculty information and populates table and email list
   *
   * @throws {Error} Throws an error if data fetching fails
   */
  useEffect(() => {
    setError(null);
    setMessage(null);
    // Fetch data from the API
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/api/admintools/get-faculty-data`,
          {
            method: 'GET',
            credentials: 'include'
          }
        );
        if (!response.ok) {
          throw new Error('failed to fetch data');
        }
        const data = await response.json();
        const emails = data.map((faculty: { email: string }) => faculty.email);
        setEmailList(emails);
        setTableData(data); // Update state with fetched data
      } catch (error) {
        setError('Error fetching data from the server');
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures it runs only once when the component mounts

  /**
   * Handles URL-based error and success messages.
   *
   * @function
   * @description Updates error and success messages from URL parameters
   */
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const newError = searchParams.get('error');
    const newMessage = searchParams.get('message');

    if (newError || newMessage) {
      if (newError) {
        setError(decodeURIComponent(newError));
        searchParams.delete('error');
      }

      if (newMessage) {
        setMessage(decodeURIComponent(newMessage));
        searchParams.delete('message');
      }

      // Update URL without triggering a page reload
      const newUrl = searchParams.toString()
        ? `${location.pathname}?${searchParams.toString()}`
        : location.pathname;

      window.history.replaceState({}, document.title, newUrl);
    }
  }, [location.search]);

  /**
   * Checks user's permission to delete faculty.
   *
   * @function
   * @description Verifies if the current user can delete faculty members
   */
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await checkUser();
        if ((user as User).canDeleteFaculty) {
          setCanDelete(true);
        }
      } catch (error) {
        console.error('Error checking user:', error);
      }
    };

    fetchUserData();
  }, []);

  /**
   * Handles faculty assignment form submission.
   *
   * @function handleSubmit
   * @param {React.FormEvent<HTMLFormElement>} event - Form submission event
   *
   * @description Validates and submits new faculty member assignment
   * - Validates email uniqueness
   * - Sends assignment request to server
   * - Updates table and email list dynamically
   *
   * @throws {Error} Throws an error if assignment fails
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent page reload.
    setError(null); // Reset error messages.
    setMessage(null); // Reset success messages.

    const formData = new FormData(event.currentTarget);
    const email = formData.get('userEmail')?.toString() || '';
    const action = (
      (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
    ).name;

    // Check if an email was entered
    if (!email) {
      setError('Please enter an email');
      return;
    }

    // Check if the email already exists in the emailList
    if (emailList.includes(email)) {
      setError('This email is already assigned as faculty.');
      return;
    }

    try {
      // Prepare payload
      const payload = {
        email,
        can_delete_faculty: canDelete,
        action
      };

      // Submit the data
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admintools/assign-faculty`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to assign faculty');
      }

      const result = await response.json();

      // Update the table with the new faculty entry dynamically
      setTableData((prev) => [
        ...prev,
        {
          name: result.name,
          email: result.email,
          can_delete_faculty: result.can_delete_faculty
        }
      ]);

      // Update the email list dynamically
      setEmailList((prev) => [...prev, payload.email]);

      // Show success message
      setMessage('Faculty member successfully assigned!');
      (event.target as HTMLFormElement).reset(); // Clear the form fields.
    } catch (error) {
      console.error('Error during submission:', error);
      setError('Failed to assign faculty. Please try again.');
    }
  };

  /**
   * Toggles faculty member's ability to delete other faculty.
   *
   * @function assignDelete
   * @param {FacultyData} item - Faculty member to modify
   *
   * @description Sends request to update faculty deletion permissions
   * - Toggles can_delete_faculty status
   * - Updates table data dynamically
   *
   * @throws {Error} Throws an error if permission update fails
   */
  const assignDelete = async (item: FacultyData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admintools/assign-delete`,
        {
          method: 'POST',
          body: JSON.stringify({
            cdf: !item.can_delete_faculty,
            email: item.email
          }),
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        }
      );

      if (!response.ok) throw new Error('Failed to assign deletion abilities');

      // Update the tableData state with the modified "isActive" value
      setTableData((prev) =>
        prev.map((row) =>
          row.email === item.email
            ? { ...row, can_delete_faculty: !row.can_delete_faculty }
            : row
        )
      );
    } catch (error) {
      console.error(error);
      setError('Failed to assign deletion abilities. Please try again.');
    }
  };

  /**
   * Removes a faculty member from the system.
   *
   * @function deleteFaculty
   * @param {FacultyData} item - Faculty member to remove
   *
   * @description Sends request to remove a faculty member
   * - Deletes faculty from the system
   * - Updates table and email list dynamically
   *
   * @throws {Error} Throws an error if faculty removal fails
   */
  const deleteFaculty = async (item: FacultyData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admintools/remove-faculty`,
        {
          method: 'POST',
          body: JSON.stringify({ email: item.email }),
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        }
      );

      if (!response.ok) throw new Error('Failed to remove admin');

      // Remove the entry from the table
      setTableData((prev) => prev.filter((row) => row.email !== item.email));
      // Remove the email from emailList
      setEmailList((prev) => prev.filter((email) => email !== item.email));
    } catch (error) {
      console.error(error);
      setError('Failed to remove faculty. Please try again.');
    }
  };

  return (
    <div className='w-full h-full flex justify-center items-center'>
      <div className='flex w-full h-full sm:w-3/4 sm:h-auto sm:min-h-[50%] justify-center items-start shadow-md rounded-lg p-5 bg-white'>
        <Form onSubmit={handleSubmit} className='flex flex-col gap-2 w-full'>
          <h1 className='text-3xl font-bold'>Assign Faculty Users</h1>
          {error && <div className='text-red-500'>{error}</div>}
          {message && <p className='text-green-500'>{message}</p>}
          <Input
            label='Enter user email:'
            name='userEmail'
            type='text'
            placeholder='Email'
            filled={false}
          />
          <Input
            label='Can delete other faculty accounts'
            name='cdf'
            type='checkbox'
            value='false'
            checked={canDelete}
            onChange={() => setCanDelete(!canDelete)}
          />
          <div className='flex flex-row gap-2'>
            <Button text='Assign Faculty' type='submit' name='assignFaculty' />
          </div>
          <table className='custom-table'>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Can Delete Faculty</th>
              </tr>
            </thead>
            <tbody>
              {tableData.length > 0 ? (
                tableData.map((item, index) => (
                  <tr key={index}>
                    <td style={{ textAlign: 'center' }}>{item.name}</td>
                    <td style={{ textAlign: 'center' }}>{item.email}</td>

                    <td style={{ textAlign: 'center' }}>
                      <input
                        type='checkbox'
                        checked={item.can_delete_faculty || false} // Replace with your field
                        onChange={(e) => {
                          e.preventDefault();
                          assignDelete(item); // Handle the toggle
                        }}
                        aria-label={`Set ${item.name} as active`}
                        style={{
                          cursor: item.can_delete_faculty
                            ? 'pointer'
                            : 'not-allowed'
                        }}
                        disabled={!item.can_delete_faculty}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={(event) => {
                          event.preventDefault(); // Prevent the form submission
                          deleteFaculty(item); // Call the deleteFaculty function
                        }}
                        aria-label={`Remove ${item.name} from faculty`}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: item.can_delete_faculty
                            ? 'var(--foreground-rgb)'
                            : 'var(--foreground-disabled-rgb)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: item.can_delete_faculty
                            ? 'pointer'
                            : 'not-allowed'
                        }}
                        disabled={!item.can_delete_faculty}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className='no-data'>
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Form>
      </div>
    </div>
  );
};

export default AssignFaculty;
