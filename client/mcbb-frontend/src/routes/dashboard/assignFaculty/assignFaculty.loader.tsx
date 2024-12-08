import { json, LoaderFunction, redirect } from 'react-router';
import checkUser from '../../../helper/checkUser';
import { UserType as User } from '../../../types/databaseTypes';

const assignFacultyLoader: LoaderFunction = async () => {
    const user = await checkUser();
    if (user === false) {
        return redirect('/login');
    }
    if ((user as User).isFaculty === false) {
        return redirect('/dashboard/home');
    }
    return json({ user: user }, { status: 200 });
};

export default assignFacultyLoader;
