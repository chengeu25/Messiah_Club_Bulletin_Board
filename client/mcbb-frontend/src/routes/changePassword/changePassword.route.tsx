import React, { useState } from 'react';
import { Form, useSubmit } from 'react-router-dom';
import Input from '../../components/formElements/Input.component';
import Button from '../../components/formElements/Button.component';

const ChangePassword = () => {
  const submit = useSubmit();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
      setError('Please fill out all fields.');
    } else if (formData.get('npwd') !== formData.get('cnpwd')) {
      setError('Passwords do not match.');
    } else {
      formData.append('action', action);
      submit(formData, { method: 'post' });
    }
  };

  return (
    <div className='w-full h-full flex justify-center items-center bg-gray-100'>
      <div className='flex w-full h-full sm:w-1/2 sm:h-auto sm:min-h-[50%] justify-center items-start shadow-md rounded-lg p-5 bg-white'>
        <Form
          onSubmit={handleSubmit}
          className='flex flex-col gap-2 w-full'
        >
          <h1 className='text-3xl font-bold'>Change Password</h1>
          {error && <div className='text-red-500'>{error}</div>}
          <Input
            label='Enter your current password:'
            name='pwd'
            type='password'
            placeholder='Password'
            color='blue'
            filled={false}
          />
          <Input
            label='Enter your new password:'
            name='npwd'
            type='password'
            placeholder='Password'
            color='blue'
            filled={false}
          />
          <Input
            label='Confirm your new password:'
            name='cnpwd'
            type='password'
            placeholder='Password'
            color='blue'
            filled={false}
          />
          <div className='flex flex-row gap-2'>
            <Button
              text='Change Password'
              type='submit'
              name='changePassword'
              color='blue'
            />
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ChangePassword;
