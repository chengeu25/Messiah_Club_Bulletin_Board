import React, { useEffect, useState } from 'react';
import { useLoaderData, Form, useNavigate } from 'react-router-dom';
import Input from '../../components/formElements/Input.component';
import Button from '../../components/formElements/Button.component';
import { SchoolType } from '../../types/databaseTypes';

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
    logo: school.logo || '',
    emailDomain: school.emailDomain || ''
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailDomainError, setEmailDomainError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
    } else if (name === 'emailDomain') {
      // Validate email domain format
      const emailDomainRegex = /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
      if (!emailDomainRegex.test(value)) {
        setEmailDomainError('Invalid email domain format. Example: example.com');
      } else {
        setEmailDomainError(null);
      }
      setFormState((prevState) => ({
        ...prevState,
        [name]: value
      }));
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (emailDomainError) {
      setErrorMessage('Please fix the errors before submitting.');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to save the changes?');
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/school/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formState)
      });

      if (!response.ok) {
        throw new Error('Failed to update school data');
      }

      setSuccessMessage('Changes saved successfully!');
      setTimeout(() => {
        setSuccessMessage(null);
        navigate('/dashboard/schoolEdit');
      }, 2000);
    } catch (error) {
      console.error('Error updating school data:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
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

      {/* Display success message if it exists */}
      {successMessage && (
        <div className="bg-green-200 text-green-800 p-4 rounded mb-4">
          <strong>Success:</strong> {successMessage}
        </div>
      )}

      <Form method="post" className='flex flex-col gap-4' onSubmit={handleSubmit}>
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
        {emailDomainError && (
          <div className="text-red-600 text-sm">{emailDomainError}</div>
        )}
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