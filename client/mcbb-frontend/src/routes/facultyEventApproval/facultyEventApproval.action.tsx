import { ActionFunction, redirect } from 'react-router-dom';

export const facultyEventApprovalAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const eventId = formData.get("event_id");
  const actionType = formData.get("action_type");

  if (actionType === "details") {
    return redirect(`/dashboard/event/${eventId}`);
  }

  const response = await fetch(`/events/${eventId}/${actionType}`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Failed to ${actionType} event`);
  }

  return response.json();
};