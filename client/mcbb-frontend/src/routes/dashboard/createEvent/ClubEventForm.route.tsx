import React, { useState, useEffect, useMemo } from 'react';
import {
  useSubmit,
  useSearchParams,
  useParams,
  useLoaderData
} from 'react-router-dom';
import Input from '../../../components/formElements/Input.component';
import Button from '../../../components/formElements/Button.component';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ResponsiveForm from '../../../components/formElements/ResponsiveForm';
import Select from 'react-select';
import { OptionType } from '../../../components/formElements/Select.styles';
import { ClubType } from '../../../types/databaseTypes';

const ClubEventForm = () => {
  const [searchParams] = useSearchParams();
  const serverError = searchParams.get('error'); // Retrieve "error" from query parameters

  const { clubs } = useLoaderData() as { clubs: ClubType[] };
  const { id: clubId } = useParams();
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [location, setLocation] = useState('');
  const [eventPhotos, setEventPhotos] = useState<File[]>([]);
  const [eventCost, setEventCost] = useState('');
  const [tags, setTags] = useState<OptionType[]>([]); // List of available tags
  const [selectedTags, setSelectedTags] = useState<OptionType[]>([]); // Tags selected by the user
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [selectedClubs, setSelectedClubs] = useState<OptionType[]>([]);
  const selectableClubs = useMemo(() => {
    return clubs.map(
      (club: ClubType) =>
        ({
          value: club.id,
          label: club.name
        } as OptionType)
    );
  }, [clubs]);
  const submit = useSubmit();

  // Fetch tags from the API
  useEffect(() => {
    fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/interests/get-available-tags`,
      {
        credentials: 'include'
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.tags) {
          setTags(
            data.tags.map(
              (tag: { tag: any; tag_id: any; id: number; name: string }) => ({
                value: tag.tag_id,
                label: tag.tag
              })
            )
          );
        } else {
          console.error('No tags found in the API response');
        }
      })
      .catch((error) => console.error('Error fetching tags:', error));
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setEventPhotos((prevPhotos) => [...prevPhotos, ...selectedFiles]);
    }
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    const errors: string[] = [];
  
    // Validation checks
    if (!eventName.trim()) errors.push('Event name is required.');
    if (!description.trim()) errors.push('Event description is required.');
    if (!startDate || !endDate) errors.push('Event dates are required.');
    if (startDate && endDate && startDate > endDate)
      errors.push('Start date must be before end date.');
    if (!location.trim()) errors.push('Event location is required.');
    if (eventCost && isNaN(Number(eventCost)))
      errors.push('Event cost must be a valid number.');
    if (eventPhotos.length === 0)
      errors.push('At least one event photo is required.');
  
    // If there are validation errors, return early
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
  
    // Form data to send in the request
    const formData = new FormData();
    formData.append('clubId', clubId?.toString() ?? '');  // Include clubId
    formData.append('eventName', eventName);
    formData.append('description', description);
    formData.append('startDate', startDate?.toISOString() || '');
    formData.append('endDate', endDate?.toISOString() || '');
    formData.append('location', location);
    formData.append('eventCost', eventCost);
    formData.append(
      'tags',
      JSON.stringify(selectedTags.map((tag) => tag.value))
    );
    formData.append(
      'cohosts',
      JSON.stringify(selectedClubs.map((club) => club.value))
    );
  
    // Add event photos to form data
    eventPhotos.forEach((photo, index) => {
      formData.append(`eventPhotos[${index}]`, photo);
    });
  
    // Log the clubId and other form data for debugging
    console.log('clubId:', clubId);
    console.log('formData:', formData);
  
    // Submit the form data
    submit(formData, { method: 'post' });
  };
  

  return (
    <ResponsiveForm onSubmit={handleSubmit}>
      <h1 className='text-2xl font-bold text-center'>Create Event</h1>

      {serverError && (
        <div className='bg-red-100 text-red-700 p-3 rounded mb-4'>
          <strong>Error:</strong> {serverError}
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className='text-red-500'>
          {validationErrors.map((err, idx) => (
            <div key={idx}>{err}</div>
          ))}
        </div>
      )}

      <Input
        label='Event Name:'
        name='eventName'
        type='text'
        value={eventName}
        onChange={(e) => setEventName((e.target as HTMLInputElement).value)}
        placeholder='Enter the event name'
        filled={false}
        required
      />
      <Input
        label='Description:'
        name='description'
        type='text'
        value={description}
        onChange={(e) => setDescription((e.target as HTMLInputElement).value)}
        placeholder='Enter the event description'
        filled={false}
        multiline
        required
      />
      <div>
        <label htmlFor='startDate'>Start Date:</label>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          showTimeSelect
          timeFormat='HH:mm'
          timeIntervals={15}
          dateFormat='MMMM d, yyyy h:mm aa'
          className='input rounded-lg foreground-outlined border-2'
        />
      </div>
      <div>
        <label htmlFor='endDate'>End Date:</label>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          showTimeSelect
          timeFormat='HH:mm'
          timeIntervals={15}
          dateFormat='MMMM d, yyyy h:mm aa'
          className='input rounded-lg foreground-outlined border-2'
        />
      </div>
      <Input
        label='Location:'
        name='location'
        type='text'
        value={location}
        onChange={(e) => setLocation((e.target as HTMLInputElement).value)}
        placeholder='Enter the event location'
        filled={false}
        required
      />
      <div>
        <Input
          label='Event Photos:'
          name='eventPhotos'
          type='file'
          accept='image/*'
          onChange={handlePhotoChange}
          filled={false}
          required
          multiple
        />
        <p className='text-gray-500 text-sm'>You can select multiple photos.</p>
        {eventPhotos.length > 0 && (
          <div className='mt-2'>
            <p className='text-sm font-semibold'>Selected Photos:</p>
            <ul>
              {eventPhotos.map((photo, idx) => (
                <li key={idx} className='text-sm text-gray-700'>
                  {photo.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <Input
        label='Event Cost:'
        name='eventCost'
        type='text'
        value={eventCost}
        onChange={(e) => setEventCost((e.target as HTMLInputElement).value)}
        placeholder='Enter the event cost (optional)'
        filled={false}
      />
      <div>
        <label htmlFor='tags'>Event Tags:</label>
        <Select
          isMulti
          options={tags}
          onChange={(selected) => setSelectedTags(selected as OptionType[])}
          menuPortalTarget={document.body}
          menuPosition='fixed'
          styles={{
            menuPortal: (base) => ({
              ...base,
              zIndex: 9999
            })
          }}
        />
      </div>
      <div>
        <label htmlFor='coHosts'>Co-Hosts:</label>
        <Select
          isMulti
          options={selectableClubs}
          value={selectedClubs}
          onChange={(selected) => setSelectedClubs(selected as OptionType[])}
          menuPortalTarget={document.body}
          menuPosition='fixed'
          styles={{
            menuPortal: (base) => ({
              ...base,
              zIndex: 9999
            })
          }}
        />
      </div>
      <div className='flex flex-row gap-2'>
        <Button text='Submit' type='submit' filled name='submit' />
        <Button text='Cancel' filled={false} type='reset' name='cancel' />
      </div>
    </ResponsiveForm>
  );
};

export default ClubEventForm;
