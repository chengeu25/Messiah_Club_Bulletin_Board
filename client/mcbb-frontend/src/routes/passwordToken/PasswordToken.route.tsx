import React, { useEffect, useState } from 'react';
import {
  useSubmit,
  useLocation,
  useNavigate,
  useActionData
} from 'react-router-dom';
import Input from '../../components/formElements/Input.component';
import Button from '../../components/formElements/Button.component';
import ResponsiveForm from '../../components/formElements/ResponsiveForm';
import useLoading from '../../hooks/useLoading';
import Loading from '../../components/ui/Loading';
import { useNotification } from '../../contexts/NotificationContext';
import passwordStrongOrNah from '../../helper/passwordstrength';

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
  const location = useLocation();
  const navigate = useNavigate();
  const { loading, setLoading } = useLoading();
  const actionData = useActionData() as {
    error?: string;
    message?: string;
    redirectTo?: string;
  };
  const { addNotification } = useNotification();

  // State management for form validation and messages
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (actionData?.error) {
      setError(actionData.error);
    }
    if (actionData?.message) {
      addNotification(actionData.message, 'success');
    }
    if (actionData?.redirectTo) {
      navigate(actionData.redirectTo);
    }
  }, [actionData]);

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
    setLoading(true);
    event.preventDefault();

    // Create form data
    const formData = new FormData(event.currentTarget);
    const action = (
      (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
    ).name;

    // Create search params from location
    const searchParams = new URLSearchParams(location.search);

    // Validate password inputs
    if (String(formData.get('newPassword')) === '') {
      setError('Please enter a new password');
      setLoading(false);
    } else if (String(formData.get('confirmPassword')) === '') {
      setError('Please enter password again');
      setLoading(false);
    } else if (
      String(formData.get('newPassword')) !==
      String(formData.get('confirmPassword'))
    ) {
      setError('Passwords do not match');
      setLoading(false);
    } else if (!passwordStrongOrNah(String(formData.get('newPassword')))) {
      setError(
        'Password must be at least 8 characters in length and include at least one capital letter, one lowercase letter, one number, and one special character (!@#$%^&*)'
      );
      setLoading(false);
    } else {
      // Append token and submit form
      formData.append('action', action);
      formData.append('token', searchParams.get('token') as string);
      formData.append('schoolId', searchParams.get('schoolId') as string);
      submit(formData, { method: 'post' });
    }
  };

  return loading ? (
    <Loading />
  ) : (
    <ResponsiveForm onSubmit={handleSubmit}>
      <h1 className='text-3xl font-bold'>Reset Password</h1>

      {/* Error message display */}
      {error && <div className='text-red-500'>{error}</div>}

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
