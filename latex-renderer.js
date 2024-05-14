// latex-renderer.js

(function() {
  // Create a loading message
  const loadingMessage = document.createElement('div');
  loadingMessage.textContent = 'Loading LaTeX support...';
  loadingMessage.style.position = 'fixed';
  loadingMessage.style.top = '10px';
  loadingMessage.style.right = '10px';
  loadingMessage.style.padding = '10px';
  loadingMessage.style.backgroundColor = '#000';
  loadingMessage.style.color = '#fff';
  loadingMessage.style.zIndex = '1000';
  document.body.appendChild(loadingMessage);

  // Dynamically load MathJax
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
  script.async = true;
  document.head.appendChild(script);

  script.onload = () => {
    // Remove the loading message
    document.body.removeChild(loadingMessage);

    // Configure MathJax
    window.MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true,
        processEnvironments: true,
        packages: {'[+]': ['ams']}
      },
      startup: {
        typeset: false,
        ready: MathJax.startup.defaultReady
      }
    };

    // Process message for LaTeX
    function processMessage(node) {
      const latexRegex = /(\$[^$]+\$|\\\([^\)]+\\\)|\\\[[^\]]+\\\])/g;
      let messageHTML = node.innerHTML;
      messageHTML = messageHTML.replace(latexRegex, (match) => `<span class="latex">${match}</span>`);
      node.innerHTML = messageHTML;
      MathJax.typesetPromise([node]).catch(console.error);
    }

    // Debounce function to limit the rate of function calls
    function debounce(func, wait) {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    }

    // Observe new messages for LaTeX processing
    let observer;
    const debouncedProcessMessage = debounce(processMessage, 300);

    function observeMessages() {
      const chatContainer = document.querySelector('[data-element-id="chat-space-end-part"]');
      if (!chatContainer) {
        console.error('Chat container not found.');
        return;
      }
      observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE && node.matches('[data-element-id="ai-response"]')) {
              debouncedProcessMessage(node);
            }
          });
        });
      });
      observer.observe(chatContainer, { childList: true, subtree: true });
    }

    // Create and initialize the toggle button
    function createToggleButton() {
      const button = document.createElement('button');
      button.textContent = localStorage.getItem('latexExtensionActive') === 'true' ? 'Disable LaTeX' : 'Enable LaTeX';
      button.style.marginLeft = '10px';
      button.style.padding = '5px';
      button.style.cursor = 'pointer'; // Add cursor style for better UX
      button.addEventListener('click', () => {
        const isActive = localStorage.getItem('latexExtensionActive') === 'true';
        localStorage.setItem('latexExtensionActive', !isActive);
        button.textContent = isActive ? 'Enable LaTeX' : 'Disable LaTeX';
        if (isActive) {
          if (observer) {
            observer.disconnect();
          }
        } else {
          observeMessages();
        }
      });

      const toolbar = document.querySelector('[data-element-id="message-input"]');
      if (toolbar) {
        toolbar.appendChild(button);
      } else {
        console.error('Toolbar not found.');
      }
    }

    createToggleButton();
    if (localStorage.getItem('latexExtensionActive') === 'true') {
      observeMessages();
    }
  };
})();

