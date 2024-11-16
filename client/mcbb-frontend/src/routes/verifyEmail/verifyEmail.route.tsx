import React, { useEffect, useState } from 'react';
import { useSearchParams, useSubmit } from 'react-router-dom';
import Input from '../../components/formElements/Input.component';
import Button from '../../components/formElements/Button.component';
import ResponsiveForm from '../../components/formElements/ResponsiveForm';

const VerifyEmail = () => {
  const submit = useSubmit();
  const [params] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setError(null);
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const action = (
      (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
    ).name;
    if (action === 'resendCode') {
      formData.append('action', action);
      submit(formData, { method: 'post' });
    } else if (action === 'verifyEmail' && formData.get('code') === '') {
      setError('Please enter a code.');
    } else {
      formData.append('action', action);
      submit(formData, { method: 'post' });
    }
  };

  return (
    <ResponsiveForm onSubmit={handleSubmit}>
      <h1 className='text-3xl font-bold'>2-Factor Authentication</h1>
      {error && <div className='text-red-500'>{error}</div>}
      {message && <p className='text-green-500'>{message}</p>}
      <Input
        label='Enter the code sent to your email:'
        name='code'
        type='text'
        placeholder='XXXXXX'
        color='blue'
        filled={false}
      />
      <div className='flex flex-row gap-2'>
        <Button
          text='Authenticate'
          type='submit'
          name='verifyEmail'
          color='blue'
        />
        <Button
          text='Resend Code'
          type='submit'
          name='resendCode'
          color='blue'
          filled={false}
        />
      </div>
    </ResponsiveForm>
  );
};

export default VerifyEmail;
