import { useLoaderData, Form } from 'react-router-dom';
import Select from '../../../components/formElements/Select.component';
import { Report } from '../../../reports';
import { useEffect } from 'react';
import Button from '../../../components/formElements/Button.component';

const Reports: React.FC = () => {
  const { reports } = useLoaderData() as { reports: Report[] };
  useEffect(() => {
    console.log(reports);
  }, [reports]);
  return (
    <div className='flex justify-center w-full h-full'>
      <Form
        onSubmit={async (_) => {}}
        className='flex flex-col gap-2 w-full h-full m-5 lg:w-1/2'
      >
        <div className='report'></div>
        <Select
          label='Report'
          options={reports?.map((report) => report.name)}
          name='report'
          filled={false}
        />
        <Button text='Generate Report' type='submit' />
      </Form>
    </div>
  );
};

export default Reports;
