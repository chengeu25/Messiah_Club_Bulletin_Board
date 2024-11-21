import React, { useState } from 'react';
import { Form, useSubmit } from 'react-router-dom';
import Input from '../../../components/formElements/Input.component';
import Button from '../../../components/formElements/Button.component';
import TextArea from '../../../components/formElements/TextArea.component';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ResponsiveForm from '../../../components/formElements/ResponsiveForm';

const ClubEventForm = () => {
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [location, setLocation] = useState('');
  const [eventPhotos, setEventPhotos] = useState<File[]>([]);
  const [eventCost, setEventCost] = useState('');
  const [error, setError] = useState<string[]>([]);
  const submit = useSubmit();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setEventPhotos((prevPhotos) => [...prevPhotos, ...selectedFiles]);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const errors: string[] = [];

    if (!eventName.trim()) errors.push('Event name is required.');
    if (!description.trim()) errors.push('Event description is required.');
    if (!startDate || !endDate) errors.push('Event dates are required.');
    if (startDate && endDate && startDate > endDate)
      errors.push('Start date must be before end date.');
    if (!location.trim()) errors.push('Event location is required.');
    if (eventCost && isNaN(Number(eventCost)))
      errors.push('Event cost must be a valid number.');

    if (errors.length > 0) {
      setError(errors);
      return;
    }

    formData.append('eventName', eventName);
    formData.append('description', description);
    formData.append('startDate', startDate?.toISOString() || '');
    formData.append('endDate', endDate?.toISOString() || '');
    formData.append('location', location);
    formData.append('eventCost', eventCost);

    eventPhotos.forEach((photo, index) => {
      formData.append(`eventPhotos[${index}]`, photo);
    });

    submit(formData, { method: 'post' });
  };

  return (
    <ResponsiveForm onSubmit={function (): Promise<void> {
      throw new Error('Function not implemented.');
    } }>
      <Form
        method="post"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        encType="multipart/form-data"
      >
        <h1 className="text-2xl font-bold text-center">Create/Update Event</h1>
        {error.length > 0 && (
          <div className="text-red-500">
            {error.map((err, idx) => (
              <div key={idx}>{err}</div>
            ))}
          </div>
        )}
        <Input
          label="Event Name:"
          name="eventName"
          type="text"
          value={eventName}
          onChange={(e) => setEventName((e.target as HTMLInputElement).value)}
          placeholder="Enter the event name"
          color="blue"
          filled={false}
        />
        <label htmlFor="description">Description:</label>
        <TextArea
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter the event description"
        />
        <div>
          <label htmlFor="startDate">Start Date:</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="endDate">End Date:</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            className="input"
          />
        </div>
        <Input
          label="Location:"
          name="location"
          type="text"
          value={location}
          onChange={(e) => setLocation((e.target as HTMLInputElement).value)}
          placeholder="Enter the event location"
          color="blue"
          filled={false}
        />
        <div>
          <label htmlFor="eventPhotos">Event Photos:</label>
          <input
            type="file"
            name="eventPhotos"
            accept="image/*"
            multiple
            onChange={handlePhotoChange}
            className="input"
          />
          <p className="text-gray-500 text-sm">You can select multiple photos.</p>
          {eventPhotos.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-semibold">Selected Photos:</p>
              <ul>
                {eventPhotos.map((photo, idx) => (
                  <li key={idx} className="text-sm text-gray-700">
                    {photo.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <Input
          label="Event Cost:"
          name="eventCost"
          type="text"
          value={eventCost}
          onChange={(e) => setEventCost((e.target as HTMLInputElement).value)}
          placeholder="Enter the event cost (optional)"
          color="blue"
          filled={false}
        />
        <div className="flex flex-row gap-2">
          <Button text="Submit" color="blue" type="submit" filled />
          <Button text="Cancel" color="blue" filled={false} type="reset" />
        </div>
      </Form>
    </ResponsiveForm>
  );
};

export default ClubEventForm;
