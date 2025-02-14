import { ActionFunction, redirect, json } from 'react-router-dom';

export const facultyEventApprovalAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const eventId = formData.get("event_id");
  const actionType = formData.get("action_type");

  if (actionType === "details") {
    return redirect(`/dashboard/event/${eventId}`);
  }

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/events/${actionType}`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ event_id: eventId })
  });

  if (!response.ok) {
    const result = await response.json();
    return json({ success: false, message: `Failed to ${actionType} event: ${result.error}` }, { status: response.status });
  }

  return json({ success: true, message: `Event ${actionType}d successfully` });
};