# Antigravity RAG Frontend Prototype

A modern, highly interactive, and beautiful frontend interface designed specifically for Retrieval-Augmented Generation (RAG) applications using local or cloud LLMs.

## Features
1. **Interactive Prompt Area**:
   - Auto-growing text area.
   - Attach file picker button.
   - **Pasting Support**: Paste images or documents directly from your operating system's clipboard.
   - **Drag & Drop**: Drop files anywhere on the page to display an attachment overlay and automatically stage them.
2. **Conversation Manager**:
   - Sidebar containing "+ New Chat" button and Recent Chat list.
   - Persistent storage using `localStorage`.
   - Edit chat titles inline (double click or edit icon).
3. **RAG Parameters Settings**:
   - Adjust `Top-K`, `Similarity Cutoff`, and `Temperature` using styled slider controls.
   - Vector database document list (upload files to index them, purge index).
4. **Citations & Sources UI**:
   - Streamed response simulation from the active LLM.
   - Collapsible reference items detailing the sources searched, showing match scores and specific text snippets.

## Codebase Files
- [index.html](file:///Users/kanaram/Desktop/AIRAGAPP-27-July-2026/index.html): Structure of the main layout, sidebar, and config panels.
- [style.css](file:///Users/kanaram/Desktop/AIRAGAPP-27-July-2026/style.css): Slate/zinc dark mode aesthetics, range sliders, overlays, and animations.
- [app.js](file:///Users/kanaram/Desktop/AIRAGAPP-27-July-2026/app.js): Core app logic, mock streaming response generator, clipboard paste interceptors, and data state sync.

## How to Run Locally

1. **Start the FastAPI Application Server:**
   ```bash
   # From this workspace directory
   uvicorn main:app --reload --port 8080
   ```
   Navigate to [http://localhost:8080](http://localhost:8080) in your local web browser.

2. **Expose the Application with a Free Cloud Tunnel:**
   We have added a helper script that allows you to easily share or test your RAG application externally using a free, temporary cloud tunnel (e.g., Localtunnel, Pinggy, Localhost.run, or ngrok).
   
   To launch the tunnel helper, open a new terminal window/tab and run:
   ```bash
   python3 start_tunnel.py
   ```
   Follow the interactive prompts to choose a method and generate a secure public link.

