import { config } from '../config';
import { getPostId, POST_SELECTOR } from './detection';

const BARATIN_ICON = chrome.runtime.getURL('smug.png');
const VIDEOS = [
  'flute1.webm',
  'flute2.webm',
  'flute3.webm',
  'flute4.webm'
];

function playAulosSound() {
  const audio = new Audio(chrome.runtime.getURL('aulos.mp3'));
  audio.play().catch(e => console.error('Baratin: Failed to play sound', e));
}

function addVideoOverlay(postContainer: Element) {
  if (postContainer.querySelector('.baratin-video-container')) return;

  const videoFile = VIDEOS[Math.floor(Math.random() * VIDEOS.length)];
  const videoUrl = chrome.runtime.getURL(videoFile);

  const containerDiv = document.createElement('div');
  containerDiv.className = 'baratin-video-container';
  containerDiv.style.position = 'absolute';
  containerDiv.style.bottom = '0';
  containerDiv.style.right = '0';
  containerDiv.style.width = '50%';
  containerDiv.style.height = '50%';
  containerDiv.style.zIndex = '0';
  containerDiv.style.pointerEvents = 'none';
  // Use flex to align the video to bottom-right if it doesn't fill the space
  containerDiv.style.display = 'flex';
  containerDiv.style.alignItems = 'flex-end';
  containerDiv.style.justifyContent = 'flex-end';

  const video = document.createElement('video');
  video.src = videoUrl;
  video.loop = true;
  video.autoplay = true;
  video.muted = true;
  video.controls = false;
  
  // Style
  video.style.maxWidth = '100%';
  video.style.maxHeight = '100%';
  // Since the video source is 1:1, and we want to maximize it in the container:
  // If we just set max-width/height 100%, the browser will scale it maintaining aspect ratio.
  video.style.opacity = '0.8';
  video.style.borderRadius = '8px';

  containerDiv.appendChild(video);

  // Ensure post container is relative
  const computedStyle = window.getComputedStyle(postContainer);
  if (computedStyle.position === 'static') {
      (postContainer as HTMLElement).style.position = 'relative';
  }

  postContainer.appendChild(containerDiv);
}

async function fetchCount(postId: string): Promise<number> {
  try {
    const response = await fetch(`${config.backendUrl}/${postId}`);
    if (!response.ok) return 0;
    const data = await response.json();
    return data.count || 0;
  } catch (e) {
    console.error('Baratin: Failed to fetch count', e);
    return 0;
  }
}

async function incrementCount(postId: string): Promise<number | null> {
  try {
    const response = await fetch(`${config.backendUrl}/${postId}`, {
      method: 'POST',
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.count;
  } catch (e) {
    console.error('Baratin: Failed to increment count', e);
    return null;
  }
}

export const injectPostReaction = async (container: Element, postId: string, postElement: Element) => {
  if (container.getAttribute('data-baratin-injected') === 'true') return;
  container.setAttribute('data-baratin-injected', 'true');

  // Create List Item
  const li = document.createElement('li');
  li.className = 'social-details-social-counts__item social-details-social-counts__item--baratin';
  li.style.marginLeft = '8px'; // Add some spacing

  // Create Button
  const button = document.createElement('button');
  button.className = 't-black--light display-flex align-items-center social-details-social-counts__count-value text-body-small hoverable-link-text';
  button.type = 'button';
  button.ariaLabel = 'BaratIn reactions';
  // Make it look like a link/text, not clickable for action
  button.style.cursor = 'default'; 

  // Create Icon
  const img = document.createElement('img');
  img.className = 'reactions-icon social-detail-social-counts__count-icon';
  img.src = BARATIN_ICON;
  img.alt = 'baratin';
  img.style.width = '16px';
  img.style.height = '16px';
  img.style.marginRight = '4px';

  // Create Count Span
  const countSpan = document.createElement('span');
  countSpan.className = 'social-details-social-counts__reactions-count';
  countSpan.innerText = ''; // Initially empty

  button.appendChild(img);
  button.appendChild(countSpan);
  li.appendChild(button);

  // Insert after the first item (reactions) if it exists, otherwise append
  const firstItem = container.querySelector('.social-details-social-counts__reactions');
  if (firstItem && firstItem.nextSibling) {
    container.insertBefore(li, firstItem.nextSibling);
  } else {
    container.appendChild(li);
  }

  // Load initial count
  const count = await fetchCount(postId);
  if (count > 0) {
    countSpan.innerText = count.toString();
    addVideoOverlay(postElement);
  } else {
    // If count is 0, we might want to hide the whole item or just the count
    // The user said "I don't want to add the reaction count if it's at 0"
    // If we hide the item, the icon won't be visible either.
    // Assuming they mean the whole indicator.
    li.style.display = 'none';
  }
};

export const injectCode = (targetElement: Element) => {
  if (targetElement.getAttribute('data-injected') === 'true') return;

  console.log('LinkedIn Injector: Target found. Injecting code...');
  
  const button = document.createElement('button');
  button.className = 'reactions-menu__reaction-index reactions-menu__reaction';
  button.style.setProperty('--reactions-current-icon-index', '2.5');
  button.tabIndex = -1;
  button.type = 'button';

  const span = document.createElement('span');
  span.className = 'reactions-menu__reaction-description';
  span.innerText = 'Baratin';
  
  const img = document.createElement('img');
  img.className = 'reactions-icon reactions-menu__icon reactions-icon__consumption--large';
  img.alt = 'baratin';
  img.src = BARATIN_ICON;
  
  button.appendChild(span);
  button.appendChild(img);

  targetElement.appendChild(button);
  
  targetElement.setAttribute('data-injected', 'true');

  // Find post ID to handle click
  const post = targetElement.closest(POST_SELECTOR);
  if (!post) {
    console.warn('Baratin: Could not find parent post for reaction button');
    return;
  }
  const postId = getPostId(post);
  if (!postId) {
    console.warn('Baratin: Could not extract post ID');
    return;
  }

  button.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const menuContainer = button.closest('.reactions-menu');
    if (menuContainer) {
        menuContainer.dispatchEvent(new MouseEvent('mouseleave', {
            bubbles: true,
            cancelable: true,
            view: window
        }));
    } else {
        // Fallback: Try clicking the body if menu container not found
        document.body.click();
    }
    
    playAulosSound();

    const newCount = await incrementCount(postId);
    if (newCount !== null) {
      const li = post.querySelector('.social-details-social-counts__item--baratin') as HTMLElement;
      const countSpan = li?.querySelector('.social-details-social-counts__reactions-count');
      
      if (li && countSpan) {
        countSpan.textContent = newCount.toString();
        if (newCount > 0) {
            li.style.display = ''; // Show if it was hidden
            addVideoOverlay(post);
        }
      }
    }
  });
};
