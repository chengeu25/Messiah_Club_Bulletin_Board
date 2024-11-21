import React, { useEffect, useState } from 'react';
import { Form, useSubmit, useSearchParams } from 'react-router-dom';
import Input from '../../components/formElements/Input.component';
import Button from '../../components/formElements/Button.component';

const ForgotPassword = () => {
  const submit = useSubmit();
  const [params] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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
    if (formData.get('email') === '') {
      setError('Please enter an email address.');
    } else {
      formData.append('action', action);
      submit(formData, { method: 'post' });
    }
  };

  return (
    <div className='w-full h-full flex justify-center items-center bg-gray-100'>
      <div className='flex w-full h-full sm:w-1/2 sm:h-auto sm:min-h-[50%] justify-center items-start shadow-md rounded-lg p-5 bg-white'>
        <Form onSubmit={handleSubmit} className='flex flex-col gap-2 w-full'>
          <h1 className='text-3xl font-bold'>Forgot Password?</h1>
          {error && <div className='text-red-500'>{error}</div>}
          {message && <p className='text-green-500'>{message}</p>}
          <Input
            label='Enter your Messiah email:'
            name='email'
            type='text'
            placeholder='Messiah Email'
            color='blue'
            filled={false}
          />
          <div className='flex flex-row gap-2'>
            <Button
              text='Send Reset Link'
              type='submit'
              name='sendTemporaryPassword'
              color='blue'
            />
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ForgotPassword;
