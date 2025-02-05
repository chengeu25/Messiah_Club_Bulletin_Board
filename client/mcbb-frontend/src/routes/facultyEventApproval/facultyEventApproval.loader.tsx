import { json, LoaderFunction, redirect } from 'react-router';
import checkUser from '../../helper/checkUser';
import { UserType as User } from '../../types/databaseTypes';

const facultyEventApprovalloader: LoaderFunction = async ({ request }) => {
  const user = await checkUser();
  if (user === false) {
    return redirect('/login?serviceTo=' + new URL(request.url).pathname);
  }
  if ((user as User).isFaculty === false) {
    return redirect('/dashboard/home');
  }

  const url = new URL(request.url);
  const startDate = url.searchParams.get("start_date") || new Date().toISOString();
  const endDate = url.searchParams.get("end_date") || new Date(new Date().setDate(new Date().getDate() + 7)).toISOString();
  const schoolId = url.searchParams.get("school_id") || '';
  const userId = url.searchParams.get("user_id") || '';

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/events/events?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}&school_id=${encodeURIComponent(schoolId)}&user_id=${encodeURIComponent(userId)}&approved=false`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch unapproved events: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Received non-JSON response from server:", text);
      throw new Error("Received non-JSON response from server");
    }

    const data = await response.json();
    return json({ user: user, events: data.events || [] }, { status: 200 });
  } catch (error) {
    console.error("Error fetching unapproved events:", error);
    return json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
};

export default facultyEventApprovalloader;