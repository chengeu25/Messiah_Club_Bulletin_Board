import { useEffect, useState } from 'react';
import { useActionData, useLoaderData, useSubmit } from 'react-router-dom';
import Button from '../../../components/formElements/Button.component';
import ResponsiveForm from '../../../components/formElements/ResponsiveForm';
import Select from '../../../components/formElements/Select.component';
import { useNotification } from '../../../contexts/NotificationContext';
import useLoading from '../../../hooks/useLoading';
import Loading from '../../../components/ui/Loading';

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

  const actionData = useActionData() as { error?: string; message?: string };
  const { addNotification } = useNotification();
  const { loading, setLoading } = useLoading();

  const [emailFrequency, setEmailFrequency] = useState(
    initialFrequency ?? 'Weekly'
  );
  const [emailEventType, setEmailEventType] = useState(
    initialEventType ?? 'Suggested'
  );

  useEffect(() => {
    if (actionData?.error) {
      addNotification(actionData.error, 'error');
    }
    if (actionData?.message) {
      addNotification(actionData.message, 'success');
    }
  }, [actionData]);

  /**
   * Handles form submission by creating FormData and submitting
   *
   * @param {React.FormEvent<HTMLFormElement>} event - Form submission event
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('email_frequency', emailFrequency);
    formData.append('email_event_type', emailEventType);
    submit(formData, { method: 'post' });
  };

  return loading ? (
    <Loading />
  ) : (
    <ResponsiveForm onSubmit={handleSubmit}>
      <h1 className='text-3xl font-bold'>Email Preferences</h1>
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
