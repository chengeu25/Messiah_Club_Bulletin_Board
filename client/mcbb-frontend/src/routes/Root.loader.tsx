import { json } from 'react-router';
import checkUser from '../helper/checkUser';

const rootLoader = async () => {
  const user = await checkUser();
  return json(user, { status: 200 });
};

export default rootLoader;
