// latex-renderer.js

(function() {
  // Load MathJax library dynamically
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
  script.async = true;
  document.head.appendChild(script);

  script.onload = () => {
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
        ready: () => {
          MathJax.startup.defaultReady();
          // Observer initialization
          observeMessages();
        }
      }
    };

    // Function to process messages for LaTeX
    function processMessage(messageElement) {
      const latexRegex = /(\$[^$]+\$|\\\([^\)]+\\\)|\\\[[^\]]+\\\])/g;
      let messageHTML = messageElement.innerHTML;

      messageHTML = messageHTML.replace(latexRegex, (match) => {
        return `<span class="latex">${match}</span>`;
      });

      messageElement.innerHTML = messageHTML;
      MathJax.typesetPromise([messageElement]).catch(err => console.error("MathJax rendering error:", err));
    }

    // Function to observe and modify messages
    function observeMessages() {
      const messageContainer = document.querySelector('[data-element-id="chat-messages-container"]');

      if (!messageContainer) {
        console.error('Message container not found.');
        return;
      }

      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(node => {
              if (node.querySelector) {
                const messageElements = node.querySelectorAll('[data-element-id="message-text"]');
                messageElements.forEach(messageElement => {
                  if (isExtensionActive()) {
                    processMessage(messageElement);
                  }
                });
              }
            });
          }
        });
      });

      observer.observe(messageContainer, { childList: true, subtree: true });
    }

    // Function to check if the extension is active
    function isExtensionActive() {
      return localStorage.getItem('latexExtensionActive') === 'true';
    }

    // Function to toggle the extension state
    function toggleExtension() {
      const isActive = isExtensionActive();
      localStorage.setItem('latexExtensionActive', !isActive);
      updateButtonState();
    }

    // Function to update the button state
    function updateButtonState() {
      const button = document.querySelector('[data-element-id="latex-extension-toggle"]');
      if (button) {
        const isActive = isExtensionActive();
        button.textContent = isActive ? 'Disable LaTeX' : 'Enable LaTeX';
        button.classList.toggle('active', isActive);
      }
    }

    // Function to create the toggle button
    function createToggleButton() {
      const button = document.createElement('button');
      button.setAttribute('data-element-id', 'latex-extension-toggle');
      button.textContent = 'Enable LaTeX';
      button.addEventListener('click', toggleExtension);

      const container = document.querySelector('[data-element-id="chat-input-container"]');
      if (container) {
        container.appendChild(button);
      }

      updateButtonState();
    }

    // Initialize the extension
    createToggleButton();
    if (isExtensionActive()) {
      observeMessages();
    }
  };
})();

