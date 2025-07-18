import React, { useEffect, useState } from 'react';
import {
  useSubmit,
  Link,
  useLoaderData,
  useParams,
  useActionData,
  useSearchParams
} from 'react-router-dom';
import Input from '../../components/formElements/Input.component';
import Button from '../../components/formElements/Button.component';
import Select from '../../components/formElements/Select.component';
import passwordStrongOrNah from '../../helper/passwordstrength';
import ReCAPTCHA from 'react-google-recaptcha';
import ResponsiveForm from '../../components/formElements/ResponsiveForm';
import { SchoolType } from '../../types/databaseTypes';
import { useSchool } from '../../contexts/SchoolContext';
import useLoading from '../../hooks/useLoading';
import Loading from '../../components/ui/Loading';

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
  const { schoolId } = useParams();

  // Get schools from loader
  const { schools } = useLoaderData() as {
    schools: SchoolType[];
  };

  const actionData = useActionData() as {
    error: string;
  };

  const { loading, setLoading } = useLoading();

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

  // Set message
  const [searchParams] = useSearchParams();
  useEffect(() => {
    setMessage(searchParams.get('message'));
  });

  // Initialize selected school from schools list if not set
  useEffect(() => {
    if (schools.length > 0) {
      setCurrentSchool(schools.find((s) => s.id === Number(schoolId)) ?? null);
    }
  }, [schools, schoolId, setCurrentSchool]);

  // Initialize error message from action data
  useEffect(() => {
    setLoading(false);
    if (actionData?.error) {
      setError(actionData?.error);
    }
  }, [actionData]);

  function isYearInRange(year: number) {
    // Get the current year
    const currentYear = new Date().getFullYear();

    // Calculate the end year (2 years in the future)
    const endYear = currentYear + 2;

    // Check if the year is between startYear and endYear (inclusive)
    return year >= new Date().getFullYear() - 10 && year <= endYear;
  }

  /**
   * Handles form submission with comprehensive validation
   *
   * @function handleSubmit
   * @param {React.FormEvent<HTMLFormElement>} event - Form submission event
   * @description Validates form inputs, checks CAPTCHA, and submits registration
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
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
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setLoading(false);
      return;
    }

    if (action === 'switchSchool') {
      formData.append('action', action);
      submit(formData, { method: 'post' });
      return;
    }

    // Validate required fields and CAPTCHA
    if (
      password === '' ||
      confirmPassword === '' ||
      formData.get('name') === '' ||
      formData.get('email') === '' ||
      formData.get('semester') === '' ||
      !isYearInRange(parseInt((formData.get('year') ?? '0') as string)) ||
      !captchaResponse
    ) {
      setError('Please fill out all required');
      setLoading(false);
      return;
    }

    // Validate school email domain
    if (formData.get('email') === null) {
      setError(`Please use your ${currentSchool?.name} email`);
      setLoading(false);
      return;
    } else if (
      !(formData.get('email')! as string).endsWith(
        currentSchool?.emailDomain ?? ''
      )
    ) {
      setError(`Please use your ${currentSchool?.name} email`);
      setLoading(false);
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

  return loading ? (
    <Loading />
  ) : (
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

      {/* Class Level */}
      <Select
        label='Semester You Started College: '
        name='semester'
        options={['Fall', 'Spring']}
        filled={false}
        required
      />
      <Input
        label='Year You Started College:'
        name='year'
        type='number'
        defaultValue={new Date().getFullYear()}
        filled={false}
        min={new Date().getFullYear() - 10}
        max={new Date().getFullYear() + 2}
        required
      />

      {/* Email Preferences */}
      <div className='w-full'>
        <Select
          label='Send Regular Emails About Events That Are:'
          name='emailPreferences'
          options={['Suggested', 'Hosted by Subscribed Clubs', 'Attending']}
          filled={false}
          required
        />
        <Select
          label='Send These Emails:'
          name='emailFrequency'
          options={['Weekly', 'Daily', 'Never']}
          filled={false}
          required
        />
      </div>

      {/* Submit Button */}
      <div className='flex flex-row gap-2 mt-4'>
        <Button
          text='Sign Up'
          type='submit'
          name='signup'
          disabled={!isPasswordStrong || password !== confirmPassword}
        />
      </div>

      <Button
        text='Switch School'
        type='submit'
        name='switchSchool'
        filled={false}
      />

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
