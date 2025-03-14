import Button from '../../../components/formElements/Button.component';
import ResponsiveForm from '../../../components/formElements/ResponsiveForm';
import Loading from '../../../components/ui/Loading';
import { useNotification } from '../../../contexts/NotificationContext';
import useLoading from '../../../hooks/useLoading';

const CohostApproval = () => {
  const { addNotification } = useNotification();
  const { loading, setLoading } = useLoading();

  const handleApproval = async (decision: 'approve' | 'decline') => {
    setLoading(true);
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');
    const clubId = urlParams.get('clubId');
    const token = urlParams.get('token'); // Extract JWT token from URL

    if (!eventId || !clubId || !token) {
      addNotification('Missing eventId, clubId, or token in URL.', 'error');
      setLoading(false);
      return;
    }

    const response = await fetch(
      `${
        import.meta.env.VITE_API_BASE_URL
      }/api/events/${decision}-collaboration`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Send token in header
        },
        body: JSON.stringify({ eventId, clubId })
      }
    );

    const data = await response.json();
    if (response.ok) {
      addNotification(data.message, 'success'); // Show success message
    } else {
      addNotification(data.message, 'error'); // Show error message
    }
    setLoading(false);
  };

  return loading ? (
    <Loading />
  ) : (
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
    </ResponsiveForm>
  );
};

export default CohostApproval;
