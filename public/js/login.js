import { showAlert } from './alert';
export const login = async (email, password) => {
  try {
    const response = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    if (response.data.status === 'success') {
      showAlert('success', 'logined successfully');
      // alert('success', 'login sucessfully');
      window.location = '/';
    }
    console.log(response);
  } catch (error) {
    console.log(error);
    showAlert('error', 'logined failed');
  }
};
