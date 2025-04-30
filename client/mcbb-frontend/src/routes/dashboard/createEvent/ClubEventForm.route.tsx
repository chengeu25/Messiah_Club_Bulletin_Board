import React, { useState, useEffect, useMemo } from 'react';
import {
  useSubmit,
  useParams,
  useLoaderData,
  useActionData,
  useNavigate
} from 'react-router-dom';
import Input from '../../../components/formElements/Input.component';
import Button from '../../../components/formElements/Button.component';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ResponsiveForm from '../../../components/formElements/ResponsiveForm';
import Select from 'react-select';
import { OptionType } from '../../../components/formElements/Select.styles';
import { ClubType } from '../../../types/databaseTypes';
import useLoading from '../../../hooks/useLoading';
import Loading from '../../../components/ui/Loading';
import { useNotification } from '../../../contexts/NotificationContext';

const ClubEventForm = () => {
  const { loading, setLoading } = useLoading();
  const actionData = useActionData() as {
    message?: string;
    redirectTo?: string;
    error?: string;
  };
  const { addNotification } = useNotification();
  const navigate = useNavigate();

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
  const [genderRestriction, setGenderRestriction] = useState('none');
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

  // If the action data is available, handle the message and redirect to the specified URL
  useEffect(() => {
    if (actionData) {
      if (actionData?.error) {
        addNotification(actionData.error, 'error');
      }
      if (actionData?.message) {
        addNotification(actionData.message, 'success');
      }
      if (actionData?.redirectTo) {
        navigate(actionData.redirectTo);
      }
    }
  }, [actionData]);

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

  /**
   * Resizes an image to a maximum width and height.
   * @param dataUrl - The data URL of the image to resize.
   * @param maxWidth - The maximum width of the resized image.
   * @param maxHeight - The maximum height of the resized image.
   * @returns A promise that resolves to the resized image data URL.
   */
  const resizeImage = async (
    dataUrl: string,
    maxWidth: number,
    maxHeight: number
  ) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = dataUrl;

      img.onload = () => {
        // Create a canvas to resize the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate the new dimensions
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        // Set the canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw the image on the canvas
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert the canvas to a data URL
        const resizedImage = canvas.toDataURL('image/jpeg');
        resolve(resizedImage);
      };

      img.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      selectedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const resizedImage = await resizeImage(
              reader.result as string,
              1000,
              1000
            );
            const blob = await (await fetch(resizedImage as string)).blob();
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg'
            });
            setEventPhotos((prevPhotos) => [...prevPhotos, compressedFile]);
          } catch (e) {
            console.error(e);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemovePhoto = (index: number) => {
    setEventPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    setLoading(true);
    const errors: string[] = [];

    const now = new Date();

    // Validation checks
    if (!eventName.trim()) errors.push('Event name is required.');
    if (!description.trim()) errors.push('Event description is required.');
    if (!startDate || !endDate) errors.push('Event dates are required.');
    if (startDate && endDate && startDate > endDate)
      errors.push('Start date must be before end date.');
    if (startDate && startDate < now)
      errors.push('Start date must be in the future.');
    if (!location.trim()) errors.push('Event location is required.');
    if (eventCost && isNaN(Number(eventCost)))
      errors.push('Event cost must be a valid number.');
    if (eventPhotos.length === 0)
      errors.push('At least one event photo is required.');

    // If there are validation errors, return early
    if (errors.length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }

    // Form data to send in the request
    const formData = new FormData();
    formData.append('clubId', clubId?.toString() ?? ''); // Include clubId
    formData.append('eventName', eventName);
    formData.append('description', description);
    formData.append('startDate', startDate?.toISOString() || '');
    formData.append('endDate', endDate?.toISOString() || '');
    formData.append('location', location);
    formData.append('eventCost', eventCost);
    formData.append('genderRestriction', genderRestriction);
    formData.append(
      'tags',
      JSON.stringify(selectedTags.map((tag) => tag.value))
    );
    formData.append(
      'cohosts',
      JSON.stringify(selectedClubs.map((club) => club.value))
    );

    // Add event photos to form data
    eventPhotos.forEach((photo) => {
      formData.append('eventPhotos', photo);
    });

    // Log form data for debugging
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    // Submit the form data
    submit(formData, { method: 'post', encType: 'multipart/form-data' });
  };

  const handleCancel = () => {
    navigate(`/dashboard/club/${clubId}`);
  };

  return loading ? (
    <Loading />
  ) : (
    <ResponsiveForm onSubmit={handleSubmit} encType='multipart/form-data'>
      <h1 className='text-2xl font-bold text-center'>Create Event</h1>

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
                <li
                  key={idx}
                  className='text-sm text-gray-700 flex items-center'
                >
                  {photo.name}
                  <button
                    type='button'
                    onClick={() => handleRemovePhoto(idx)}
                    className='ml-2 text-red-500'
                  >
                    Remove
                  </button>
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
      <div className='mb-4'>
        <label htmlFor='genderRestriction' className='block'>
          Only Allow Attendees of Gender:
        </label>
        <select
          id='genderRestriction'
          name='genderRestriction'
          value={genderRestriction}
          onChange={(e) => setGenderRestriction(e.target.value)}
          className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
        >
          <option value='none'>None</option>
          <option value='male'>Male</option>
          <option value='female'>Female</option>
        </select>
      </div>
      <div className='flex flex-row gap-2'>
        <Button text='Submit' type='submit' filled name='submit' />
        <Button
          text='Cancel'
          filled={false}
          type='button'
          name='cancel'
          onClick={handleCancel}
        />
      </div>
    </ResponsiveForm>
  );
};

export default ClubEventForm;
