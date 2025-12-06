const TARGET_SELECTOR = '.global-nav__content'; // This usually indicates a user is logged in
const INJECTION_SELECTOR = '.scaffold-layout__main'; // The main feed area
const USER_PHOTO_SELECTOR = '.global-nav__me-photo';

let hasLoggedName = false;

// 1. Check if user is logged in (Lightweight check)
const isUserLoggedIn = (): boolean => {
  // We check for the specific navigation bar that only appears for logged-in users
  return !!document.querySelector(TARGET_SELECTOR);
};

const detectAndLogUserName = () => {
  if (hasLoggedName) return;
  
  const userPhoto = document.querySelector(USER_PHOTO_SELECTOR);
  if (userPhoto instanceof HTMLImageElement && userPhoto.alt) {
    console.log(userPhoto.alt);
    hasLoggedName = true;
  }
};

// 2. The code you want to inject
const injectCode = (targetElement: Element) => {
  if (targetElement.getAttribute('data-injected') === 'true') return;

  console.log('LinkedIn Injector: Target found. Injecting code...');
  
  // Example: Add a simple banner
  const banner = document.createElement('div');
  banner.style.padding = '10px';
  banner.style.backgroundColor = '#4caf50';
  banner.style.color = 'white';
  banner.style.textAlign = 'center';
  banner.style.marginBottom = '10px';
  banner.style.borderRadius = '8px';
  banner.innerText = 'Extension Active: Element Detected';

  // Insert before the target element
  targetElement.prepend(banner);
  
  // Mark as injected so we don't do it twice
  targetElement.setAttribute('data-injected', 'true');
};

// 3. Observer Logic to handle SPA navigation
const observer = new MutationObserver(() => {
  // Stop observing if we are not on LinkedIn (safety check)
  if (!window.location.href.includes('linkedin.com')) return;

  // If we can't find the nav, the user might not be logged in yet
  if (!isUserLoggedIn()) return;

  detectAndLogUserName();

  const target = document.querySelector(INJECTION_SELECTOR);
  if (target) {
    injectCode(target);
  }
});

// 4. Start Observing
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Initial check in case the element is already there
if (isUserLoggedIn()) {
  detectAndLogUserName();
  const initialTarget = document.querySelector(INJECTION_SELECTOR);
  if (initialTarget) injectCode(initialTarget);
}
