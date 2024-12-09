import React, { useEffect, useState } from 'react';
import { useSubmit, useSearchParams, Link } from 'react-router-dom';
import Input from '../../components/formElements/Input.component'; // Import Input component
import Button from '../../components/formElements/Button.component';
import Select from '../../components/formElements/Select.component';
import passwordStrongOrNah from '../../helper/passwordstrength'; // Import password strength validator
import ReCAPTCHA from 'react-google-recaptcha'; // Import ReCAPTCHA component
import ResponsiveForm from '../../components/formElements/ResponsiveForm';

const SignUp = () => {
  const submit = useSubmit();
  const [params] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [captchaResponse, setCaptchaResponse] = useState<string | null>(null); // Store captcha response

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
    if (captchaResponse) {
      formData.append('captchaResponse', captchaResponse); // Add captcha response
    }

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
    if (
      password === '' ||
      confirmPassword === '' ||
      formData.get('name') === '' ||
      formData.get('email') === '' ||
      !captchaResponse // Check if CAPTCHA is filled
    ) {
      setError('Please fill out all required');
      return;
    }
    if (formData.get('email') === null) {
      setError('Please use your Messiah email');
      return;
    } else if (!(formData.get('email')! as string).endsWith('messiah.edu')) {
      setError('Please use your Messiah email');
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

  const handleCaptchaChange = (value: string | null) => {
    setCaptchaResponse(value);
  };

  return (
    <ResponsiveForm onSubmit={handleSubmit}>
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
          required
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
          required
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
          required
        />
        {/* Show password strength error if the password is not strong */}
        {!isPasswordStrong && (
          <p className='text-red-500 text-sm'>
            Password must be at least 8 characters, contain an uppercase letter,
            a digit, and a special character.
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
          required
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
          options={['Male', 'Female', "Don't recommend gender-specific events"]}
          filled={false}
          required
        />
      </div>

      {/* CAPTCHA */}
      <div className='w-full'>
        <ReCAPTCHA
          sitekey='6LcF6HsqAAAAAKg7-vbvDf-XRsJ9UYGQpfpzFs7L' // Use your reCAPTCHA site key
          onChange={handleCaptchaChange}
        />
      </div>

      {/* Submit Button */}
      <div className='flex flex-row gap-2 mt-4'>
        <Button
          color='blue'
          text='Sign Up'
          type='submit'
          name='signup'
          disabled={!isPasswordStrong || password !== confirmPassword}
        />
      </div>

      {/* Link to Login */}
      <div className='mt-4 text-center'>
        <Link to='/login' className='underline text-blue-500'>
          Already have a login?
        </Link>
      </div>
    </ResponsiveForm>
  );
};

export default SignUp;
