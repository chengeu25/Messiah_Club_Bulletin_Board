import React, { useState, useEffect } from 'react';
import { useParams, useLoaderData, useSubmit } from 'react-router-dom';
import Button from '../../../components/formElements/Button.component';

const CohostApproval = () => {
    return <div>waz gud</div>;
//   const { eventId } = useParams(); // Get event ID from URL params
//   const submit = useSubmit();
//   const { eventDetails } = useLoaderData();

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [event, setEvent] = useState(null);

//   useEffect(() => {
//     fetch(`${import.meta.env.VITE_API_BASE_URL}/api/events/${eventId}`, {
//       credentials: 'include',
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         if (data.event) {
//           setEvent(data.event);
//         } else {
//           setError('Event not found');
//         }
//         setLoading(false);
//       })
//       .catch((err) => {
//         setError('Error fetching event details');
//         setLoading(false);
//       });
//   }, [eventId]);

//   const handleApproval = (status) => {
//     const formData = new FormData();
//     formData.append('eventId', eventId);
//     formData.append('status', status);
//     submit(formData, { method: 'post', action: '/api/events/cohost-approval' });
//   };

//   if (loading) return <p>Loading event details...</p>;
//   if (error) return <p className='text-red-500'>{error}</p>;

//   return (
//     <div className='p-6 bg-white shadow-md rounded-lg'>
//       <h1 className='text-2xl font-bold text-center mb-4'>Cohost Approval</h1>
//       <h2 className='text-xl font-semibold'>{event.eventName}</h2>
//       <p className='text-gray-700'>{event.description}</p>
//       <p className='text-gray-600 mt-2'>Location: {event.location}</p>
//       <p className='text-gray-600'>Start: {new Date(event.startDate).toLocaleString()}</p>
//       <p className='text-gray-600'>End: {new Date(event.endDate).toLocaleString()}</p>
//       <p className='text-gray-600'>Cost: {event.eventCost ? `$${event.eventCost}` : 'Free'}</p>

//       <div className='flex flex-row gap-4 mt-4'>
//         <Button text='Approve' filled name='approve' onClick={() => handleApproval('approved')} />
//         <Button text='Decline' filled={false} name='decline' onClick={() => handleApproval('declined')} />
//       </div>
//     </div>
//   );
};

export default CohostApproval;
