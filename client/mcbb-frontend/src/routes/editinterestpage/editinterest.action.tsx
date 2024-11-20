import { ActionFunction, redirect } from 'react-router-dom';

const EditInterestsAction:ActionFunction = async ({ request }) => {
  
    const formData = await request.formData();
    const checkedInterests = formData.get("interests")
  // Prepare the data to be sent to the backend
  const data = {
    interests: checkedInterests
  };

  try {
    const response = await fetch('http://localhost:3000/api/editinterestpage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: "include"
    });

    const result = await response.json();

    if (response.ok) {
      // If the request is successful, trigger the form submission
      
      alert(result.message);
    } else {
      // If the request fails, display an error message
      alert(result.error || 'An error occurred while updating interests');
    }
  } catch (error) {
    console.error('Error updating interests:', error);
    alert('An error occurred while updating interests');
  }
  return redirect('/dashboard')
};

export default EditInterestsAction;
