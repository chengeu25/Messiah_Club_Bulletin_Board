import { LoaderFunction } from 'react-router';
import checkUser from '../../helper/checkUser';

const landingPageLoader: LoaderFunction = async () => await checkUser();

export default landingPageLoader;
