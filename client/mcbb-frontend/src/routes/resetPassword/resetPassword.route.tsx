import React, { useState } from 'react';
import { useSubmit } from 'react-router-dom';
import Input from '../../components/formElements/Input.component';
import Button from '../../components/formElements/Button.component';
import ResponsiveForm from '../../components/formElements/ResponsiveForm';

/**
 * ResetPassword component for changing user password.
 *
 * @component ResetPassword
 * @description Provides a secure interface for users to reset their password
 *
 * @returns {JSX.Element} Rendered password reset form
 *
 * @workflow
 * 1. Render password reset form
 * 2. Validate new password inputs
 * 3. Submit password reset request
 * 4. Handle form submission errors
 *
 * @features
 * - Client-side password validation
 * - Error handling
 * - Secure password reset process
 * - Responsive form design
 */
const ResetPassword = () => {
  // Form submission hook
  const submit = useSubmit();

  // State management for error handling
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles password reset form submission.
   *
   * @function handleSubmit
   * @param {React.FormEvent<HTMLFormElement>} event - Form submission event
   * @description Validates password inputs and submits password reset request
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // Reset previous errors
    setError(null);
    event.preventDefault();

    // Create form data
    const formData = new FormData(event.currentTarget);
    const action = (
      (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
    ).name;

    // Validate password inputs
    if (formData.get('newPassword') === '') {
      setError('Please fill out all fields');
    } else if (formData.get('confirmPassword') === '') {
      setError('Please fill out all fields');
    } else if (
      formData.get('newPassword') !== formData.get('confirmPassword')
    ) {
      setError('Passwords do not match');
    } else {
      // Append action and submit form
      formData.append('action', action);
      submit(formData, { method: 'post' });
    }
  };

  return (
    <ResponsiveForm onSubmit={handleSubmit}>
      <h1 className='text-3xl font-bold'>Forgot Password?</h1>

      {/* Error message display */}
      {error && <div className='text-red-500'>{error}</div>}

      {/* New password input */}
      <Input
        label='New password:'
        name='newPassword'
        type='text'
        placeholder='Password'
        filled={false}
      />

      {/* Confirm password input */}
      <Input
        label='Confirm password:'
        name='confirmPassword'
        type='text'
        placeholder='Password'
        filled={false}
      />

      {/* Submit button */}
      <div className='flex flex-row gap-2'>
        <Button text='Submit' type='submit' name='submitResetPassword' />
      </div>
    </ResponsiveForm>
  );
};

export default ResetPassword;
