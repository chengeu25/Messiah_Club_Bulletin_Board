import { ActionFunction, redirect } from 'react-router';
import checkUser from '../../../helper/checkUser';

const commentModerationAction: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const email = formData.get('userEmail');
    const action = formData.get('action');
    const emailRequest = await checkUser();
    console.log('formData: ', formData);

    if (emailRequest === false) {
        return redirect('/login?serviceTo=/dashboard/accountInfo');
    }

    if (action === 'approve') {
        console.log("this event has been approved");
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/admintools/approve-comment`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({ commentId: email })
                }
            );
            if (!response.ok) {
                alert(
                    `Something went wrong, comment not approved. Error: ${response.statusText}`
                );
                return null;
            }
        } catch (error) {
            console.error(error);
            return redirect(`/dashboard/commentModeration`);
        }
        return redirect(`/dashboard/commentModeration`);
    }
};

export default commentModerationAction;