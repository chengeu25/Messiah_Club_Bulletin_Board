import React, { useEffect, useState } from 'react';
import { Form, useSearchParams } from 'react-router-dom';
import Input from '../../../components/formElements/Input.component';
import Button from '../../../components/formElements/Button.component';
import checkUser from '../../../helper/checkUser';
import { UserType as User } from '../../../types/databaseTypes';

const AssignFaculty = () => {
  const [params] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [canDelete, setCanDelete] = useState<boolean>(false);
  const [tableData, setTableData] = useState<
    { name: string; email: string; can_delete_faculty: boolean }[]
  >([]);
  const [emailList, setEmailList] = useState<string[]>([]);

  useEffect(() => {
    setError(null);
    setMessage(null);
    // Fetch data from the API
    const fetchData = async () => {
      try {
        const response = await fetch(
          'http://localhost:3000/api/admintools/get-faculty-data',
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

  useEffect(() => {
    if (params.get('error')) {
      setError(decodeURIComponent(params.get('error') ?? ''));
    }
    if (params.get('message')) {
      setMessage(decodeURIComponent(params.get('message') ?? ''));
    }
  }, [params]);

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
        'http://localhost:3000/api/admintools/assign-faculty',
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

  const assignDelete = async (item: {
    name: string;
    email: string;
    can_delete_faculty: boolean;
  }) => {
    try {
      const response = await fetch(
        'http://localhost:3000/api/admintools/assign-delete',
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

  const deleteFaculty = async (item: {
    name: string;
    email: string;
    can_delete_faculty: boolean;
  }) => {
    try {
      const response = await fetch(
        'http://localhost:3000/api/admintools/remove-faculty',
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
      setError('Failed to remove admin. Please try again.');
    }
  };

  const tableStyles: React.CSSProperties = {
    textAlign: 'center'
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
            color='blue'
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
            <Button
              text='Assign Faculty'
              type='submit'
              name='assignFaculty'
              color='blue'
            />
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
                    <td style={tableStyles}>{item.name}</td>
                    <td style={tableStyles}>{item.email}</td>

                    <td style={tableStyles}>
                      <input
                        type='checkbox'
                        checked={item.can_delete_faculty || false} // Replace with your field
                        onChange={(e) => {
                          e.preventDefault();
                          assignDelete(item); // Handle the toggle
                        }}
                        aria-label={`Set ${item.name} as active`}
                        disabled={!canDelete}
                      />
                    </td>
                    <td style={tableStyles}>
                      <button
                        onClick={(event) => {
                          event.preventDefault(); // Prevent the form submission
                          deleteFaculty(item); // Call the deleteFaculty function
                        }}
                        aria-label={`Remove ${item.name} from faculty`}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: canDelete ? 'blue' : 'gray',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: canDelete ? 'pointer' : 'not-allowed'
                        }}
                        disabled={!canDelete}
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
