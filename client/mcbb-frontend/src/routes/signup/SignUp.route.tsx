import React, { useState } from 'react';
import { Form, useSubmit } from 'react-router-dom';
import Input from '../../components/formElements/Input.component';
import Button from '../../components/formElements/Button.component';
import Select from '../../components/formElements/Select.component';

const SignUp = () => {
  const submit = useSubmit();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setError(null);
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const action = (
      (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
    ).name;
    if (action === 'forgot') {
      formData.append('action', action);
      submit(formData, { method: 'post' });
    } else {
      if (formData.get('email') === '') {
        setError('Please enter an email address.');
      } else if (
        formData.get('password') === '' ||
        formData.get('confirm-password') === ''
      ) {
        setError('Please enter a password.');
      } else if (
        formData.get('password') !== formData.get('confirm-password')
      ) {
        setError('Passwords do not match.');
      } else {
        formData.append('action', action);
        submit(formData, { method: 'post' });
      }
    }
  };

  return (
    <div className='w-full h-full flex justify-center items-center bg-gray-100'>
      <div className='flex w-full h-full sm:w-1/2 sm:h-1/2 justify-center items-center shadow-md rounded-lg p-5 bg-white'>
        <Form
          onSubmit={handleSubmit}
          className='flex flex-col gap-2 w-full h-full'
        >
          <h1 className='text-3xl font-bold'>Sign Up</h1>
          {error && <p className='text-red-500'>{error}</p>}
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
        </Form>
      </div>
    </div>
  );
};

export default SignUp;