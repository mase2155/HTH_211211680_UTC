export const ROUTES = {
  home: '/',
  search: '/search',
  login: '/login',
  register: '/register',
  booking: '/booking',
  payment: (bookingId) => `/payment/${bookingId}`,
  history: '/history',
  profile: '/profile',
  news: '/news',
  partners: '/partners',
  contact: '/contact',
  admin: '/admin',
};
