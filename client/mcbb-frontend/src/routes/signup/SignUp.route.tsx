import React, { useEffect, useState } from 'react';
import { Form, useSubmit, useSearchParams, Link } from 'react-router-dom';
import Input from '../../components/formElements/Input.component'; // Import Input component
import Button from '../../components/formElements/Button.component';
import Select from '../../components/formElements/Select.component';
import passwordStrongOrNah from '../../helper/passwordstrength'; // Import password strength validator

const SignUp = () => {
  const submit = useSubmit();
  const [params] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Local states to manage password input and matching
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordMatch, setPasswordMatch] = useState<boolean>(true); // To check if passwords match
  const [isPasswordStrong, setIsPasswordStrong] = useState<boolean>(true); // To check password strength

  // Side-effect to handle URL parameters like error or message
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

    // Check password strength and matching before submission
    if (!isPasswordStrong) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    // Proceed with form submission if no errors
    if (action === 'signup') {
      formData.append('action', action);
      submit(formData, { method: 'post' });
    } else if (action === 'forgot') {
      formData.append('action', action);
      submit(formData, { method: 'post' });
    }
  };

  // Handle password change and validate strength
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = event.target.value;
    setPassword(newPassword);
    setIsPasswordStrong(passwordStrongOrNah(newPassword)); // Check if password is strong
  };

  // Handle confirm password change and validate matching
  const handleConfirmPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newConfirmPassword = event.target.value;
    setConfirmPassword(newConfirmPassword);
    setPasswordMatch(newConfirmPassword === password); // Check if passwords match
  };

  return (
    <div className='w-full h-full flex justify-center items-center bg-gray-100'>
      <div className='flex w-full h-full sm:h-auto sm:w-1/2 sm:min-h-[50%] justify-center items-start shadow-md rounded-lg p-5 bg-white'>
        <Form onSubmit={handleSubmit} className='flex flex-col gap-4 w-full'>
          <h1 className='text-3xl font-bold mb-5'>Sign Up</h1>

          {/* Error and success messages */}
          {error && <p className='text-red-500 mb-3'>{error}</p>}
          {message && <p className='text-green-500 mb-3'>{message}</p>}

          {/* Name Input */}
          <div className='w-full'>
            <Input
              label='Name:'
              name='name'
              type='text'
              placeholder='First Last'
              color='blue'
              filled={false}
            />
          </div>

          {/* Email Input */}
          <div className='w-full'>
            <Input
              label='Messiah Email:'
              name='email'
              type='text'
              placeholder='Messiah Email'
              color='blue'
              filled={false}
            />
          </div>

          {/* Password Input */}
          <div className='w-full'>
            <Input
              label='Password:'
              name='password'
              type='password'
              placeholder='Password'
              color='blue'
              filled={false}
              value={password} // Set value directly from state
              onInput={handlePasswordChange} // Handle changes to password
            />
            {/* Show password strength error if the password is not strong */}
            {!isPasswordStrong && (
              <p className='text-red-500 text-sm'>
                Password must be at least 8 characters, contain an uppercase
                letter, a digit, and a special character.
              </p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className='w-full'>
            <Input
              label='Confirm Password:'
              name='confirm-password'
              type='password'
              placeholder='Confirm Password'
              color='blue'
              filled={false}
              value={confirmPassword} // Set value directly from state
              onInput={handleConfirmPasswordChange} // Handle changes to confirm password
            />
            {/* Show error if passwords do not match */}
            {!passwordMatch && (
              <p className='text-red-500 text-sm'>Passwords do not match.</p>
            )}
          </div>

          {/* Gender Select */}
          <div className='w-full'>
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
          </div>

          {/* Submit Button */}
          <div className='flex flex-row gap-2 mt-4'>
            <Button color='blue' text='Sign Up' type='submit' name='signup' />
          </div>

          {/* Link to Login */}
          <div className='mt-4 text-center'>
            <Link to='/login' className='underline text-blue-500'>
              Already have a login?
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default SignUp;
