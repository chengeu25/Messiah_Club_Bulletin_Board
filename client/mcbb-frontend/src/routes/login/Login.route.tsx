import React, { useEffect, useMemo, useState } from 'react';
import { useSubmit, useSearchParams, useLoaderData } from 'react-router-dom';
import Input from '../../components/formElements/Input.component';
import Button from '../../components/formElements/Button.component';
import ResponsiveForm from '../../components/formElements/ResponsiveForm';

/**
 * Login page for the application
 * @returns Login page
 */
const Login = () => {
  const submit = useSubmit();
  const [params] = useSearchParams();
  const { userId } = useLoaderData() as { userId: string };
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [remember, setRemember] = useState<boolean>(false);
  const emailIsValid = useMemo(() => email.endsWith('@messiah.edu'), [email]);

  /**
   * If the page is reloaded with an error, set the error state
   */
  useEffect(() => {
    if (params.get('error')) {
      setError(decodeURIComponent(params.get('error') ?? ''));
    }
    if (params.get('message')) {
      setMessage(decodeURIComponent(params.get('message') ?? ''));
    }
  }, [params]);

  useEffect(() => {
    if (userId) {
      setEmail(userId);
      setRemember(true);
    }
  }, [userId]);

  /**
   * Handles the form submission
   * @param event The form event
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const action = (
      (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
    ).name;
    if (action === 'signup') {
      formData.append('action', action);
      submit(formData, { method: 'post' });
    } else if (action === 'forgot') {
      formData.append('action', action);
      submit(formData, { method: 'post' });
    } else {
      if (formData.get('email') === '') {
        setError('Please enter an email address.');
      } else if (formData.get('password') === '') {
        setError('Please enter a password.');
      } else {
        formData.append('action', action);
        submit(formData, { method: 'post' });
      }
    }
  };

  const validateEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  return (
    <ResponsiveForm onSubmit={handleSubmit}>
      <h1 className='text-3xl font-bold'>Login</h1>
      {error && <p className='text-red-500'>{error}</p>}
      {message && <p className='text-green-500'>{message}</p>}
      {!emailIsValid && email !== '' && (
        <p className='text-red-500'>Please enter your full Messiah email.</p>
      )}
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
      <Input
        label='Password:'
        name='password'
        type='password'
        placeholder='Password'
        color='blue'
        filled={false}
        required
      />
      <Input
        type='checkbox'
        name='remember'
        label='Remember Me'
        value='true'
        checked={remember}
        onChange={() => setRemember(!remember)}
      />
      <Button color='blue' text='Sign In' type='submit' name='login' />
      <Button
        color='blue'
        text={"Don't have an account? Sign Up"}
        type='submit'
        name='signup'
        filled={false}
      />
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
