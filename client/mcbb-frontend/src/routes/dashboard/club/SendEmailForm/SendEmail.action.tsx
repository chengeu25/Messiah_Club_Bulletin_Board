import { ActionFunction, json, redirect } from 'react-router-dom';

const sendEmailAction: ActionFunction = async ({ request }) => {
  try {
    // Get the FormData from the request
    const formData = await request.formData();

    // Extract data from FormData
    const clubId = formData.get('clubId') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    // Check if any of the required fields are missing
    if (!clubId || !subject || !message) {
      return json({ error: 'All fields are required.' }, { status: 400 });
    }

    // Send the email to the backend
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/clubs/club/${clubId}/sendEmail`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subject, message }) // Send only subject and message (no clubId in body)
      }
    );

    // If the email is sent successfully, redirect to the club page
    if (response.ok) {
      return redirect(`/dashboard/club/${clubId}`);
    } else {
      // Handle error response from backend
      const errorData = await response.json();
      return json(
        { error: errorData.message || 'Failed to send email.' },
        { status: response.status }
      );
    }
  } catch (error) {
    // General error handling for unexpected issues
    console.error('Error sending email:', error);
    return json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
};

export default sendEmailAction;
