import React, { useEffect, useState } from 'react';
import { useLoaderData, Form, useNavigate } from 'react-router-dom';
import Input from '../../components/formElements/Input.component';
import Button from '../../components/formElements/Button.component';
import { SchoolType } from '../../types/databaseTypes';
import useLoading from '../../hooks/useLoading';
import Loading from '../../components/ui/Loading';
import { useNotification } from '../../contexts/NotificationContext';

/**
 * School Edit component to render the school edit form
 * @returns {JSX.Element} Rendered school edit form
 */
const SchoolEdit = () => {
  const school = useLoaderData() as SchoolType;
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    name: school.name || '',
    color: school.color?.replace(/^#/, '') || '000000', // Ensure valid HEX without '#'
    logo: school.logo || ''
  });

  const { addNotification } = useNotification();
  const { loading, setLoading } = useLoading();

  useEffect(() => {
    setFormState({
      name: school.name || '',
      color: school.color?.replace(/^#/, '') || '000000',
      logo: school.logo || ''
    });
  }, [school]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormState((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormState((prevState) => ({
          ...prevState,
          logo: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Validate color hex code
    const hexValue = formState.color.replace(/^#/, ''); // Remove '#' if present
    if (!/^[0-9A-Fa-f]{6}$/.test(hexValue)) {
      addNotification(
        'Invalid color hex code. Please enter a valid 6-character hex code.',
        'error'
      );
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to save the changes?'
    );
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/school/update`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(formState)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update school data');
      }

      addNotification('Changes saved successfully!', 'success');
      navigate('/dashboard/faculty/schoolEdit');
    } catch (error) {
      console.error('Error updating school data:', error);
      addNotification(
        error instanceof Error ? error.message : 'Unknown error',
        'error'
      );
    }

    setLoading(false);
  };

  return loading ? (
    <Loading />
  ) : (
    <div className='container mx-auto p-4'>
      <h1 className='text-3xl font-bold mb-6'>Edit School Information</h1>

      <Form
        method='post'
        className='flex flex-col gap-4'
        onSubmit={handleSubmit}
      >
        <input type='hidden' name='actionType' value='submit' />
        <Input
          label='School Name'
          name='name'
          type='text'
          value={formState.name}
          onChange={handleChange}
          filled={false}
        />
        <label className='block text-sm font-medium text-gray-700'>
          School Color
        </label>
        <div className='flex flex-row gap-2 items-center'>
          <input
            type='color'
            name='color'
            value={`#${formState.color}`} // Ensure valid HEX format
            onChange={handleChange}
            className='w-16 h-10 p-0 border-none'
          />
          <input
            type='text'
            name='color'
            value={formState.color} // Allow manual editing
            onChange={handleChange}
            className='block w-full text-sm text-gray-500 border border-gray-300 rounded-md p-2'
            placeholder='#000000'
          />
        </div>
        <label className='block text-sm font-medium text-gray-700'>
          School Logo
        </label>
        <input
          type='file'
          name='logo'
          accept='image/*'
          onChange={handleFileChange}
          className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
        />
        {formState.logo && (
          <img
            src={formState.logo}
            alt='School Logo'
            className='w-32 h-32 object-cover mt-4'
          />
        )}
        <Button
          text='Save Changes'
          type='submit'
          className='bg-blue-500 text-white rounded hover:bg-blue-600'
        />
      </Form>
    </div>
  );
};

export default SchoolEdit;
