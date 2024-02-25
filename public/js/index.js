import 'core-js/stable';
import 'regenerator-runtime/runtime.js';

import { displayMap } from './leaflet';
import { login } from './login';
import { logout } from './logout';
import { updateUser } from './updateUser';
import { bookTour } from './stripe';

const map = document.getElementById('map');
const form = document.querySelector('.form--login');
const logout_button = document.querySelector('.nav__el--logout');
const formUpdate = document.querySelector('.form-user-data');
const formPassword = document.querySelector('.form-user-password');
const booking_btn = document.querySelector('#book-tour');

if (booking_btn) {
  booking_btn.addEventListener('click', (e) => {
    e.target.textContent = 'Process....';
    bookTour(e.target.dataset.tourId);
  });
}

if (formPassword) {
  formPassword.addEventListener('submit', async (e) => {
    document.querySelector('.submit-btn').textContent = 'Loading...';
    e.preventDefault();
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateUser(
      { passwordCurrent, password, passwordConfirm },
      'password',
    );
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
    document.querySelector('.submit-btn').textContent = 'Saved Password';
  });
}

if (formUpdate) {
  formUpdate.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateUser(form, 'data');
  });
}

if (logout_button) {
  logout_button.addEventListener('click', () => {
    logout();
  });
}

if (map) {
  const locations = JSON.parse(map.dataset.location);
  displayMap(locations);
}

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}
