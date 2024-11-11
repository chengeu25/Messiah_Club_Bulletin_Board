interface User {
  name: string;
  email: string;
}

const checkUser = async (): Promise<boolean | User> => {
  const response = await fetch('http://localhost:3000/api/checkUser', {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (response.ok) {
    const json = await response.json();
    return { name: json.name, email: json.user_id }
  }
  return false;
};

export default checkUser;
