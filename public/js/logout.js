import { showAlert } from './alert';

export const logout = async () => {
  try {
    const response = await axios({
      method: 'GET',
      // development api
      // url: 'http://127.0.0.1:3000/api/v1/users/logout',
      // production api
      url: '/api/v1/users/logout',

    });
    if (response.data.status === 'success') {
      showAlert('success', 'logouted successfully');
      window.location.reload(true);
    }
  } catch (error) {
    console.log(error);
    showAlert('error', 'logined failed');
  }
};
