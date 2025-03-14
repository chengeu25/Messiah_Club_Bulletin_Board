import React, { useEffect, useState } from 'react';
import {
  useNavigate,
  useParams,
  Form,
  useActionData,
  useSubmit
} from 'react-router-dom'; // Import Form from 'react-router-dom'
import Button from '../../../../components/formElements/Button.component';
import Card from '../../../../components/ui/Card';
import useLoading from '../../../../hooks/useLoading';
import Loading from '../../../../components/ui/Loading';
import { useNotification } from '../../../../contexts/NotificationContext';

const SendEmailForm = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });

  const { loading, setLoading } = useLoading();
  const actionData = useActionData() as { error?: string };
  const submit = useSubmit();

  const { addNotification } = useNotification();

  useEffect(() => {
    setLoading(false);
    if (actionData?.error) {
      addNotification(actionData.error, 'error');
    }
  }, [actionData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;
    const clubId = formData.get('clubId') as string;

    if (subject && message && clubId) {
      submit({ subject, message, clubId }, { method: 'post' });
    } else {
      setLoading(false);
    }
  };

  return loading ? (
    <Loading />
  ) : (
    <div className='w-full flex flex-col items-center p-4 sm:px-[10%]'>
      <Card color='gray-300' padding={4} className='w-full flex flex-col gap-4'>
        <h1 className='text-2xl font-bold'>Send Email</h1>
        <Form
          method='post'
          className='flex flex-col gap-4'
          onSubmit={handleSubmit}
        >
          <input type='hidden' name='clubId' value={clubId} />
          <div>
            <label htmlFor='subject' className='block font-medium mb-2'>
              Subject
            </label>
            <input
              type='text'
              id='subject'
              name='subject'
              value={formData.subject}
              onChange={handleChange}
              className='w-full p-2 border rounded-lg'
              required
            />
          </div>
          <div>
            <label htmlFor='message' className='block font-medium mb-2'>
              Message
            </label>
            <textarea
              id='message'
              name='message'
              value={formData.message}
              onChange={handleChange}
              rows={5}
              className='w-full p-2 border rounded-lg'
              required
            />
          </div>
          <div className='flex gap-4'>
            <Button text='Send' filled={true} type='submit' />
            <Button
              text='Cancel'
              filled={false}
              type='button'
              onClick={() => navigate(-1)}
            />
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default SendEmailForm;
