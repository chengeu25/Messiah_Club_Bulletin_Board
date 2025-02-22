import React, { useEffect } from 'react';
import { Form, useActionData, useSubmit } from 'react-router-dom';
import Input from '../../components/formElements/Input.component';
import Button from '../../components/formElements/Button.component';
import { useNotification } from '../../contexts/NotificationContext';
import Loading from '../../components/ui/Loading';
import useLoading from '../../hooks/useLoading';

/**
 * AccountInfo component for updating user account name and gender.
 *
 * @component
 * @description Provides a form for users to change their account name and gender.
 *
 * @returns {React.ReactElement} Rendered account information form
 */
const AccountInfo = () => {
  const submit = useSubmit();
  const actionData = useActionData() as {
    message: string;
    error: string;
  } | null;
  const { addNotification } = useNotification();
  const { loading, setLoading } = useLoading();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const action = (
      (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
    ).name;

    setLoading(true);
    if (formData.get('name') === '' || formData.get('gender') === '') {
      setLoading(false);
      addNotification('Please fill in all fields.', 'error');
    } else {
      formData.append('action', action);
      submit(formData, { method: 'post' });
    }
  };

  useEffect(() => {
    if (actionData) {
      setLoading(false);
      if (actionData?.message) addNotification(actionData?.message, 'success');
      else if (actionData?.error) addNotification(actionData?.error, 'error');
    }
  }, [actionData]);

  return loading ? (
    <Loading />
  ) : (
    <div className='w-full h-full flex justify-center items-center bg-gray-100'>
      <div className='flex w-full h-full sm:w-1/2 sm:h-auto sm:min-h-[50%] justify-center items-start shadow-md rounded-lg p-5 bg-white'>
        <Form onSubmit={handleSubmit} className='flex flex-col gap-2 w-full'>
          <h1 className='text-3xl font-bold'>Update Account Info</h1>

          <Input
            label='Enter your new name:'
            name='name'
            type='text'
            placeholder='Full Name'
            filled={false}
          />

          <div className='flex flex-col gap-2'>
            <label className='text-lg'>Gender:</label>
            <select
              name='gender'
              defaultValue=''
              className='p-2 border border-gray-300 rounded'
            >
              <option value='' disabled>
                Select Gender
              </option>
              <option value='male'>Male</option>
              <option value='female'>Female</option>
              <option value='other'>Other</option>
            </select>
          </div>

          <div className='flex flex-row gap-2'>
            <Button
              text='Update Account Info'
              type='submit'
              name='updateAccount'
            />
          </div>
        </Form>
      </div>
    </div>
  );
};

export default AccountInfo;
