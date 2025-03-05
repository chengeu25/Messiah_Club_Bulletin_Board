import { ActionFunctionArgs, json } from 'react-router';
import { Report } from '../../../reports';

const reportsAction: (
  reports: Report[]
) => ({ request, params }: ActionFunctionArgs) => Promise<Response | null> =
  (reports) =>
  async ({ request, params }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const reportName = formData.get('report');
    const report = reports.find((report: Report) => report.name === reportName);
    const id = params?.id;

    if (report) {
      try {
        const resp = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/reports/`,
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              objId: id,
              query: report.query,
              params: report.queryParams,
              access: report.accessControl
            })
          }
        );
        if (!resp.ok) {
          return json({ error: 'Failed to fetch report' }, { status: 500 });
        }
        const data = await resp.json();
        console.log(data);
        return json(data, { status: 200 });
      } catch (error) {
        console.error(error);
      }
    }
    return null;
  };

export default reportsAction;
