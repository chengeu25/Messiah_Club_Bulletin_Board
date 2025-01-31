import { useState } from 'react';
import Button from '../../../components/formElements/Button.component';
import ResponsiveForm from '../../../components/formElements/ResponsiveForm';

const CohostApproval = () => {
  const [message, setMessage] = useState<string | null>(null);

  const handleApproval = async (decision: 'approve' | 'decline') => {
    setMessage(null); // Clear previous messages

    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');
    const clubId = urlParams.get('clubId');

    if (!eventId || !clubId) {
      setMessage('Missing eventId or clubId in URL.');
      return;
    }

    const response = await fetch(
      `${
        import.meta.env.VITE_API_BASE_URL
      }/api/events/${decision}-collaboration`,
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, clubId }) // Include eventId and clubId in the request body
      }
    );

    const data = await response.json();
    if (response.ok) {
      setMessage(data.message); // Show success message
    } else {
      setMessage(data.error || 'An error occurred.');
    }
  };

  return (
    <ResponsiveForm onSubmit={async () => {}}>
      <h1 className='text-2xl font-bold mb-4'>Approve Collaboration?</h1>

      <div className='flex justify-center gap-4'>
        <Button
          text='Approve'
          filled
          onClick={() => handleApproval('approve')}
        />
        <Button
          text='Decline'
          filled={false}
          onClick={() => handleApproval('decline')}
        />
      </div>

      {message && (
        <p className='mt-4 text-lg font-semibold text-blue-600'>{message}</p>
      )}
    </ResponsiveForm>
  );
};

export default CohostApproval;
