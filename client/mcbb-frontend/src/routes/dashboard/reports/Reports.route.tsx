import { useLoaderData, Form, useActionData } from 'react-router-dom';
import Select from '../../../components/formElements/Select.component';
import Button from '../../../components/formElements/Button.component';
import { downloadCSV, downloadPDF } from '../../../helper/reportDownloaders';
import { useEffect, useState } from 'react';
import { useSchool } from '../../../contexts/SchoolContext';
import { useNotification } from '../../../contexts/NotificationContext';

const Reports: React.FC = () => {
  const { reports, category } = useLoaderData() as {
    reports: string[];
    category: string;
  };
  const actionData = useActionData() as {
    error?: string;
    report?: string[][];
    columns?: string[];
  } | null;
  const [reportName, setReportName] = useState<string>(reports[0]);
  const { currentSchool } = useSchool();
  const { addNotification } = useNotification();

  useEffect(() => {
    if (actionData?.error) {
      addNotification(actionData.error, 'error');
    }
  }, [actionData]);

  return (
    <div className='flex flex-col items-center w-full h-full p-5 relative'>
      <Form method='post' className='flex flex-col gap-2 w-full m-5 lg:w-1/2'>
        <div className='report'></div>
        <Select
          label='Report'
          options={reports}
          name='name'
          filled={false}
          onChange={(e) => {
            setReportName(e!.target.value);
          }}
          value={reportName}
        />
        <input type='hidden' name='category' value={category} />
        <Button text='Generate Report' type='submit' />
        {actionData?.report !== undefined && actionData?.report !== null && (
          <div className='flex flex-row gap-2'>
            <Button
              text='Download Report as CSV'
              type='button'
              onClick={() =>
                downloadCSV(actionData.columns!, actionData.report!)
              }
            />
            <Button
              text='Download Report as PDF'
              type='button'
              onClick={() =>
                downloadPDF(
                  reportName,
                  actionData.columns!,
                  actionData.report!,
                  currentSchool?.logo
                )
              }
            />
          </div>
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
                      {typeof value === 'string' && !isNaN(Date.parse(value))
                        ? new Date(value).toLocaleString(undefined, {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })
                        : value}
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
