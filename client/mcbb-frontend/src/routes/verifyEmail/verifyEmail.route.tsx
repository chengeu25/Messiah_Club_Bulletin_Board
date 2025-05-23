import React, { useEffect, useState } from 'react';
import {
  useActionData,
  useLoaderData,
  useSearchParams,
  useSubmit
} from 'react-router-dom';
import Input from '../../components/formElements/Input.component';
import Button from '../../components/formElements/Button.component';
import ResponsiveForm from '../../components/formElements/ResponsiveForm';
import { useNotification } from '../../contexts/NotificationContext';
import useLoading from '../../hooks/useLoading';
import Loading from '../../components/ui/Loading';

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
  const [searchParams] = useSearchParams();
  const actionData = useActionData() as {
    error: string | null;
    message: string | null;
  };

  const loaderData = useLoaderData() as {
    error?: string;
  };

  // State management for error and success messages
  const [error, setError] = useState<string | null>(null);

  const { addNotification } = useNotification();
  const { loading, setLoading } = useLoading();

  // Effect to handle form submission errors
  useEffect(() => {
    setLoading(false);
    if (actionData?.error) {
      setError(actionData.error);
    }
    if (actionData?.message) {
      addNotification(actionData.message, 'success');
    }
    if (searchParams.get('error')) {
      const localError = searchParams.get('error');
      if (localError !== null) addNotification(localError!, 'error');
    }
    if (searchParams.get('message')) {
      const message = searchParams.get('message');
      if (message !== null) addNotification(message!, 'success');
    }
  }, [actionData]);

  useEffect(() => {
    if (loaderData?.error) {
      addNotification(loaderData?.error, 'error');
    }
  }, [loaderData]);

  useEffect(() => {
    const message = sessionStorage.getItem("accountSuccessMessage");
    if (message) {
      addNotification(message, "success");
      sessionStorage.removeItem("accountSuccessMessage");
    }
  }, []);

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
    setLoading(true);

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
      setLoading(false);
      setError('Please enter a code.');
    }
    // Submit verification request
    else {
      formData.append('action', action);
      submit(formData, { method: 'post' });
    }
  };

  return loading ? (
    <Loading />
  ) : (
    <ResponsiveForm onSubmit={handleSubmit}>
      <h1 className='text-3xl font-bold'>2-Factor Authentication</h1>

      {/* Error and success messages */}
      {error && <div className='text-red-500'>{error}</div>}

      <p>
        Within a minute, you will receive a code via email. If you don't see it,
        check your spam or junk folder.
      </p>

      {/* Email verification code input */}
      <Input
        label={'6-Character Code:'}
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
