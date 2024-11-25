import React, { useState } from 'react';
import { useSubmit } from 'react-router-dom';
import Input from '../../../components/formElements/Input.component';
import Button from '../../../components/formElements/Button.component';
import ResponsiveForm from '../../../components/formElements/ResponsiveForm';

const AddedInterest = () => {
  const [interestName, setInterestName] = useState('');
  const [error, setError] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const submit = useSubmit();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError([]); // Clear previous errors
    setSuccessMessage(''); // Clear previous success messages

    if (!interestName.trim()) {
      setError(['Interest name is required.']);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:3000/api/add_tag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tag_name: interestName }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle errors from the backend
        setError([result.error || 'An unexpected error occurred.']);
      } else {
        // Display success message and clear input
        setSuccessMessage(result.message);
        setInterestName('');
      }
    } catch (err) {
      setError(['Failed to connect to the server. Please try again later.']);
      console.error('Error:', err);
    }
  };

  return (
    <ResponsiveForm onSubmit={handleSubmit}>
      <h1 className="text-2xl font-bold text-center">Add Interest</h1>
      {error.length > 0 && (
        <div className="text-red-500">
          {error.map((err, idx) => (
            <div key={idx}>{err}</div>
          ))}
        </div>
      )}
      {successMessage && <div className="text-green-500">{successMessage}</div>}
      <Input
        label="Interest Name:"
        name="interestName"
        type="text"
        value={interestName}
        onChange={(e) => setInterestName((e.target as HTMLInputElement).value)}
        placeholder="Enter the interest name"
        color="blue"
        filled={false}
        required
      />
      <div className="flex flex-row gap-2 mt-4">
        <Button text="Submit" color="blue" type="submit" filled name="submit" />
        <Button text="Cancel" color="blue" filled={false} type="reset" name="cancel" />
      </div>
    </ResponsiveForm>
  );
};

export default AddedInterest;


