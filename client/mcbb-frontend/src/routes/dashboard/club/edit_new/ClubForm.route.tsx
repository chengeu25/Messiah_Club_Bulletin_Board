import { useLoaderData } from 'react-router';
import Input from '../../../../components/formElements/Input.component';
import {
  ClubAdminType,
  ClubDetailType,
  ImageType,
  UserType
} from '../../../../types/databaseTypes';
import Button from '../../../../components/formElements/Button.component';
import ResponsiveForm from '../../../../components/formElements/ResponsiveForm';
import { useEffect, useState } from 'react';
import { CiCirclePlus, CiTrash } from 'react-icons/ci';
import { useSearchParams, useSubmit } from 'react-router-dom';
import validateFileSize from '../../../../helper/fileSizeValidator';
import Select from 'react-select';
import { OptionType } from '../../../../components/formElements/Select.styles';

interface LoaderData {
  user: UserType;
  club: ClubDetailType;
  tagsAvailable: OptionType[];
}

/**
 * ClubForm component for creating or updating club details.
 */
const ClubForm = () => {
  const submit = useSubmit();
  const [params] = useSearchParams();
  const data = useLoaderData() as LoaderData | null;
  const { user, club, tagsAvailable } = data || {};

  const [error, setError] = useState<string[]>([]);
  const [newAdminError, setNewAdminError] = useState<string>('');
  const [adminErrors, setAdminErrors] = useState<number[]>([]);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [tags, setTags] = useState<OptionType[]>([]);
  const [admins, setAdmins] = useState<ClubAdminType[]>([]);
  const [newAdmin, setNewAdmin] = useState<string>('');
  const [images, setImages] = useState<ImageType[]>([]);
  const [image, setImage] = useState<string>('');
  const [highestImageId, setHighestImageId] = useState<number>(0);
  const [highestAdminId, setHighestAdminId] = useState<number>(0);

  /**
   * Adds a new admin to the list of admins.
   * @param newAdmin - The email of the new admin.
   */
  const addAdmin = (newAdmin: string) => {
    setAdmins((prevAdmins) => [
      ...prevAdmins,
      { user: newAdmin, id: highestAdminId + 1 } as ClubAdminType
    ]);
  };

  /**
   * Updates an admin's email.
   * @param id - The ID of the admin to update.
   * @param newAdmin - The new email for the admin.
   */
  const updateAdmin = (id: number, newAdmin: string) => {
    if (newAdmin !== '' && !newAdmin.endsWith('@messiah.edu'))
      setAdminErrors((prevErrors) => [...prevErrors, id]);
    else setAdminErrors((prevErrors) => prevErrors.filter((e) => e !== id));
    setAdmins((prevAdmins) =>
      prevAdmins.map((admin) => {
        if (admin.id === id) {
          return { ...admin, user: newAdmin };
        }
        return admin;
      })
    );
  };

  /**
   * Removes an admin from the list.
   * @param id - The ID of the admin to remove.
   */
  const removeAdmin = (id: number) => {
    setAdmins((prevAdmins) => prevAdmins.filter((admin) => admin.id !== id));
  };

  /**
   * Adds a new image to the club's image list.
   * @param file - The image file to add.
   */
  const addImage = (file: File) => {
    if (file) {
      const isValid = validateFileSize(file);
      if (!isValid) {
        alert('Your image was not uploaded. It must be less than 16MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prevImages) => [
          ...prevImages,
          {
            image: reader.result as string,
            id: highestImageId + 1
          } as ImageType
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Removes an image from the club's image list.
   * @param id - The ID of the image to remove.
   */
  const removeImage = (id: number) => {
    setImages((prevImages) => prevImages.filter((image) => image.id !== id));
  };

  /**
   * Sets the club's logo.
   * @param file - The image file to set as the logo.
   */
  const setLogo = (file: File) => {
    if (file) {
      const isValid = validateFileSize(file);
      if (!isValid) {
        alert('Your image was not uploaded. It must be less than 16MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Handles form submission.
   * @param event - The form submission event.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const action = (
      (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
    ).name;
    if (action === 'create' || action === 'update') {
      // Validate form
      const newErrors = [
        name === '' && 'Please enter a name.',
        description === '' && 'Please enter a description.',
        admins.length === 0 && 'Please add at least one officer.',
        image === '' &&
          (formData.get('image') as File)?.name === '' &&
          'Please add a club logo.',
        image === '' &&
          (formData.get('image') as File)?.name !== '' &&
          'Please click the add logo button.',
        images.length === 0 &&
          (formData.get('images-new') as File)?.name === '' &&
          'Please add at least one image.',
        images.length === 0 &&
          (formData.get('images-new') as File)?.name !== '' &&
          'Please click the add image button.',
        tags.length === 0 && 'Please add at least one tag.'
      ].filter(Boolean) as string[];

      // Don't submit if form validation fails
      if (newErrors.length > 0 || adminErrors.length > 0) {
        setError(newErrors);
        return;
      }

      // Add admins and images to form
      formData.append('action', action);
      formData.append('admins', JSON.stringify(admins));
      formData.append('logo', image);
      formData.append('images', JSON.stringify(images));
      formData.append('tags', JSON.stringify(tags));

      // Submit form
      submit(formData, { method: 'post' });

      // Handle intermediate form actions
    } else if (action === 'add-admin') {
      if (
        formData.get('admins-new') === '' ||
        !(formData.get('admins-new') as string)?.endsWith('@messiah.edu')
      ) {
        return;
      }
      addAdmin(formData.get('admins-new') as string);
      setNewAdmin('');
    } else if (action.startsWith('remove-admin-')) {
      removeAdmin(parseInt(action.split('-')[2]));
    } else if (action === 'add-image') {
      if (!(formData.get('images-new') as File)?.type.startsWith('image/')) {
        return;
      }
      addImage(formData.get('images-new') as File);
    } else if (action.startsWith('remove-image-')) {
      removeImage(parseInt(action.split('-')[2]));
    } else if (action === 'set-logo') {
      setLogo(formData.get('image') as File);
    } else if (action === 'cancel') {
      formData.append('action', action);
      submit(formData, { method: 'post' });
    }
    return;
  };

  // Load existing club data if available
  useEffect(() => {
    if (club) {
      setName(club?.name ?? '');
      setDescription(club?.description ?? '');
      setAdmins(club?.admins ?? []);
      setImages(club?.images ?? []);
      setImage(club?.image ?? '');
      setTags(club?.tags ?? []);
    }
  }, [club]);

  // Handle error messages from URL parameters
  useEffect(() => {
    if (params.get('error')) {
      setError([params.get('error') as string]);
    }
  }, [params]);

  // Update highest image and admin IDs
  useEffect(() => {
    setHighestImageId(
      images.length > 0 ? Math.max(...images.map((image) => image.id)) : 0
    );
    setHighestAdminId(
      admins.length > 0 ? Math.max(...admins.map((admin) => admin.id)) : 0
    );
  }, [images, admins]);

  return (
    <ResponsiveForm onSubmit={handleSubmit}>
      <h1 className='text-3xl font-bold'>{club ? 'Update' : 'Create'} Club</h1>
      {error && (
        <div className='text-red-500'>
          {error.map((e, i) => (
            <div key={i}>{e}</div>
          ))}
        </div>
      )}
      {club && <input type='hidden' name='id' value={club.id} />}
      <Input
        label='Name:'
        name='name'
        type='text'
        value={name}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setName(e.target.value)
        }
        color='blue'
        filled={false}
        placeholder='Enter the name of the club'
        required
      />
      <Input
        label='Description:'
        name='description'
        type='text'
        value={description}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setDescription(e.target.value)
        }
        color='blue'
        filled={false}
        placeholder='Tell us a little bit about this club...'
        multiline
        required
      />
      <div>
        Tags:<span className='text-red-500'>*</span>
      </div>
      <Select
        isMulti
        value={tags}
        options={tagsAvailable}
        onChange={(value) => setTags(value as OptionType[])}
        styles={{
          control: (base) => ({
            ...base,
            'borderColor': 'black',
            'borderWidth': '2px',
            'borderRadius': '0.5rem',
            '&:hover': {
              borderColor: '#1A2551'
            }
          })
        }}
      />
      {/* This row checks if this is a create form (i.e. no user because no loader data) or if the user is a faculty
          member since only faculty should be able to add/remove admins */}
      {(!user || user?.isFaculty) && (
        <>
          {' '}
          <span className='flex flex-row justify-start'>
            Club Officers:<span className='text-red-500'>*</span>
          </span>
          <ul className='flex flex-col gap-2 list-disc'>
            {admins.map((user, idx) => (
              <li key={idx} className='flex-col inline-flex gap-2'>
                {adminErrors.includes(user.id) && (
                  <span className='text-red-500'>
                    Please enter a valid Messiah email.
                  </span>
                )}
                <div className='flex flex-row items-center gap-2'>
                  <span className='flex-grow'>
                    <Input
                      value={user.user}
                      type='text'
                      name={`admin-${user.id}`}
                      label=''
                      color='blue'
                      filled={false}
                      placeholder='officeremail@domain.edu'
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateAdmin(user.id, e.target.value)
                      }
                    />
                  </span>
                  <Button
                    text='Remove'
                    color='blue'
                    filled={false}
                    className='inline-flex flex-row items-center justify-center gap-2 h-12'
                    icon={<CiTrash size={20} />}
                    grow={false}
                    name={`remove-admin-${user.id}`}
                    type='submit'
                  />
                </div>
              </li>
            ))}
            <li className='flex-col inline-flex gap-2'>
              {newAdminError && (
                <span className='text-red-500'>{newAdminError}</span>
              )}
              <div className='flex flex-row items-center gap-2'>
                <span className='flex-grow'>
                  <Input
                    type='text'
                    name='admins-new'
                    label=''
                    color='blue'
                    filled={false}
                    placeholder='officeremail@domain.edu'
                    value={newAdmin}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      if (
                        !e.target.value.endsWith('@messiah.edu') &&
                        e.target.value !== ''
                      )
                        setNewAdminError('Please enter a valid Messiah email.');
                      else setNewAdminError('');
                      setNewAdmin(e.target.value);
                    }}
                  />
                </span>
                <Button
                  text='Add'
                  color='blue'
                  filled={false}
                  className='inline-flex flex-row items-center justify-center gap-2'
                  icon={<CiCirclePlus size={20} />}
                  grow={false}
                  name='add-admin'
                  type='submit'
                />
              </div>
            </li>
          </ul>
        </>
      )}
      <div className='flex flex-row gap-2 items-center'>
        <Input
          required
          label='Club Logo: '
          type='file'
          accept='image/*'
          name='image'
          filled
        />
        <Button
          text='Set Logo'
          color='blue'
          filled={false}
          className='inline-flex flex-row items-center justify-center gap-2 h-12'
          grow={false}
          name='set-logo'
          type='submit'
        />
      </div>
      <img
        src={image}
        style={{ objectFit: 'contain' }}
        alt='Club Logo'
        className='h-20 rounded-lg'
      />
      <span className='flex flex-row justify-start'>
        Club Images:<span className='text-red-500'>*</span>
      </span>
      <ul className='flex flex-col gap-2 list-disc'>
        {images.map((img) => (
          <li key={img.id} className='flex-row inline-flex gap-2 items-center'>
            <span className='flex-grow'>
              <img
                src={img.image}
                style={{ objectFit: 'contain' }}
                alt=''
                className='h-20 bg-gray-800 rounded-lg'
              />
            </span>
            <Button
              text='Remove'
              color='blue'
              filled={false}
              className='inline-flex flex-row items-center justify-center gap-2 h-12'
              icon={<CiTrash size={20} />}
              grow={false}
              name={`remove-image-${img.id}`}
              type='submit'
            />
          </li>
        ))}
        <li className='flex-row inline-flex gap-2'>
          <span className='flex-grow'>
            <Input type='file' accept='image/*' name='images-new' label='' />
          </span>
          <Button
            text='Add'
            color='blue'
            filled={false}
            className='inline-flex flex-row items-center justify-center gap-2'
            icon={<CiCirclePlus size={20} />}
            grow={false}
            name='add-image'
            type='submit'
          />
        </li>
      </ul>
      <div className='flex flex-row gap-2'>
        <Button
          text={club ? 'Update' : 'Create'}
          color='blue'
          type='submit'
          name={club ? 'update' : 'create'}
          filled
        />
        <Button
          text='Cancel'
          color='blue'
          filled={false}
          type='submit'
          name='cancel'
        />
      </div>
    </ResponsiveForm>
  );
};

export default ClubForm;
