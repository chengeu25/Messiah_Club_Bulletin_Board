import { ActionFunction, redirect } from 'react-router';
import checkUser from '../../helper/checkUser';

const changePasswordAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const oldPassword = formData.get('pwd');
  const newPassword = formData.get('npwd');
  
  const emailRequest = await checkUser()
  if (emailRequest) {
    const loginRequest = await fetch('http://localhost:3000/api/passwordReset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ oldPassword, newPassword, emailRequest })
    });
  

    // Go to login if password has been changed and change error message to say password has been reset
    if (loginRequest.ok) {
      return redirect('/login?message=' + 'Change%20password%20successful');
    } else {
      const json = await loginRequest.json();
      return redirect('/changePassword?error=' + json.error)
    }
  } else {
    return redirect('/login?error=' + 'Not%20logged%20in')
  }
};

export default changePasswordAction;
