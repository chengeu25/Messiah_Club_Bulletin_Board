import React, { useEffect, useState } from 'react';
import {
  useSubmit,
  useSearchParams,
  Link,
  useLoaderData
} from 'react-router-dom';
import Input from '../../components/formElements/Input.component';
import Button from '../../components/formElements/Button.component';
import Select from '../../components/formElements/Select.component';
import passwordStrongOrNah from '../../helper/passwordstrength';
import ReCAPTCHA from 'react-google-recaptcha';
import ResponsiveForm from '../../components/formElements/ResponsiveForm';
import { SchoolListType } from '../../types/databaseTypes';
import { useSchool } from '../../contexts/SchoolContext';

/**
 * SignUp component for user registration.
 *
 * @component SignUp
 * @description Provides a comprehensive user registration form with validation
 *
 * @returns {JSX.Element} Rendered signup form
 *
 * @workflow
 * 1. Render signup form with input fields
 * 2. Validate user inputs (password strength, matching, email domain)
 * 3. Implement CAPTCHA verification
 * 4. Submit registration request
 *
 * @features
 * - Client-side input validation
 * - Password strength checking
 * - Password matching verification
 * - School email domain validation
 * - CAPTCHA protection
 * - Error and success message handling
 */
const SignUp = () => {
  // Form submission hook
  const submit = useSubmit();
  const [params] = useSearchParams();

  // Get schools from loader
  const { schools } = useLoaderData() as {
    schools: SchoolListType[];
  };

  // State management for form validation and feedback
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [captchaResponse, setCaptchaResponse] = useState<string | null>(null);

  // Password input state management
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordMatch, setPasswordMatch] = useState<boolean>(true);
  const [isPasswordStrong, setIsPasswordStrong] = useState<boolean>(true);

  // School input state management
  const { currentSchool, setCurrentSchool } = useSchool();

  // Initialize selected school from schools list if not set
  useEffect(() => {
    if (!currentSchool && schools.length > 0) {
      setCurrentSchool(schools[0] ?? null);
    }
  }, [schools, currentSchool, setCurrentSchool]);

  /**
   * Side effect to handle URL parameters for error and success messages
   *
   * @effect
   * @description Parses and sets error or success messages from URL parameters
   */
  useEffect(() => {
    if (params.get('error')) {
      setError(decodeURIComponent(params.get('error') ?? ''));
    }
    if (params.get('message')) {
      setMessage(decodeURIComponent(params.get('message') ?? ''));
    }
  }, [params]);

  /**
   * Handles form submission with comprehensive validation
   *
   * @function handleSubmit
   * @param {React.FormEvent<HTMLFormElement>} event - Form submission event
   * @description Validates form inputs, checks CAPTCHA, and submits registration
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // Add CAPTCHA response to form data
    if (captchaResponse) {
      formData.append('captchaResponse', captchaResponse);
    }

    // Determine form submission action
    const action = (
      (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
    ).name;

    // Validate password strength and matching
    if (!isPasswordStrong) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    // Validate required fields and CAPTCHA
    if (
      password === '' ||
      confirmPassword === '' ||
      formData.get('name') === '' ||
      formData.get('email') === '' ||
      !captchaResponse
    ) {
      setError('Please fill out all required');
      return;
    }

    // Validate school email domain
    if (formData.get('email') === null) {
      setError(`Please use your ${currentSchool?.name} email`);
      return;
    } else if (
      !(formData.get('email')! as string).endsWith(
        currentSchool?.emailDomain ?? ''
      )
    ) {
      setError(`Please use your ${currentSchool?.name} email`);
      return;
    }

    // Submit form based on action
    if (action === 'signup') {
      formData.append('action', action);
      formData.append('schoolId', currentSchool?.id.toString() ?? '');
      submit(formData, { method: 'post' });
    } else if (action === 'forgot') {
      formData.append('action', action);
      submit(formData, { method: 'post' });
    }
  };

  /**
   * Handles password input and validates password strength
   *
   * @function handlePasswordChange
   * @param {React.ChangeEvent<HTMLInputElement>} event - Password input event
   * @description Checks and updates password strength
   */
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = event.target.value;
    setPassword(newPassword);
    setIsPasswordStrong(passwordStrongOrNah(newPassword));
  };

  /**
   * Handles confirm password input and validates password matching
   *
   * @function handleConfirmPasswordChange
   * @param {React.ChangeEvent<HTMLInputElement>} event - Confirm password input event
   * @description Checks and updates password matching
   */
  const handleConfirmPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newConfirmPassword = event.target.value;
    setConfirmPassword(newConfirmPassword);
    setPasswordMatch(newConfirmPassword === password);
  };

  /**
   * Handles CAPTCHA verification response
   *
   * @function handleCaptchaChange
   * @param {string | null} value - CAPTCHA response value
   * @description Updates CAPTCHA response state
   */
  const handleCaptchaChange = (value: string | null) => {
    setCaptchaResponse(value);
  };

  const handleSchoolChange = (e?: React.ChangeEvent<HTMLSelectElement>) => {
    if (!e) return;
    const selectedSchoolName = e.target.value;
    const school = schools.find((s) => s.name === selectedSchoolName) ?? null;
    setCurrentSchool(school);
  };

  return (
    <ResponsiveForm onSubmit={handleSubmit}>
      <h1 className='text-3xl font-bold mb-5'>Sign Up</h1>

      {/* Error and success messages */}
      {error && <p className='text-red-500 mb-3'>{error}</p>}
      {message && <p className='text-green-500 mb-3'>{message}</p>}

      {/* School dropdown */}
      <Select
        filled={false}
        color={'blue'}
        label={'School:'}
        options={schools?.map((s) => s.name)}
        value={currentSchool?.name}
        name='school'
        onChange={handleSchoolChange}
      />

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
          label={`${currentSchool?.name} Email:`}
          name='email'
          type='text'
          placeholder={`${currentSchool?.name} Email`}
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
          value={password}
          onInput={handlePasswordChange}
          required
        />
        {/* Password strength error */}
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
          value={confirmPassword}
          onInput={handleConfirmPasswordChange}
          required
        />
        {/* Password matching error */}
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
          sitekey={import.meta.env.VITE_RECAPTCHA_PUBLIC_KEY}
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
