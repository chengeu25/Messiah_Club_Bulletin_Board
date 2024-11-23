import React, { useState, useEffect } from 'react';
import { useSubmit } from 'react-router-dom';
import Input from '../../../components/formElements/Input.component';
import Button from '../../../components/formElements/Button.component';
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
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [tags, setTags] = useState<{ id: number; name: string }[]>([]);
  const [error, setError] = useState<string[]>([]);
  const submit = useSubmit();

  useEffect(() => {
    const fetchTags = async () => {
      const fetchedTags = [
        { id: 1, name: 'Technology' },
        { id: 2, name: 'Sports' },
        { id: 3, name: 'Music' },
        { id: 4, name: 'Art' },
      ];
      setTags(fetchedTags);
    };

    fetchTags();
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setEventPhotos((prevPhotos) => [...prevPhotos, ...selectedFiles]);
    }
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagId = parseInt(e.target.value);
    setSelectedTags((prevSelectedTags) =>
      prevSelectedTags.includes(tagId)
        ? prevSelectedTags.filter((id) => id !== tagId)
        : [...prevSelectedTags, tagId]
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
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
    formData.append('tags', JSON.stringify(selectedTags));

    eventPhotos.forEach((photo, index) => {
      formData.append(`eventPhotos[${index}]`, photo);
    });

    submit(formData, { method: 'post' });
  };

  return (
    <ResponsiveForm onSubmit={handleSubmit}>
      <h1 className="text-2xl font-bold text-center">Create Event</h1>
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
        required
      />
      <Input
        label="Description:"
        name="description"
        type="text"
        value={description}
        onChange={(e) => setDescription((e.target as HTMLInputElement).value)}
        placeholder="Enter the event description"
        color="blue"
        filled={false}
        multiline
        required
      />
      <div>
        <label htmlFor="startDate">Start Date:<span className='text-red-500'>*</span> </label>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="MMMM d, yyyy h:mm aa"
          className="input rounded-lg border-blue-950 border-2"
        />
      </div>
      <div>
        <label htmlFor="endDate">End Date:<span className='text-red-500'>*</span> </label>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="MMMM d, yyyy h:mm aa"
          className="input rounded-lg border-blue-950 border-2"
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
        required
      />
      <div>
        <Input 
          label="Event Photos:"
          name="eventPhotos"
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          color="blue"
          filled={false}
          required
          multiple
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
      <div>
        <label htmlFor="eventTags">Event Tags: <span className='text-red-500'>*</span></label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div key={tag.id} className="flex items-center">
              <input
                type="checkbox"
                value={tag.id}
                checked={selectedTags.includes(tag.id)}
                onChange={handleTagChange}
                className="mr-2"
              />
              <span>{tag.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-row gap-2">
        <Button text="Submit" color="blue" type="submit" filled name='submit' />
        <Button text="Cancel" color="blue" filled={false} type="reset" name='cancel' />
      </div>
    </ResponsiveForm>
  );
};

export default ClubEventForm;