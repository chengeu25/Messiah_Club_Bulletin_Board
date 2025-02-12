import React, { useEffect, useState } from 'react';
import { useLoaderData, Form } from 'react-router-dom';
import Input from '../../components/formElements/Input.component';
import Button from '../../components/formElements/Button.component';
import { SchoolType } from '../../types/databaseTypes';

/**
 * School Edit component to render the school edit form
 * @returns {JSX.Element} Rendered school edit form
 */
const SchoolEdit = () => {
  const school = useLoaderData() as SchoolType;
  const [formState, setFormState] = useState({
    name: school.name || '',
      });

  useEffect(() => {
    setFormState({
      name: school.name || '',
    });
  }, [school]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-3xl font-bold mb-6'>Edit School Information</h1>
      <Form method='post' className='flex flex-col gap-4'>
        <Input
          label='School Name'
          name='name'
          type='text'
          value={formState.name}
          onChange={handleChange}
          required
        />
        <Input
          label='Address'
          name='address'
          type='text'
          onChange={handleChange}
          required
        />
        <Input
          label='Contact Email'
          name='contactEmail'
          type='email'
          onChange={handleChange}
          required
        />
        <Button text='Save Changes' type='submit' className='bg-blue-500 text-white rounded hover:bg-blue-600' />
      </Form>
    </div>
  );
};

export default SchoolEdit;