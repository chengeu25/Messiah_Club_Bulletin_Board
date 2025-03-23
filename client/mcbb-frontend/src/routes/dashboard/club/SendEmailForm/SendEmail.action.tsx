import { ActionFunction, redirect } from 'react-router-dom';

const sendEmailAction: ActionFunction = async ({ request }) => {
  let formData: FormData;
  let fallbackClubId = '';
  try {
    formData = await request.formData();
    fallbackClubId = formData.get('clubId') as string;
    const clubId = formData.get('clubId') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    if (!clubId || !subject || !message) {
      return redirect(
        `/dashboard/club/${clubId}?error=All fields are required.`
      );
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/clubs/club/${clubId}/sendEmail`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subject, message })
      }
    );

    if (response.ok) {
      return redirect(
        `/dashboard/club/${clubId}?success=Email sent successfully.`
      );
    } else {
      const errorData = await response.json();
      return redirect(
        `/dashboard/club/${clubId}?error=${encodeURIComponent(
          errorData.message || 'Failed to send email.'
        )}`
      );
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return redirect(
      `/dashboard/club/${fallbackClubId}?error=Something went wrong. Please try again later.`
    );
  }
};

export default sendEmailAction;
