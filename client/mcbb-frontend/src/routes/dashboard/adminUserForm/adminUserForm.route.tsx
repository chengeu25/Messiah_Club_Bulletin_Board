import React, { useState, useEffect } from 'react';
import {
  useLoaderData,
  useSearchParams,
  useFetcher,
  useSubmit
} from 'react-router-dom';
import ResponsiveForm from '../../../components/formElements/ResponsiveForm';
import Input from '../../../components/formElements/Input.component';
import Button from '../../../components/formElements/Button.component';
import { UserType } from '../../../types/databaseTypes';

type LoaderData = {
  user: UserType;
  users: Array<{
    name: string;
    email: string;
    is_active: boolean;
    is_banned: boolean;
    is_faculty: boolean;
  }>;
  searchQuery: string;
  error?: string;
};

/**
 * AdminUserForm - A comprehensive user management component for faculty administrators
 *
 * @component
 * @description Provides an interface for faculty members to:
 * - Search and filter users
 * - Toggle user account status (active/banned)
 * - Update user names
 *
 * Key Features:
 * - Dynamic user table with search functionality
 * - Real-time status updates
 * - Error handling for user status modifications
 *
 * @returns {React.ReactElement} A responsive form for admin user management
 *
 * @example
 * // Used in admin dashboard to manage user accounts
 * <AdminUserForm />
 *
 * @remarks
 * - Requires faculty privileges to access
 * - Prevents modification of own user status
 * - Provides immediate visual feedback on actions
 */
export const AdminUserForm = () => {
  const { users, searchQuery, error } = useLoaderData() as LoaderData;
  const [_searchParams, setSearchParams] = useSearchParams();
  const [localSearch, setLocalSearch] = useState(searchQuery || '');
  const [tableUsers, setTableUsers] = useState(users || []);
  const toggleStatusFetcher = useFetcher();
  const submit = useSubmit();
  const [editingUser, setEditingUser] = useState<{
    email: string;
    name: string;
  } | null>(null);
  const updateNameFetcher = useFetcher();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setTableUsers(users);
  }, [users]);

  // Handle any fetcher action results
  useEffect(() => {
    if (toggleStatusFetcher.data) {
      if (toggleStatusFetcher.data.error) {
        // Set error message if there's an error
        setErrorMessage(toggleStatusFetcher.data.error);
      } else if (toggleStatusFetcher.data.email) {
        // Update local state to reflect status changes
        setTableUsers((currentUsers) =>
          currentUsers.map((user) =>
            user.email === toggleStatusFetcher.data.email
              ? {
                  ...user,
                  is_active: toggleStatusFetcher.data.is_active,
                  is_banned: toggleStatusFetcher.data.is_banned
                }
              : user
          )
        );
        // Clear any previous error messages
        setErrorMessage(null);
      }
    }
  }, [toggleStatusFetcher.data]);

  const handleToggleUserStatus = (
    email: string,
    isActive?: boolean,
    isBanned?: boolean
  ) => {
    toggleStatusFetcher.submit(
      {
        intent: 'toggle-user-status',
        email,
        is_active: isActive,
        is_banned: isBanned
      } as any,
      { method: 'POST' }
    );
  };

  const handleUpdateName = (email: string, newName: string) => {
    updateNameFetcher.submit(
      {
        intent: 'update-user-name',
        email,
        name: newName
      } as any,
      { method: 'POST' }
    );
    setEditingUser(null);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const intent = formData.get('intent')?.toString();

    if (intent === 'search') {
      // Handle search action
      const searchValue = formData.get('search')?.toString() || '';
      setSearchParams({ search: searchValue });
      return;
    }

    // For other actions (like deactivate), use standard form submission
    submit(formData, { method: 'POST' });
  };

  return (
    <ResponsiveForm onSubmit={handleSubmit}>
      <h1 className='text-3xl font-bold mb-4'>Admin User Management</h1>
      <div className='w-full h-full flex flex-col gap-4'>
        {errorMessage && (
          <div className='text-red-500 mb-4'>
            {errorMessage}
            <button
              onClick={() => setErrorMessage(null)}
              className='ml-2 text-gray-500 hover:text-gray-700'
            >
              ✕
            </button>
          </div>
        )}
        <div className='flex flex-row gap-2'>
          <Input
            label='Search Usernames'
            type='text'
            name='search'
            placeholder='Search users by username'
            labelOnSameLine={true}
            filled={false}
            value={localSearch}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setLocalSearch(e.target.value)
            }
          />
          <input type='hidden' name='intent' value='search' />
          <Button text='Search' type='submit' className='w-20' filled />
        </div>

        {error && <div className='text-red-500 mb-4'>{error}</div>}

        {tableUsers.length > 0 ? (
          <table className='w-full border-collapse'>
            <thead>
              <tr className='bg-gray-100'>
                <th className='border p-2'>Username</th>
                <th className='border p-2'>Email</th>
                <th className='border p-2'>Status</th>
                <th className='border p-2'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tableUsers.map((user) => (
                <tr key={user.email} className='hover:bg-gray-50'>
                  <td className='border p-2'>{user.name}</td>
                  <td className='border p-2'>{user.email}</td>
                  <td className='border p-2'>
                    {user.is_active ? 'Active' : 'Inactive'} |{' '}
                    {user.is_banned ? 'Banned' : 'Not Banned'}
                  </td>
                  <td className='border p-2'>
                    <div className='flex flex-col space-y-2'>
                      {editingUser?.email === user.email ? (
                        <div className='flex space-x-2'>
                          <input
                            type='text'
                            value={editingUser.name}
                            onChange={(e) =>
                              setEditingUser({
                                ...editingUser,
                                name: e.target.value
                              })
                            }
                            className='border p-1 rounded flex-grow'
                          />
                          <Button
                            text='Save'
                            onClick={() =>
                              handleUpdateName(user.email, editingUser.name)
                            }
                            filled={true}
                          />
                          <Button
                            text='Cancel'
                            onClick={() => setEditingUser(null)}
                            filled={false}
                          />
                        </div>
                      ) : (
                        <>
                          <Button
                            text='Update Name'
                            onClick={() =>
                              setEditingUser({
                                email: user.email,
                                name: user.name
                              })
                            }
                            filled={false}
                          />
                          <Button
                            text={user.is_active ? 'Deactivate' : 'Activate'}
                            onClick={() =>
                              handleToggleUserStatus(
                                user.email,
                                !user.is_active
                              )
                            }
                            filled={false}
                          />
                          <Button
                            text={user.is_banned ? 'Unban' : 'Ban'}
                            onClick={() =>
                              handleToggleUserStatus(
                                user.email,
                                user.is_active,
                                !user.is_banned
                              )
                            }
                            filled={false}
                          />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className='text-center text-gray-500'>No users found</div>
        )}
      </div>
    </ResponsiveForm>
  );
};

export default AdminUserForm;
