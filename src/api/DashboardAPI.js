// src/api/DashboardAPI.js

const DB_API_URL = "https://db.capitan.imec.be";

class DashboardAPI {
  constructor() {
    this.baseUrl = DB_API_URL;
  }

  /**
   * Fetches the current dashboard data.
   */
  async fetchDashboardData() {
    return this._fetchData('/dashboard/current');
  }

  /**
   * Fetches the list of available activity templates.
   */
  async fetchActivities() {
    return this._fetchData('/dashboard/templates');
  }

  /**
   * Fetches a specific data template by name.
   */
  async fetchTemplate(templateName) {
    return this._fetchData(`/dashboard/templates/${templateName}`);
  }
  
  /**
   * Saves the current dashboard data via a POST request.
   */
  async saveDashboard(dashboardData) {
    const url = `${this.baseUrl}/dashboard/save`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dashboardData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save dashboard: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  /**
   * A private helper method to handle common fetch logic.
   */
  async _fetchData(endpoint) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
}

export default new DashboardAPI();