import React from 'react';
import { Form, useSubmit } from 'react-router-dom';
import Input from '../../components/formElements/Input.component';
import Button from '../../components/formElements/Button.component';
import Select from '../../components/formElements/Select.component';

const Login = () => {
  const submit = useSubmit();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const action = (
      (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
    ).name;
    formData.append('action', action);
    submit(formData, { method: 'post' });
  };

  return (
    <div className='w-full h-full flex justify-center items-center bg-gray-100'>
      <div className='flex w-full h-full sm:w-1/2 sm:h-1/2 justify-center items-center shadow-md rounded-lg p-5 bg-white'>
        <Form
          onSubmit={handleSubmit}
          className='flex flex-col gap-2 w-full h-full'
        >
          <h1 className='text-3xl font-bold'>Engagement Bulletin Login</h1>
          <Select
            label='User Type:'
            name='type'
            color='blue'
            options={['Student', 'Club Admin', 'Messiah Faculty']}
            filled={false}
          />
          <Input
            label='Messiah Email:'
            name='email'
            type='text'
            placeholder='Messiah Email'
            required={true}
          />
          <Input
            label='Password:'
            name='password'
            type='password'
            placeholder='Password'
            required={true}
          />
          <div className='flex flex-row gap-2'>
            <Button color='blue' text='Sign In' type='submit' name='login' />
            <Button color='blue' text='Sign Up' type='submit' name='signup' />
            <Button
              color='blue'
              text='Forgot Password?'
              type='submit'
              name='forgot'
              filled={false}
            />
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login;
