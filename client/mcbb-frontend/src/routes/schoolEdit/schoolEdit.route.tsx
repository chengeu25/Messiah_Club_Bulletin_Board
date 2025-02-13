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
    color: school.color?.replace(/^#/, '') || '000000', // Ensure valid HEX without '#'
    logo: school.logo || '',
    emailDomain: school.emailDomain || ''
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setFormState({
      name: school.name || '',
      color: school.color?.replace(/^#/, '') || '000000',
      logo: school.logo || '',
      emailDomain: school.emailDomain || ''
    });
  }, [school]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Ensure color is always a valid HEX format
    if (name === 'color') {
      const hexValue = value.replace(/^#/, ''); // Remove '#' if present
      if (/^[0-9A-Fa-f]{6}$/.test(hexValue)) { // Ensure exactly 6 characters
        console.log('Color Value:', hexValue); // Log the color value
        setFormState((prevState) => ({ ...prevState, color: hexValue }));
      }
    } else {
      setFormState((prevState) => ({
        ...prevState,
        [name]: value
      }));
    }
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

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-3xl font-bold mb-6'>Edit School Information</h1>

      {/* Display error message if it exists */}
      {errorMessage && (
        <div className="bg-red-200 text-red-800 p-4 rounded mb-4">
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      <Form method="post" className='flex flex-col gap-4'>
        <input type="hidden" name="actionType" value="submit" />
        <Input
          label='School Name'
          name='name'
          type='text'
          value={formState.name}
          onChange={handleChange}
          required
        />
        <label className='block text-sm font-medium text-gray-700'>
          School Color
        </label>
        <input
          type='color'
          name='color'
          value={`#${formState.color}`} // Ensure valid HEX format
          onChange={handleChange}
          required
        />
        <Input
          label='Email Domain'
          name='emailDomain'
          type='text'
          value={formState.emailDomain}
          onChange={handleChange}
          required
        />
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
        <Button text='Save Changes' type='submit' className='bg-blue-500 text-white rounded hover:bg-blue-600' />
      </Form>
    </div>
  );
};

export default SchoolEdit;