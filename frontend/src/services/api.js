/**
 * Carbonix AI API Service
 * Communicates with backend Express REST API
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  static getToken() {
    return localStorage.getItem('carbonix_token') || '';
  }

  static setToken(token) {
    if (token) localStorage.setItem('carbonix_token', token);
    else localStorage.removeItem('carbonix_token');
  }

  static async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    };

    const config = {
      ...options,
      headers
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const res = await fetch(url, config);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const error = new Error(data.message || `Request failed with status ${res.status}`);
        error.status = res.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, err);
      throw err;
    }
  }

  // Auth endpoints
  static async register(name, email, password, location) {
    return this.request('/auth/register', {
      method: 'POST',
      body: { name, email, password, location }
    });
  }

  static async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
  }

  static async getMe() {
    return this.request('/auth/me');
  }

  // Activities endpoints
  static async getActivities(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/activities${query ? `?${query}` : ''}`);
  }

  static async createActivity(activityData) {
    return this.request('/activities', {
      method: 'POST',
      body: activityData
    });
  }

  static async recordBatch(batchData) {
    return this.request('/activities/batch', {
      method: 'POST',
      body: batchData
    });
  }

  static async previewBatch(previewData) {
    return this.request('/activities/preview', {
      method: 'POST',
      body: previewData
    });
  }

  static async deleteActivity(id) {
    return this.request(`/activities/${id}`, {
      method: 'DELETE'
    });
  }

  // Analytics endpoints
  static async getSummary() {
    return this.request('/analytics/summary');
  }

  static async getCategories() {
    return this.request('/analytics/categories');
  }

  static async getMonthlyTrends(months = 6) {
    return this.request(`/analytics/monthly?months=${months}`);
  }

  // Prediction endpoints
  static async predict(reductions = {}) {
    return this.request('/predictions', {
      method: 'POST',
      body: reductions
    });
  }

  static async getProfile() {
    return this.request('/predictions/profile');
  }

  // Optimization endpoints
  static async getOptimizationScenarios(topN = 5) {
    return this.request(`/optimization/scenarios?topN=${topN}`);
  }

  // Recommendations
  static async getRecommendations() {
    return this.request('/recommendations');
  }

  // Goals
  static async getGoals() {
    return this.request('/goals');
  }

  static async createGoal(goalData) {
    return this.request('/goals', {
      method: 'POST',
      body: goalData
    });
  }

  static async updateGoal(id, updateData) {
    return this.request(`/goals/${id}`, {
      method: 'PUT',
      body: updateData
    });
  }

  static async deleteGoal(id) {
    return this.request(`/goals/${id}`, {
      method: 'DELETE'
    });
  }

  // Chatbot
  static async sendMessage(message) {
    return this.request('/chat', {
      method: 'POST',
      body: { message }
    });
  }

  static async getChatHistory() {
    return this.request('/chat/history');
  }
}

export default ApiClient;
