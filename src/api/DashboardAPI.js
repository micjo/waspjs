// src/api/DashboardAPI.js
const DB_API_URL = "https://db.capitan.imec.be";

class DashboardAPI {
  constructor() {
    this.baseUrl = DB_API_URL;
  }

  async fetchDashboardData() {
    return this._fetchData('/dashboard/current');
  }

  async fetchActivities() {
    return this._fetchData('/dashboard/templates');
  }

  async fetchTemplate(templateName) {
    return this._fetchData(`/dashboard/templates/${templateName}`);
  }

  async saveDashboard(dashboardData) {
    const url = `${this.baseUrl}/dashboard/save`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dashboardData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save dashboard: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  async fetchHistory(identifier) {
    return this._fetchData(`/dashboard/history/${identifier}`);
  }

  async _fetchData(endpoint) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
}

const api = new DashboardAPI();

export default api;