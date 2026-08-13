/**
 * Floating AI Assistant Launcher Widget (Reference Design)
 */
export function renderChatWidget(onOpenAssistant) {
  const widget = document.createElement('div');
  widget.className = 'floating-chat-btn';
  widget.title = 'Quick AI Assistant Chat';
  widget.innerHTML = `<i data-lucide="bot"></i>`;

  widget.addEventListener('click', () => {
    onOpenAssistant();
  });

  return widget;
}
