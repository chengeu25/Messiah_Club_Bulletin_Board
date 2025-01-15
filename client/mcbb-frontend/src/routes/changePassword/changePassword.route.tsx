import React, { useEffect, useState } from 'react';
import { Form, useSubmit, useSearchParams } from 'react-router-dom';
import Input from '../../components/formElements/Input.component';
import Button from '../../components/formElements/Button.component';
import passwordStrongOrNah from '../../helper/passwordstrength';
import { useSchool } from '../../contexts/SchoolContext';

/**
 * ChangePassword component for updating user account password.
 *
 * @component
 * @description Provides a form for users to change their account password with:
 * - Validation for password strength
 * - Confirmation of new password
 * - Error and success message handling
 *
 * @returns {React.ReactElement} Rendered change password form
 */
const ChangePassword = () => {
  const submit = useSubmit();
  const [params] = useSearchParams();
  const { currentSchool } = useSchool();

  /**
   * State variable to manage and display error messages during password change process.
   *
   * @type {[string | null, React.Dispatch<React.SetStateAction<string | null>>]}
   * @description Stores error messages related to form validation or submission errors.
   * Null when no error is present, string when an error occurs.
   */
  const [error, setError] = useState<string | null>(null);

  /**
   * State variable to manage and display success messages after password change.
   *
   * @type {[string | null, React.Dispatch<React.SetStateAction<string | null>>]}
   * @description Stores success messages after successful password change.
   * Null when no message is present, string when a success message is available.
   */
  const [message, setMessage] = useState<string | null>(null);

  /**
   * Handles displaying error or success messages from URL parameters.
   *
   * @function
   * @description Checks URL search parameters for error or success messages
   * and updates the component's state accordingly when the page loads or reloads
   */
  useEffect(() => {
    if (params.get('error')) {
      setError(decodeURIComponent(params.get('error') ?? ''));
    }
    if (params.get('message')) {
      setMessage(decodeURIComponent(params.get('message') ?? ''));
    }
  }, [params]);

  /**
   * Validates and submits the password change form.
   *
   * @function handleSubmit
   * @param {React.FormEvent<HTMLFormElement>} event - Form submission event
   *
   * @description Performs client-side validation before submitting:
   * - Checks all fields are filled
   * - Verifies new passwords match
   * - Validates password strength
   * - Submits form if all validations pass
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setError(null);
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const action = (
      (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
    ).name;
    if (
      formData.get('pwd') === '' ||
      formData.get('npwd') === '' ||
      formData.get('cnpwd') === ''
    ) {
      setError('Please fill out all fields.');
    } else if (formData.get('npwd') !== formData.get('cnpwd')) {
      setError('Passwords do not match.');
    } else if (!passwordStrongOrNah(formData.get('npwd') as string)) {
      setError(
        'Password must be at least 8 characters in length and include at least one capital letter, one lowercase letter, and one special character (!@#$%^&*)'
      );
    } else {
      formData.append('schoolId', currentSchool?.id?.toString() ?? '');
      formData.append('action', action);
      submit(formData, { method: 'post' });
    }
  };

  return (
    <div className='w-full h-full flex justify-center items-center bg-gray-100'>
      <div className='flex w-full h-full sm:w-1/2 sm:h-auto sm:min-h-[50%] justify-center items-start shadow-md rounded-lg p-5 bg-white'>
        <Form onSubmit={handleSubmit} className='flex flex-col gap-2 w-full'>
          <h1 className='text-3xl font-bold'>Change Password</h1>
          {error && <div className='text-red-500'>{error}</div>}
          {message && <p className='text-green-500'>{message}</p>}
          <Input
            label='Enter your current password:'
            name='pwd'
            type='password'
            placeholder='Password'
            filled={false}
          />
          <Input
            label='Enter your new password:'
            name='npwd'
            type='password'
            placeholder='Password'
            filled={false}
          />
          <Input
            label='Confirm your new password:'
            name='cnpwd'
            type='password'
            placeholder='Password'
            filled={false}
          />
          <div className='flex flex-row gap-2'>
            <Button
              text='Change Password'
              type='submit'
              name='changePassword'
            />
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ChangePassword;
