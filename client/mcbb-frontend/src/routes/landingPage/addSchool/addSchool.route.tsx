import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/formElements/Button.component';

/**
 * AddSchoolPage component for adding a new school.
 */
const AddSchoolPage = () => {
  const navigate = useNavigate();

  // State variables
  const [schoolName, setSchoolName] = useState('');
  const [schoolColor, setSchoolColor] = useState(''); // Keeping hex code handling unchanged
  const [emailDomain, setEmailDomain] = useState('');
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);

  // Error and success messages
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Handles file selection and converts image to Base64.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSchoolLogo(reader.result as string); // Store Base64 encoded string
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Handles form submission.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Basic validation
    if (!schoolName.trim() || !schoolColor.trim() || !emailDomain.trim()) {
      setError('All fields except logo are required.');
      return;
    }

    // Payload
    const payload = {
      name: schoolName,
      color: schoolColor, // Hex code handling unchanged
      emailDomain,
      logo: schoolLogo || '', // Send Base64 string or empty string
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/school/add-school`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'An unexpected error occurred.');
      }

      setSuccessMessage(result.message);
      setSchoolName('');
      setSchoolColor('');
      setEmailDomain('');
      setSchoolLogo(null);

      setTimeout(() => navigate('/'), 2000); // Redirect after success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to the server.');
    }
  };

  return (
    <div className="bg-blue-900 p-8">
      <h1 className="text-3xl text-white">Add a New School</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        {error && <div className="text-red-500">{error}</div>}
        {successMessage && <div className="text-green-500">{successMessage}</div>}

        <div>
          <label className="text-white">School Name</label>
          <input
            type="text"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            className="w-full p-2"
            required
          />
        </div>
        <div>
          <label className="text-white">School Color (Hex Code)</label>
          <input
            type="text"
            value={schoolColor}
            onChange={(e) => setSchoolColor(e.target.value)}
            className="w-full p-2"
            required
          />
        </div>
        <div>
          <label className="text-white">Email Domain</label>
          <input
            type="text"
            value={emailDomain}
            onChange={(e) => setEmailDomain(e.target.value)}
            className="w-full p-2"
            required
          />
        </div>
        <div>
          <label className="text-white">School Logo (Optional)</label>
          <input type="file" accept="image/*" onChange={handleFileChange} className="w-full p-2" />
          {schoolLogo && <img src={schoolLogo} alt="Preview" className="w-32 h-32 mt-2" />}
        </div>

        <Button type="submit" text="Add School" className="p-4 mt-4" filled={true} />
      </form>
    </div>
  );
};

export default AddSchoolPage;




