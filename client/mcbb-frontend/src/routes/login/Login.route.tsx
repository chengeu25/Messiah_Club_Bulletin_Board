import React, { useEffect, useMemo, useState } from 'react';
import {
  useSubmit,
  useSearchParams,
  useLoaderData,
  useNavigation
} from 'react-router-dom';
import Input from '../../components/formElements/Input.component';
import Button from '../../components/formElements/Button.component';
import ResponsiveForm from '../../components/formElements/ResponsiveForm';
import Loading from '../../components/ui/Loading';

/**
 * Login component for user authentication and account management.
 * 
 * @component Login
 * @description Provides a comprehensive login interface with multiple authentication options
 * 
 * @returns {JSX.Element} Rendered login form with email, password, and additional actions
 * 
 * @workflow
 * 1. Validate Messiah email format
 * 2. Handle login, signup, and password reset actions
 * 3. Manage form state and validation
 * 4. Display loading state during authentication
 * 5. Show error and success messages
 * 
 * @features
 * - Email format validation
 * - Remember me functionality
 * - Error and message handling
 * - Multiple authentication actions (login, signup, forgot password)
 * - Loading state management
 */
const Login = () => {
  // Form submission and routing hooks
  const submit = useSubmit();
  const navigation = useNavigation();
  const [params] = useSearchParams();
  const { userId } = useLoaderData() as { userId: string };

  // State management for form and authentication
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [remember, setRemember] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Email validation using memoized computation
  const emailIsValid = useMemo(() => email.endsWith('@messiah.edu'), [email]);

  /**
   * Handles URL parameters for error and message display.
   * 
   * @function useEffect
   * @description Updates error and message states based on URL parameters
   */
  useEffect(() => {
    if (params.get('error')) {
      setError(decodeURIComponent(params.get('error') ?? ''));
      setIsLoading(false); // Reset loading state when error is present
    }
    if (params.get('message')) {
      setMessage(decodeURIComponent(params.get('message') ?? ''));
      setIsLoading(false); // Reset loading state when message is present
    }
  }, [params]);

  /**
   * Manages loading state based on navigation state.
   * 
   * @function useEffect
   * @description Resets loading state when navigation is complete
   */
  useEffect(() => {
    if (navigation.state === 'idle') {
      setIsLoading(false);
    }
  }, [navigation.state]);

  /**
   * Populates email and remember me state from loader data.
   * 
   * @function useEffect
   * @description Sets email and remember me checkbox if user ID is available
   */
  useEffect(() => {
    if (userId) {
      setEmail(userId);
      setRemember(true);
    }
  }, [userId]);

  /**
   * Handles form submission with multiple authentication actions.
   * 
   * @function handleSubmit
   * @param {React.FormEvent<HTMLFormElement>} event - Form submission event
   * @description Validates input and submits form for login, signup, or password reset
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(null); // Reset error state at the start of submission
    const formData = new FormData(event.currentTarget);
    const action = (
      (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
    ).name;

    try {
      if (action === 'signup') {
        formData.append('action', action);
        submit(formData, { method: 'post' });
      } else if (action === 'forgot') {
        formData.append('action', action);
        submit(formData, { method: 'post' });
      } else {
        if (formData.get('email') === '') {
          setError('Please enter an email address.');
          setIsLoading(false); // Reset loading state for validation error
          return;
        } else if (formData.get('password') === '') {
          setError('Please enter a password.');
          setIsLoading(false); // Reset loading state for validation error
          return;
        } else {
          formData.append('action', action);
          submit(formData, { method: 'post' });
        }
      }
    } catch (error) {
      console.error('Login submission error:', error);
      setError('An unexpected error occurred.');
      setIsLoading(false); // Reset loading state for unexpected errors
    }
  };

  /**
   * Validates and updates email input.
   * 
   * @function validateEmail
   * @param {React.ChangeEvent<HTMLInputElement>} event - Input change event
   * @description Updates email state and checks email format
   */
  const validateEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  // Render loading state or login form
  return isLoading ? (
    <Loading />
  ) : (
    <ResponsiveForm onSubmit={handleSubmit}>
      <h1 className='text-3xl font-bold'>Login</h1>
      
      {/* Error message display */}
      {error && <p className='text-red-500'>{error}</p>}
      
      {/* Success message display */}
      {message && <p className='text-green-500'>{message}</p>}
      
      {/* Email format validation message */}
      {!emailIsValid && email !== '' && (
        <p className='text-red-500'>Please enter your full Messiah email.</p>
      )}
      
      {/* Email input */}
      <Input
        label='Messiah Email:'
        name='email'
        type='text'
        placeholder='Messiah Email'
        color='blue'
        filled={false}
        onInput={validateEmail}
        value={email}
        required
      />
      
      {/* Password input */}
      <Input
        label='Password:'
        name='password'
        type='password'
        placeholder='Password'
        color='blue'
        filled={false}
        required
      />
      
      {/* Remember me checkbox */}
      <Input
        type='checkbox'
        name='remember'
        label='Remember Me'
        value='true'
        checked={remember}
        onChange={() => setRemember(!remember)}
      />
      
      {/* Login button */}
      <Button color='blue' text='Sign In' type='submit' name='login' />
      
      {/* Signup button */}
      <Button
        color='blue'
        text={"Don't have an account? Sign Up"}
        type='submit'
        name='signup'
        filled={false}
      />
      
      {/* Forgot password button */}
      <Button
        color='blue'
        text='Forgot Password?'
        type='submit'
        name='forgot'
        filled={false}
      />
    </ResponsiveForm>
  );
};

export default Login;
