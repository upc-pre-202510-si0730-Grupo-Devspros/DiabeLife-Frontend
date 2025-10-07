import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import api from '../infrastructure/notification.api'
import { 
  toNotificationResource, 
  toNotificationRequest,
  formatNotificationDateTime,
  formatNotificationDate,
  formatNotificationTime,
  getRelativeTime,
  getNotificationIcon,
  getNotificationColor,
  groupNotificationsByDate,
  sortNotificationsByDate,
  filterNotifications
} from '../infrastructure/notification.assembler'

export const useNotificationStore = defineStore('notifications', () => {
  const state = reactive({
    notifications: [],
    isLoading: false,
    unreadCount: 0,
    selectedNotification: null,
    filters: {
      isRead: undefined,
      category: null,
      priority: null,
      type: null
    }
  })

  // Computed properties
  const allNotifications = computed(() => {
    return sortNotificationsByDate(state.notifications)
  })

  const unreadNotifications = computed(() => {
    return state.notifications.filter(notification => !notification.isRead)
  })

  const readNotifications = computed(() => {
    return state.notifications.filter(notification => notification.isRead)
  })

  const filteredNotifications = computed(() => {
    return filterNotifications(allNotifications.value, state.filters)
  })

  const groupedNotifications = computed(() => {
    return groupNotificationsByDate(filteredNotifications.value)
  })

  const urgentNotifications = computed(() => {
    return state.notifications.filter(notification => 
      notification.priority === 'urgent' && !notification.isRead
    )
  })

  const medicalNotifications = computed(() => {
    return state.notifications.filter(notification => 
      (notification.category === 'medical' || notification.category === 'appointment') 
      && !notification.isRead
    )
  })

  const hasUnreadNotifications = computed(() => {
    return unreadNotifications.value.length > 0
  })

  // Actions
  const loadNotifications = async () => {
    state.isLoading = true
    try {
      const response = await api.getNotifications()
      const notifications = Array.isArray(response.data) 
        ? response.data.map(toNotificationResource)
        : []
      state.notifications.splice(0, state.notifications.length, ...notifications)
      updateUnreadCount()
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      state.isLoading = false
    }
  }

  const createNotification = async (notificationData) => {
    state.isLoading = true
    try {
      const payload = toNotificationRequest(notificationData)
      const response = await api.createNotification(payload)
      const newNotification = toNotificationResource(response.data)
      state.notifications.unshift(newNotification) // Add to beginning
      updateUnreadCount()
      return newNotification
    } catch (error) {
      console.error('Failed to create notification:', error)
      throw error
    } finally {
      state.isLoading = false
    }
  }

  const updateNotification = async (id, notificationData) => {
    state.isLoading = true
    try {
      const payload = toNotificationRequest(notificationData)
      const response = await api.updateNotification(id, payload)
      const updatedNotification = toNotificationResource(response.data)
      
      const index = state.notifications.findIndex(notification => notification.id === id)
      if (index !== -1) {
        state.notifications[index] = updatedNotification
      }
      updateUnreadCount()
      return updatedNotification
    } catch (error) {
      console.error('Failed to update notification:', error)
      throw error
    } finally {
      state.isLoading = false
    }
  }

  const deleteNotification = async (id) => {
    state.isLoading = true
    try {
      await api.deleteNotification(id)
      const index = state.notifications.findIndex(notification => notification.id === id)
      if (index !== -1) {
        state.notifications.splice(index, 1)
      }
      updateUnreadCount()
    } catch (error) {
      console.error('Failed to delete notification:', error)
      throw error
    } finally {
      state.isLoading = false
    }
  }

  const markAsRead = async (id) => {
    try {
      await api.markAsRead(id)
      const notification = state.notifications.find(n => n.id === id)
      if (notification) {
        notification.markAsRead()
        updateUnreadCount()
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      throw error
    }
  }

  const markAsUnread = async (id) => {
    try {
      await api.markAsUnread(id)
      const notification = state.notifications.find(n => n.id === id)
      if (notification) {
        notification.markAsUnread()
        updateUnreadCount()
      }
    } catch (error) {
      console.error('Failed to mark notification as unread:', error)
      throw error
    }
  }

  const markAllAsRead = async () => {
    try {
      // Mark all as read locally first for immediate UI feedback
      state.notifications.forEach(notification => {
        if (!notification.isRead) {
          notification.markAsRead()
        }
      })
      updateUnreadCount()
      
      // Then sync with server
      await api.markAllAsRead()
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      // Reload to sync with server state
      await loadNotifications()
      throw error
    }
  }

  const archiveNotification = async (id) => {
    try {
      await api.archiveNotification(id)
      const notification = state.notifications.find(n => n.id === id)
      if (notification) {
        notification.archive()
      }
    } catch (error) {
      console.error('Failed to archive notification:', error)
      throw error
    }
  }

  const unarchiveNotification = async (id) => {
    try {
      await api.unarchiveNotification(id)
      const notification = state.notifications.find(n => n.id === id)
      if (notification) {
        notification.unarchive()
      }
    } catch (error) {
      console.error('Failed to unarchive notification:', error)
      throw error
    }
  }

  const setSelectedNotification = (notification) => {
    state.selectedNotification = notification
  }

  const setFilters = (filters) => {
    Object.assign(state.filters, filters)
  }

  const clearFilters = () => {
    state.filters = {
      isRead: undefined,
      category: null,
      priority: null,
      type: null
    }
  }

  const updateUnreadCount = () => {
    state.unreadCount = unreadNotifications.value.length
  }

  const getNotificationsByCategory = (category) => {
    return state.notifications.filter(notification => notification.category === category)
  }

  const getNotificationsByPriority = (priority) => {
    return state.notifications.filter(notification => notification.priority === priority)
  }

  // Initialize
  const initialize = async () => {
    await loadNotifications()
  }

  return {
    // State
    state,
    
    // Computed
    allNotifications,
    unreadNotifications,
    readNotifications,
    filteredNotifications,
    groupedNotifications,
    urgentNotifications,
    medicalNotifications,
    hasUnreadNotifications,
    
    // Actions
    loadNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    archiveNotification,
    unarchiveNotification,
    setSelectedNotification,
    setFilters,
    clearFilters,
    getNotificationsByCategory,
    getNotificationsByPriority,
    initialize,
    
    // Utilities
    formatNotificationDateTime,
    formatNotificationDate,
    formatNotificationTime,
    getRelativeTime,
    getNotificationIcon,
    getNotificationColor
  }
})