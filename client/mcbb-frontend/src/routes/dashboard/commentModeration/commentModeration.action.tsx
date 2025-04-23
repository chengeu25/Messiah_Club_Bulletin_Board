import { ActionFunction, redirect } from 'react-router';
import checkUser from '../../../helper/checkUser';

const commentModerationAction: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const comment_id = formData.get('comment_id');
    const action = formData.get('action');
    const emailRequest = await checkUser();

    if (emailRequest === false) {
        return redirect('/login?serviceTo=/dashboard/accountInfo');
    }

    if (action === 'approve') {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/admintools/approve-comment`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({ comment_id: comment_id })
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
            return redirect(`/dashboard/faculty/commentModeration`);
        }
        return redirect(`/dashboard/faculty/commentModeration`);
    } else if (action === 'decline') {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/admintools/delete-comment`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        comment_id: comment_id
                    })
                }
            );
            if (!response.ok) {
                alert(
                    `Something went wrong, comment not deleted. Error: ${response.statusText}`
                );
                return null;
            }
        } catch (error) {
            console.error(error);
            return redirect(`/dashboard/faculty/commentModeration`);
        }
        return redirect(`/dashboard/faculty/commentModeration`);
    }
};

export default commentModerationAction;