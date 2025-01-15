import { useEffect, useState } from 'react';
import { useLoaderData, useSearchParams, useSubmit } from 'react-router-dom';
import Button from '../../../components/formElements/Button.component';
import ResponsiveForm from '../../../components/formElements/ResponsiveForm';
import Select from '../../../components/formElements/Select.component';

/**
 * Interface representing the email preferences data returned by the loader
 * @interface EmailPreferencesData
 * @property {string} email_frequency - Frequency of email updates
 * @property {string} email_event_type - Types of events to include in emails
 */
interface EmailPreferencesData {
  email_frequency: string;
  email_event_type: string;
}

/**
 * Component for managing user email preferences
 *
 * @component
 * @description Allows users to set their preferred email notification frequency
 * and types of events they want to receive emails about
 *
 * @workflow
 * 1. Load initial email preferences from server
 * 2. Allow user to modify preferences
 * 3. Submit updated preferences to server
 *
 * @returns {JSX.Element} Rendered email preferences form
 */
const EmailPreferences = () => {
  const submit = useSubmit();

  const {
    email_frequency: initialFrequency,
    email_event_type: initialEventType
  } = useLoaderData() as EmailPreferencesData;

  const [params] = useSearchParams();

  const [emailFrequency, setEmailFrequency] = useState(initialFrequency);
  const [emailEventType, setEmailEventType] = useState(initialEventType);

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  /**
   * Handles form submission by creating FormData and submitting
   *
   * @param {React.FormEvent<HTMLFormElement>} event - Form submission event
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('email_frequency', emailFrequency);
    formData.append('email_event_type', emailEventType);
    submit(formData, { method: 'post' });
  };

  useEffect(() => {
    setError(params.get('error'));
    setMessage(params.get('message'));
  }, [params]);

  return (
    <ResponsiveForm onSubmit={handleSubmit}>
      <h1 className='text-3xl font-bold'>Email Preferences</h1>
      {error && <p className='text-red-500'>{error}</p>}
      {message && <p className='text-green-500'>{message}</p>}
      <Select
        options={['Weekly', 'Daily', 'Never']}
        label='Receive Updates About Events:'
        filled={false}
        value={emailFrequency}
        onChange={(e: React.ChangeEvent<HTMLSelectElement> | undefined) =>
          setEmailFrequency(e?.target?.value ?? 'Weekly')
        }
      />
      <Select
        options={['Suggested', 'Attending', 'Hosted by Subscribed Clubs']}
        label='In regular update emails, include the following events:'
        filled={false}
        value={emailEventType}
        onChange={(e: React.ChangeEvent<HTMLSelectElement> | undefined) =>
          setEmailEventType(e?.target?.value ?? 'Suggested')
        }
      />
      <Button type='submit' text='Save Preferences' />
    </ResponsiveForm>
  );
};

export default EmailPreferences;
