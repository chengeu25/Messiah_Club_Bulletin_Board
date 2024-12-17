import React, { useEffect, useState } from 'react';
import { useSearchParams, useSubmit } from 'react-router-dom';
import Input from '../../components/formElements/Input.component';
import Button from '../../components/formElements/Button.component';
import ResponsiveForm from '../../components/formElements/ResponsiveForm';

/**
 * VerifyEmail component for email verification process.
 *
 * @component VerifyEmail
 * @description Provides an interface for users to verify their email
 * using a 2-factor authentication code
 *
 * @returns {JSX.Element} Rendered email verification form
 *
 * @workflow
 * 1. Render email verification form
 * 2. Handle code input
 * 3. Submit verification or resend code request
 * 4. Handle form submission errors
 *
 * @features
 * - 2-Factor Authentication code input
 * - Code resend functionality
 * - Error and success message handling
 * - Responsive form design
 */
const VerifyEmail = () => {
  // Form submission hook
  const submit = useSubmit();
  const [params] = useSearchParams();

  // State management for error and success messages
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  /**
   * Side effect to handle URL parameters for error and success messages
   *
   * @effect
   * @description Parses and sets error or success messages from URL parameters
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
   * Handles form submission for email verification
   *
   * @function handleSubmit
   * @param {React.FormEvent<HTMLFormElement>} event - Form submission event
   * @description Validates and submits email verification or code resend request
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

    // Handle resend code action
    if (action === 'resendCode') {
      formData.append('action', action);
      submit(formData, { method: 'post' });
    }
    // Validate email verification code
    else if (action === 'verifyEmail' && formData.get('code') === '') {
      setError('Please enter a code.');
    }
    // Submit verification request
    else {
      formData.append('action', action);
      submit(formData, { method: 'post' });
    }
  };

  return (
    <ResponsiveForm onSubmit={handleSubmit}>
      <h1 className='text-3xl font-bold'>2-Factor Authentication</h1>

      {/* Error and success messages */}
      {error && <div className='text-red-500'>{error}</div>}
      {message && <p className='text-green-500'>{message}</p>}

      {/* Email verification code input */}
      <Input
        label='Enter the code sent to your email:'
        name='code'
        type='text'
        placeholder='XXXXXX'
        filled={false}
      />

      {/* Action buttons */}
      <div className='flex flex-row gap-2'>
        <Button text='Authenticate' type='submit' name='verifyEmail' />
        <Button
          text='Resend Code'
          type='submit'
          name='resendCode'
          filled={false}
        />
      </div>
    </ResponsiveForm>
  );
};

export default VerifyEmail;
