// ==UserScript==
// @name         Quick Conversation Feature
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Add quick conversation feature to the website
// @author       You
// @match        https://hackforums.net/*
// @grant        none
// @require      https://hackforums.net/jscripts/socket.io.js
// @require      https://hackforums.net/jscripts/markdown-it.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.3/Chart.min.js
// ==/UserScript==

var unread_messages = 0;

function playNotificationSound() {
  const audioElement = new Audio('https://hackforums.net/sounds/convo-blip.mp3');
  audioElement.play();
}

function toggleChatWindow() {
  const chatWindow = document.getElementById('chat-window');
  chatWindow.classList.toggle('open');
  chatWindow.style.display = chatWindow.classList.contains('open') ? 'block' : 'none';
  chatButton.classList.remove('pulse');
}

const chatButton = document.createElement('button');
chatButton.textContent = 'Chat';
chatButton.style.cssText = `
  position: fixed;
  bottom: 20px;
  left: 20px;
  padding: 10px;
  background-color: #4d2f5d;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;
document.body.appendChild(chatButton);

if (!window.location.href.includes('convo.php')) {
  const chatWindow = document.createElement('div');
  chatWindow.id = 'chat-window';
  chatWindow.style.cssText = `
    position: fixed;
    bottom: 60px;
    left: 20px;
    width: 500px;
    height: 600px;
    background-color: #1F1F1F;
    border-radius: 5px;
    display: none;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 10px;
    border: 1px solid #4d2f5d;
    overflow-y: auto;
  `;

  const iframe = document.createElement('iframe');
  iframe.src = 'https://hackforums.net/convo.php';
  iframe.style.cssText = 'width: 100%; height: calc(100% - 20px); border: none; z-index: 10000;'; // add z-index here

  iframe.addEventListener('load', () => {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.documentElement.scrollTop = iframeDoc.documentElement.scrollHeight;

    // Select the node that will be observed for mutations
    const targetNode = iframeDoc.getElementById('message-container');

    // Options for the observer (which mutations to observe)
    const config = { childList: true, subtree: true };

    // Callback function to execute when mutations are observed
    const callback = function(mutationsList, observer) {
      for(let mutation of mutationsList) {
        if (mutation.type === 'childList') {
          for(let node of mutation.addedNodes) {
            if(node.nodeType === Node.ELEMENT_NODE && (node.classList.contains('message-convo-left') || node.querySelector('.message-convo-left'))) {
              chatButton.classList.add('pulse');
              playNotificationSound();
              break;
            }
          }
        }
      }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);
  });

  chatWindow.appendChild(iframe);
  document.body.appendChild(chatWindow);
  chatButton.addEventListener('click', toggleChatWindow);
}

// Insert the new CSS animation class into the head of the document
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% {
      background-color: #4d2f5d;
    }
    50% {
      background-color: red;
    }
    100% {
      background-color: #4d2f5d;
    }
  }
  .pulse {
    animation: pulse 2s infinite;
  }
`;
document.head.appendChild(style);
