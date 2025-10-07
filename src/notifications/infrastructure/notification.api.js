import axios from 'axios'

const BASE = 'http://localhost:3000'

export default {
  // Notifications CRUD
  getNotifications() {
    return axios.get(`${BASE}/notifications`)
  },
  
  getNotificationById(id) {
    return axios.get(`${BASE}/notifications/${id}`)
  },
  
  createNotification(payload) {
    return axios.post(`${BASE}/notifications`, payload)
  },
  
  updateNotification(id, payload) {
    return axios.put(`${BASE}/notifications/${id}`, payload)
  },
  
  deleteNotification(id) {
    return axios.delete(`${BASE}/notifications/${id}`)
  },
  
  // Mark notifications as read/unread
  markAsRead(id) {
    return axios.patch(`${BASE}/notifications/${id}`, { isRead: true })
  },
  
  markAsUnread(id) {
    return axios.patch(`${BASE}/notifications/${id}`, { isRead: false })
  },
  
  markAllAsRead() {
    return axios.patch(`${BASE}/notifications/mark-all-read`)
  },
  
  // Archive notifications
  archiveNotification(id) {
    return axios.patch(`${BASE}/notifications/${id}`, { isArchived: true })
  },
  
  unarchiveNotification(id) {
    return axios.patch(`${BASE}/notifications/${id}`, { isArchived: false })
  },
  
  // Get notifications by filters
  getUnreadNotifications() {
    return axios.get(`${BASE}/notifications?isRead=false`)
  },
  
  getNotificationsByCategory(category) {
    return axios.get(`${BASE}/notifications?category=${category}`)
  },
  
  getNotificationsByPriority(priority) {
    return axios.get(`${BASE}/notifications?priority=${priority}`)
  },
  
  // Get notification count
  getUnreadCount() {
    return axios.get(`${BASE}/notifications?isRead=false&_limit=0`)
      .then(response => ({
        data: { count: parseInt(response.headers['x-total-count'] || 0) }
      }))
  }
}