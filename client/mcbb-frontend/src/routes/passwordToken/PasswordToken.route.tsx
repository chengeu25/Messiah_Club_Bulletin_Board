import React, { useEffect, useMemo, useState } from 'react';
import { useSubmit, useSearchParams, useNavigate } from 'react-router-dom';
import Input from '../../components/formElements/Input.component';
import Button from '../../components/formElements/Button.component';
import ResponsiveForm from '../../components/formElements/ResponsiveForm';

/**
 * ForgotPasswordToken component for password reset token validation and password reset.
 *
 * @component ForgotPassswordToken
 * @description Provides a secure interface for users to reset their password using a token
 *
 * @returns {JSX.Element} Rendered password reset form with token validation
 *
 * @workflow
 * 1. Validate password reset token from URL
 * 2. Render password reset form
 * 3. Validate new password inputs
 * 4. Submit password reset request
 *
 * @features
 * - Token-based password reset
 * - Client-side password validation
 * - Error and message handling
 * - Secure password reset process
 */
const ForgotPassswordToken = () => {
  // Form submission and routing hooks
  const submit = useSubmit();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // State management for form validation and messages
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Extract and memoize password reset token
  const token = useMemo(() => params.get('token'), [params]);

  /**
   * Handles token validation and error/message display.
   *
   * @function useEffect
   * @description Validates password reset token and manages error/message states
   */
  useEffect(() => {
    if (params.get('error')) {
      setError(decodeURIComponent(params.get('error') ?? ''));
    }
    if (params.get('message')) {
      setMessage(decodeURIComponent(params.get('message') ?? ''));
    }
    if (!params.get('token')) {
      navigate('/forgotPasswordToken?error=' + params.get('error'));
    }
  }, [token, navigate, params]);

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
    if (String(formData.get('newPassword')) === '') {
      setError('Please enter a new password');
    } else if (String(formData.get('confirmPassword')) === '') {
      setError('Please enter password again');
    } else if (
      String(formData.get('newPassword')) !==
      String(formData.get('confirmPassword'))
    ) {
      setError('Passwords do not match');
    } else {
      // Append token and submit form
      formData.append('action', action);
      formData.append('token', params.get('token') as string);
      submit(formData, { method: 'post' });
    }
  };

  return (
    <ResponsiveForm onSubmit={handleSubmit}>
      <h1 className='text-3xl font-bold'>Reset Password</h1>

      {/* Error message display */}
      {error && <div className='text-red-500'>{error}</div>}

      {/* Success message display */}
      {message && <div className='text-green-500'>{message}</div>}

      {/* New password input */}
      <Input
        label='New password:'
        name='newPassword'
        type='password'
        placeholder='Password'
        filled={false}
      />

      {/* Confirm password input */}
      <Input
        label='Confirm password:'
        name='confirmPassword'
        type='password'
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

export default ForgotPassswordToken;
