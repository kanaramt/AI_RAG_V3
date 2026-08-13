/**
 * AppStore - Central Reactive State Manager
 */
class AppStore {
  constructor() {
    this.state = {
      currentRoute: 'dashboard',
      userRole: localStorage.getItem('app_user_role') || 'Super Admin',
      userName: 'Kanaram T.',
      userDepartment: 'AI Engineering',
      activeChatId: null,
      chats: [],
      messages: [],
      documents: [],
      catalogAssets: [],
      reviews: [],
      evaluations: [],
      recommendations: [],
      systemHealth: {
        vectorDb: 'healthy',
        sqlite: 'healthy',
        ollama: 'healthy',
        api: 'healthy',
        embedding: 'healthy'
      },
      settings: {
        defaultModel: 'mistral:latest',
        embeddingModel: 'nomic-embed-text',
        chunkSize: 512,
        retrievalTopK: 5
      },
      notifications: []
    };
    
    this.listeners = [];
  }

  getState() {
    return this.state;
  }

  setState(partialState) {
    this.state = { ...this.state, ...partialState };
    if (partialState.userRole) {
      localStorage.setItem('app_user_role', partialState.userRole);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  addNotification(message, type = 'info') {
    const id = Date.now();
    const notification = { id, message, type };
    this.setState({
      notifications: [...this.state.notifications, notification]
    });
    setTimeout(() => {
      this.removeNotification(id);
    }, 4000);
  }

  removeNotification(id) {
    this.setState({
      notifications: this.state.notifications.filter(n => n.id !== id)
    });
  }
}

export const store = new AppStore();
