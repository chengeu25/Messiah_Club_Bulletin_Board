import { ActionFunction, ActionFunctionArgs, json } from 'react-router';

const reportsAction: ActionFunction = async ({
  request,
  params
}: ActionFunctionArgs) => {
  const id = params?.id;
  const formData = await request.formData();

  const resp = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/reports/`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: formData.get('name'),
        category: formData.get('category'),
        objId: id
      })
    }
  );
  if (!resp.ok) {
    return json({ error: 'Failed to fetch report' }, { status: 500 });
  }
  const data = await resp.json();
  console.log(data);
  return json(data, { status: 200 });
};

export default reportsAction;
