import React, { useEffect, useState } from 'react';
import { useActionData, useSubmit } from 'react-router-dom';
import Input from '../../components/formElements/Input.component';
import Button from '../../components/formElements/Button.component';
import ResponsiveForm from '../../components/formElements/ResponsiveForm';
import useLoading from '../../hooks/useLoading';
import Loading from '../../components/ui/Loading';
import { useNotification } from '../../contexts/NotificationContext';

/**
 * ForgotPassword component for initiating password reset process.
 *
 * @component ForgotPassword
 * @description Provides a form for users to request a password reset
 *
 * @returns {JSX.Element} Rendered password reset request form
 *
 * @workflow
 * 1. Render email input form
 * 2. Handle form submission
 * 3. Validate email input
 * 4. Send password reset request
 * 5. Display error or success messages
 *
 * @features
 * - Email validation
 * - Error and message handling
 * - Responsive form design
 * - Dynamic error/message display
 */
const ForgotPassword = () => {
  // Form submission and routing hooks
  const submit = useSubmit();

  // State for managing errors and messages
  const [error, setError] = useState<string | null>(null);

  const actionData = useActionData() as {
    error?: string;
    message?: string;
  };

  const { addNotification } = useNotification();

  const { loading, setLoading } = useLoading();

  useEffect(() => {
    if (actionData) {
      setLoading(false);
      if (actionData?.message) addNotification(actionData?.message, 'success');
      else if (actionData?.error) {
        addNotification(actionData?.error, 'error');
      }
    }
  }, [actionData]);

  /**
   * Handles form submission for password reset request.
   *
   * @function handleSubmit
   * @param {React.FormEvent<HTMLFormElement>} event - Form submission event
   * @description Validates email and submits password reset request
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // Reset previous errors
    setError(null);
    event.preventDefault();
    setLoading(true);

    // Create form data
    const formData = new FormData(event.currentTarget);
    const action = (
      (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
    ).name;

    // Validate email input
    if (formData.get('email') === '') {
      setError('Please enter an email address.');
      setLoading(false);
    } else {
      // Submit form data
      formData.append('action', action);
      submit(formData, { method: 'post' });
    }
  };

  return loading ? (
    <Loading />
  ) : (
    <ResponsiveForm onSubmit={handleSubmit}>
      <h1 className='text-3xl font-bold'>Forgot Password?</h1>

      {/* Error message display */}
      {error && <div className='text-red-500'>{error}</div>}

      {/* Email input */}
      <Input
        label='Enter your school email:'
        name='email'
        type='text'
        placeholder='Messiah Email'
        filled={false}
      />

      {/* Submit button */}
      <div className='flex flex-row gap-2'>
        <Button
          text='Send Reset Link'
          type='submit'
          name='sendTemporaryPassword'
        />
      </div>
    </ResponsiveForm>
  );
};

export default ForgotPassword;
