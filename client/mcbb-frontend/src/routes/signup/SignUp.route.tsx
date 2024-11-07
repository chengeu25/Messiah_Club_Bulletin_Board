import React, { useEffect, useState } from 'react';
import { Form, useSubmit, useSearchParams, Link } from 'react-router-dom';
import Input from '../../components/formElements/Input.component';
import Button from '../../components/formElements/Button.component';
import Select from '../../components/formElements/Select.component';

const SignUp = () => {
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

  return (
    <div className='w-full h-full flex justify-center items-center bg-gray-100'>

    <div className='flex w-full h-full sm:h-auto sm:w-1/2 sm:min-h-[50%] justify-center items-start shadow-md rounded-lg p-5 bg-white'>

      <Form onSubmit={handleSubmit} className='flex flex-col gap-2 w-full'>
          <h1 className='text-3xl font-bold'>Sign Up</h1>
          {error && <p className='text-red-500'>{error}</p>}
          {message && <p className='text-green-500'>{message}</p>}
          <Input
            label='Name:'
            name='name'
            type='text'
            placeholder='First Last'
            color='blue'
            filled={false}
          />
          <Input
            label='Messiah Email:'
            name='email'
            type='text'
            placeholder='Messiah Email'
            color='blue'
            filled={false}
          />
          <Input
            label='Password:'
            name='password'
            type='password'
            placeholder='Password'
            color='blue'
            filled={false}
          />
          <Input
            label='Confirm Password:'
            name='confirm-password'
            type='password'
            placeholder='Password'
            color='blue'
            filled={false}
          />
          <Select
            color='blue'
            label='Gender:'
            name='gender'
            options={[
              'Male',
              'Female',
              "Don't recommend gender-specific events"
            ]}
            filled={false}
          />
          <div className='flex flex-row gap-2'>
            <Button color='blue' text='Sign Up' type='submit' name='signup' />
          </div>
          <Link to="/login" className="underline">already have a login</Link>
        </Form>
        
      </div>
    </div>
  );
};

export default SignUp;
