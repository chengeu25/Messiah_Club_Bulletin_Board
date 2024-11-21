import React, { useEffect, useMemo, useState } from 'react';
import { useSubmit, useSearchParams, useNavigate } from 'react-router-dom';
import Input from '../../components/formElements/Input.component';
import Button from '../../components/formElements/Button.component';
import ResponsiveForm from '../../components/formElements/ResponsiveForm';

const ForgotPassswordToken = () => {
  const submit = useSubmit();
  const [params] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const token = useMemo(() => params.get('token'), [params]);

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setError(null);
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const action = (
      (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
    ).name;
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
      formData.append('action', action);
      formData.append('token', params.get('token') as string);
      submit(formData, { method: 'post' });
    }
  };

  return (
    <ResponsiveForm onSubmit={handleSubmit}>
      <h1 className='text-3xl font-bold'>Reset Password</h1>
      {error && <div className='text-red-500'>{error}</div>}
      {message && <div className='text-green-500'>{message}</div>}
      <Input
        label='New password:'
        name='newPassword'
        type='password'
        placeholder='Password'
        color='blue'
        filled={false}
      />
      <Input
        label='Confirm password:'
        name='confirmPassword'
        type='password'
        placeholder='Password'
        color='blue'
        filled={false}
      />
      <div className='flex flex-row gap-2'>
        <Button
          text='Submit'
          type='submit'
          name='submitResetPassword'
          color='blue'
        />
      </div>
    </ResponsiveForm>
  );
};

export default ForgotPassswordToken;
