import React, { useEffect, useState } from 'react';
import { Form, useSubmit, useActionData, useNavigate } from 'react-router-dom';
import Input from '../../components/formElements/Input.component';
import Button from '../../components/formElements/Button.component';
import passwordStrongOrNah from '../../helper/passwordstrength';
import { useSchool } from '../../contexts/SchoolContext';
import { useNotification } from '../../contexts/NotificationContext';
import useLoading from '../../hooks/useLoading';
import Loading from '../../components/ui/Loading';

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
  const navigate = useNavigate();
  const { currentSchool } = useSchool();
  const { addNotification } = useNotification();
  const actionData = useActionData() as {
    error?: string;
    message?: string;
    redirectTo?: string;
  };

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { loading, setLoading } = useLoading();

  // Password input state management
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordMatch, setPasswordMatch] = useState<boolean>(true);
  const [passwordReuse, setPasswordReuse] = useState<boolean>(false);
  const [isPasswordStrong, setIsPasswordStrong] = useState<boolean>(true);

  useEffect(() => {
    if (actionData) {
      setLoading(false);
      if (actionData.error) {
        setError(actionData.error);
        addNotification(actionData.error, 'error');
      } else if (actionData.message) {
        setMessage(actionData.message);
        addNotification(actionData.message, 'success');
      }
      if (actionData?.redirectTo) navigate(actionData?.redirectTo);
    }
  }, [actionData]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
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
      setLoading(false);
      setError('Please fill out all fields.');
    } else {
      formData.append('schoolId', currentSchool?.id?.toString() ?? '');
      formData.append('action', action);
      submit(formData, { method: 'post' });
    }
  };

  /**
   * Handles current password input and validates current password reuse
   *
   * @function handleCurrentPasswordChange
   * @param {React.ChangeEvent<HTMLInputElement>} event - Current password input event
   * @description Checks and updates password matching
   */
  const handleCurrentPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const currentPassword = event.target.value;
    setCurrentPassword(currentPassword);
    setPasswordReuse(currentPassword === password);
  };

  /**
   * Handles password input and validates password strength
   *
   * @function handlePasswordChange
   * @param {React.ChangeEvent<HTMLInputElement>} event - Password input event
   * @description Checks and updates password strength
   */
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = event.target.value;
    setPassword(newPassword);
    setIsPasswordStrong(passwordStrongOrNah(newPassword));
  };

  /**
   * Handles confirm password input and validates password matching
   *
   * @function handleConfirmPasswordChange
   * @param {React.ChangeEvent<HTMLInputElement>} event - Confirm password input event
   * @description Checks and updates password matching
   */
  const handleConfirmPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newConfirmPassword = event.target.value;
    setConfirmPassword(newConfirmPassword);
    setPasswordMatch(newConfirmPassword === password);
  };

  return loading ? (
    <Loading />
  ) : (
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
              value={currentPassword}
              onInput={handleCurrentPasswordChange}
          />
          <Input
            label='Enter your new password:'
            name='npwd'
            type='password'
            placeholder='Password'
            filled={false}
            value={password}
            onInput={handlePasswordChange}
            />
            {/* Password strength error */}
            {!isPasswordStrong && (
              <p className='text-red-500 text-sm'>
                Password must be at least 8 characters, contain an uppercase letter,
                a digit, and a special character.
              </p>
            )}
            {/* Password reuse error */}
            {passwordReuse && (
              <p className='text-red-500 text-sm'>
                Password cannot be the same as the current password.
              </p>
            )}
          <Input
            label='Confirm your new password:'
            name='cnpwd'
            type='password'
            placeholder='Password'
            filled={false}
            value={confirmPassword}
            onInput={handleConfirmPasswordChange}
            />
            {/* Password matching error */}
            {!passwordMatch && (
              <p className='text-red-500 text-sm'>Passwords do not match.</p>
            )}
          <div className='flex flex-row gap-2'>
            <Button
              text='Change Password'
              type='submit'
              name='changePassword'
              disabled={!isPasswordStrong || password !== confirmPassword || passwordReuse}
          />
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ChangePassword;
