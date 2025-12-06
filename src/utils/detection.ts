const TARGET_SELECTOR = '.global-nav__content';
const USER_PHOTO_SELECTOR = '.global-nav__me-photo';
export const POST_SELECTOR = '.feed-shared-update-v2';
export const INJECTION_SELECTOR = '.reactions-menu';

let hasLoggedName = false;

export const isUserLoggedIn = (): boolean => {
  return !!document.querySelector(TARGET_SELECTOR);
};

export const detectAndLogUserName = () => {
  if (hasLoggedName) return;
  
  const userPhoto = document.querySelector(USER_PHOTO_SELECTOR);
  if (userPhoto instanceof HTMLImageElement && userPhoto.alt) {
    hasLoggedName = true;
  }
};

export const getPostId = (element: Element): string | null => {
  const urn = element.getAttribute('data-urn');
  if (!urn) return null;
  // urn:li:activity:7396808212039233536 -> 7396808212039233536
  return urn.split(':').pop() || null;
};

export const getSocialCountsContainer = (postElement: Element): Element | null => {
  return postElement.querySelector('.social-details-social-counts ul');
};
