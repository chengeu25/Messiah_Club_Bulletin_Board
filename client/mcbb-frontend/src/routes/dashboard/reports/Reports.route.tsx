import { useLoaderData, Form, useActionData } from 'react-router-dom';
import Select from '../../../components/formElements/Select.component';
import { Report } from '../../../reports';
import Button from '../../../components/formElements/Button.component';
import { downloadCSV } from '../../../helper/reportDownloaders';

const Reports: React.FC = () => {
  const { reports } = useLoaderData() as { reports: Report[] };
  const actionData = useActionData() as {
    error?: string;
    report?: string[][];
    columns?: string[];
  } | null;

  return (
    <div className='flex flex-col items-center w-full h-full p-5 relative'>
      <Form method='post' className='flex flex-col gap-2 w-full m-5 lg:w-1/2'>
        <div className='report'></div>
        <Select
          label='Report'
          options={reports?.map((report) => report.name)}
          name='report'
          filled={false}
        />
        <Button text='Generate Report' type='submit' />
        {actionData?.report !== undefined && actionData?.report !== null && (
          <Button
            text='Download Report as CSV'
            type='button'
            onClick={() => downloadCSV(actionData.columns!, actionData.report!)}
          />
        )}
      </Form>
      {actionData?.report !== undefined && actionData?.report !== null && (
        <div className='flex-grow w-full overflow-auto'>
          <table className='w-full border-collapse border border-black'>
            <thead className='border border-black'>
              <tr className='border border-black'>
                {actionData?.columns?.map((column) => (
                  <th className='border border-black' key={column}>
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='border border-black'>
              {actionData?.report.map((row, index) => (
                <tr className='border border-black' key={index}>
                  {Object.values(row).map((value, index) => (
                    <td className='border border-black' key={index}>
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Reports;
