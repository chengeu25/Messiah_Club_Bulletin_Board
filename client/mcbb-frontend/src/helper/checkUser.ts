import { UserType } from '../types/databaseTypes';

/**
 * Checks if the user is logged in and returns the user object if the user is logged in
 * @returns The user object if the user is logged in, false if the user is not logged in
 */
const checkUser = async (): Promise<boolean | UserType> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/auth/check-user`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    if (response.ok) {
      const json = await response.json();
      return {
        name: json.name,
        email: json.user_id,
        emailVerified: json.emailVerified === 1 ? true : false,
        isFaculty: json.isFaculty === 1 ? true : false,
        canDeleteFaculty: json.canDeleteFaculty === 1 ? true : false,
        clubAdmins: json.clubAdmins,
        tags: json.tags
      };
    }
  } catch (error) {
    console.error(error);
    return false;
  }

  return false;
};

export default checkUser;
