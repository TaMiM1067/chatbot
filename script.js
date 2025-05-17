



document.addEventListener('DOMContentLoaded', () => {
  const API_KEY = "AIzaSyDNlvqwi0cPf1ta8dui-WIoTOHnjQvh5mQ"; // <-- WARNING: EXPOSED API KEY
  const MODEL_NAME = "gemini-2.0-flash";
  const API_VERSION = "v1beta";
  
  const chatUI = {
    init() {
      this.history = document.getElementById('chat-history');
      this.input = document.getElementById('user-input');
      this.button = document.getElementById('send-button');
      this.setupEvents();
      this.addMessage('ai', "Hello! I'm Gemini Flash. How can I help you today?");
    },
    
    setupEvents() {
      this.button.addEventListener('click', () => this.sendMessage());
      this.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
      this.input.addEventListener('input', () => {
        this.input.style.height = 'auto';
        this.input.style.height = (this.input.scrollHeight) + 'px';
      });
    },
    
    async sendMessage() {
      const message = this.input.value.trim();
      if (!message) return;
      
      this.addMessage('user', message);
      this.input.value = '';
      this.input.style.height = 'auto';
      this.showLoader();
      
      try {
        const response = await this.callGeminiAPI(message);
        this.addMessage('ai', response);
      } catch (error) {
        this.addMessage('ai', `Error: ${error.message}`);
        console.error("API Error:", error);
      } finally {
        this.hideLoader();
      }
    },
    
    async callGeminiAPI(prompt) {
      const url = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: "user", 
            parts: [{ text: prompt }]
          }]
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      if (data.candidates && data.candidates[0].finishReason === "SAFETY") {
          return "I cannot provide a response to that request due to safety guidelines.";
      }
      if (data.candidates && data.candidates[0].finishReason === "OTHER") {
          return "I'm unable to process that request at the moment.";
      }
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
          console.warn("Unexpected API response structure:", data);
          return "I received an unusual response. Please try again.";
      }
      return data.candidates[0].content.parts[0].text;
    },
    
    addMessage(role, content) {
      const msgDiv = document.createElement('div');
      msgDiv.className = `message ${role}-message`;
      
      // Create a span for the message content itself to handle text and potential <br>
      const contentSpan = document.createElement('span');
      contentSpan.className = 'message-content';

      const tempDiv = document.createElement('div');
      tempDiv.textContent = content; // Sanitize by setting as textContent first
      contentSpan.innerHTML = tempDiv.innerHTML.replace(/\n/g, '<br>'); // Convert newlines

      msgDiv.appendChild(contentSpan);

      if (role === 'ai' && content !== "Hello! I'm Gemini Flash. How can I help you today?" && !content.startsWith("Error:") && !content.startsWith("Thinking...")) {
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.setAttribute('aria-label', 'Copy response');
        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
        
        copyButton.addEventListener('click', () => {
          this.copyToClipboard(content, copyButton);
        });
        msgDiv.appendChild(copyButton);
      }
      
      this.history.appendChild(msgDiv);
      this.history.scrollTop = this.history.scrollHeight;
    },

    copyToClipboard(text, buttonElement) {
      navigator.clipboard.writeText(text).then(() => {
        // Success! Change icon to a checkmark temporarily
        const originalIcon = buttonElement.innerHTML;
        buttonElement.innerHTML = '<i class="fas fa-check"></i>';
        buttonElement.disabled = true; // Disable briefly

        setTimeout(() => {
          buttonElement.innerHTML = originalIcon;
          buttonElement.disabled = false;
        }, 1500); // Revert after 1.5 seconds
      }).catch(err => {
        console.error('Failed to copy text: ', err);
        // Optionally, provide an error message to the user
        alert('Failed to copy text.');
      });
    },
    
    showLoader() {
      this.loader = document.createElement('div');
      this.loader.id = 'loading';
      this.loader.className = 'message ai-message';
      this.loader.textContent = 'Thinking...';
      this.history.appendChild(this.loader);
      this.history.scrollTop = this.history.scrollHeight;
    },
    
    hideLoader() {
      if (this.loader) {
        this.loader.remove();
        this.loader = null;
      }
    }
  };
  
  chatUI.init();
});


