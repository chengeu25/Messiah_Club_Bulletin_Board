import React, { useState } from 'react';
import Input from '../../../components/formElements/Input.component';
import Button from '../../../components/formElements/Button.component';
import ResponsiveForm from '../../../components/formElements/ResponsiveForm';
import useLoading from '../../../hooks/useLoading';
import Loading from '../../../components/ui/Loading';
import { useNotification } from '../../../contexts/NotificationContext';

/**
 * AddedInterest component for managing user interests.
 *
 * @component
 * @description Provides functionality to:
 * - Add new interests/tags
 * - Remove existing interests/tags
 * - Display success and error messages
 *
 * @returns {React.ReactElement} Rendered interest management form
 */
const AddedInterest = () => {
  /** State to track the current interest name */
  const [interestName, setInterestName] = useState('');

  const { loading, setLoading } = useLoading();

  const { addNotification } = useNotification();

  /**
   * Handles adding a new interest/tag.
   *
   * @function handleSubmit
   * @param {React.FormEvent<HTMLFormElement>} event - Form submission event
   *
   * @description Validates and submits a new interest to the server
   * - Validates interest name
   * - Sends POST request to add tag
   * - Manages success and error states
   *
   * @throws {Error} Handles network and server errors
   */
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    setLoading(true);

    if (!interestName.trim()) {
      setLoading(false);
      addNotification('Interest name is required.', 'error');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/interests/add-tag`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include',
          mode: 'cors',
          body: JSON.stringify({ tag_name: interestName })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setLoading(false);
        addNotification(
          result.error || 'An unexpected error occurred.',
          'error'
        );
      } else {
        setLoading(false);
        addNotification(result.message, 'success');
        setInterestName('');
      }
    } catch (err) {
      setLoading(false);
      addNotification(
        'Failed to connect to the server. Please try again later.',
        'error'
      );
      console.error('Error:', err);
    }
  };

  /**
   * Handles removing an existing interest/tag.
   *
   * @function handleRemove
   *
   * @description Validates and submits a request to remove a tag
   * - Validates interest name
   * - Sends DELETE request to remove tag
   * - Manages success and error states
   *
   * @throws {Error} Handles network and server errors
   */
  const handleRemove = async (): Promise<void> => {
    setLoading(true);

    if (!interestName.trim()) {
      setLoading(false);
      addNotification('Interest name is required.', 'error');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/interests/remove-tag`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include',
          mode: 'cors',
          body: JSON.stringify({ tag_name: interestName })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setLoading(false);
        addNotification(
          result.error || 'An unexpected error occurred.',
          'error'
        );
      } else {
        setLoading(false);
        addNotification(result.message, 'success');
        setInterestName('');
      }
    } catch (err) {
      setLoading(false);
      addNotification(
        'Failed to connect to the server. Please try again later.',
        'error'
      );
      console.error('Error:', err);
    }
  };

  return loading ? (
    <Loading />
  ) : (
    <ResponsiveForm onSubmit={handleSubmit}>
      <h1 className='text-2xl font-bold text-center'>Add Interest</h1>
      <Input
        label='Interest Name:'
        name='interestName'
        type='text'
        value={interestName}
        onChange={(e) => setInterestName((e.target as HTMLInputElement).value)}
        placeholder='Enter the interest name'
        filled={false}
        required
      />
      <div className='flex flex-row gap-2 mt-4'>
        <Button text='Add' type='submit' filled name='add' />
        <Button
          text='Remove'
          filled={false}
          onClick={handleRemove}
          name='remove'
        />
      </div>
    </ResponsiveForm>
  );
};

export default AddedInterest;
