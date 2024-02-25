import { showAlert } from './alert';

export const updateUser = async (data, type) => {
  const url =
    type === 'password'
      ? 'http://127.0.0.1:3000/api/v1/users/updatePassword'
      : 'http://127.0.0.1:3000/api/v1/users/updateData';
  try {
    const response = await axios({
      method: 'PATCH',
      url,
      data,
    });
    console.log(response);
    if (response.data.status === 'success') {
      showAlert('success', `updated ${type} successfully`);
      window.setTimeout(() => {
        location.reload(true);
      }, 3000);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};
