import { ActionFunction, redirect } from 'react-router-dom';

const clubFormAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get('action');
  if (action === 'cancel') {
    return redirect('/dashboard/clubs');
  } else if (action === 'create') {
    const resp = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/clubs/new-club`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.get('name'),
          description: formData.get('description'),
          admins: JSON.parse(formData.get('admins') as string),
          images: JSON.parse(formData.get('images') as string),
          image: formData.get('logo'),
          tags: JSON.parse(formData.get('tags') as string)
        })
      }
    );
    if (resp.ok) {
      return redirect('/dashboard/clubs');
    }
    const json = await resp.json();
    return redirect('/dashboard/club/new?error=' + json.error);
  } else if (action === 'delete') {
    return redirect('/dashboard/clubs', {});
  } else if (action === 'update') {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const resp = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/clubs/update-club`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          id: formData.get('id'),
          name: formData.get('name'),
          description: formData.get('description'),
          admins: JSON.parse(formData.get('admins') as string),
          images: JSON.parse(formData.get('images') as string),
          image: formData.get('logo'),
          tags: JSON.parse(formData.get('tags') as string)
        })
      }
    );
    if (resp.ok) {
      return redirect('/dashboard/clubs');
    }
    const json = await resp.json();
    return redirect(`${pathname}?error=` + json.error);
  }
};

export default clubFormAction;
