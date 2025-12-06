import { getPostId, getSocialCountsContainer, POST_SELECTOR, INJECTION_SELECTOR } from './utils/detection';
import { injectPostReaction, injectCode } from './utils/injection';

const processPost = (postElement: Element) => {
  const postId = getPostId(postElement);
  if (!postId) return;

  const container = getSocialCountsContainer(postElement);
  if (!container) return;

  injectPostReaction(container, postId, postElement);
};

const observer = new MutationObserver((mutations) => {
  if (!window.location.href.includes('linkedin.com')) return;

  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node instanceof Element) {
        // Check if the node itself is a post
        if (node.matches(POST_SELECTOR)) {
          processPost(node);
        }
        // Check if the node contains posts
        const posts = node.querySelectorAll(POST_SELECTOR);
        posts.forEach(processPost);

        // Check for reactions menu (for the button injection)
        if (node.matches(INJECTION_SELECTOR)) {
          injectCode(node);
        }
        const menus = node.querySelectorAll(INJECTION_SELECTOR);
        menus.forEach(injectCode);
      }
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Initial scan
const initialPosts = document.querySelectorAll(POST_SELECTOR);
initialPosts.forEach(processPost);

const initialMenus = document.querySelectorAll(INJECTION_SELECTOR);
initialMenus.forEach(injectCode);
