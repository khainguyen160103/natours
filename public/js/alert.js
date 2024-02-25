export const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) {
    el.remove();
  }
};
export const showAlert = (type, msg) => {
  const html = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', html);
  setTimeout(hideAlert, 2000);
};
