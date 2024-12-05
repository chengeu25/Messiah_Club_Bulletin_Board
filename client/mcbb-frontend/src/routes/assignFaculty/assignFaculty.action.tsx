import { ActionFunction, redirect } from 'react-router';
import checkUser from '../../helper/checkUser';

const assignFacultyAction: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const email = formData.get('userEmail');
    const remember = formData.get('cdf');
    const action = formData.get('action');

    const emailRequest = await checkUser();
    if (emailRequest) {
        const loginRequest = await fetch('http://localhost:3000/api/assignFaculty', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ email, remember, action })
        });

        if (loginRequest.ok) {
            return redirect('/assignFaculty?message=' + 'assigned%20faculty');
        } else {
            const json = await loginRequest.json();
            return redirect('/assignFaculty?error=' + json.error);
        }
    } else {
        return redirect('/login?error' + 'Not%20logged%20in');
    }

}

export default assignFacultyAction;