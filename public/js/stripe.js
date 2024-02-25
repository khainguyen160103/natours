import { showAlert } from './alert';

const stripe = Stripe(
  'pk_test_51OWveTLOlzXQCQnsBdnj8K3tVS17H1Mdf4V2G1Xt4nnsFKdXpJCwzjiav4PBTLcSkncHubLxu1w1AahwZNBm5Arw00M7mTqYhJ',
);
export const bookTour = async (tourId) => {
  // create checkout session
  try {
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`,
    );

    if (session.data.status === 'success') {
      window.location.assign(session.data.session.url);
    }
  } catch (e) {
    console.log(e);
    showAlert('error', 'charge failed');
  }
};
