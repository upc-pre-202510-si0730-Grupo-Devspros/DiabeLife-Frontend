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
      console.log('Loading notifications...')
      const response = await api.getNotifications()
      console.log('Load notifications - raw response:', response.data)
      const notifications = Array.isArray(response.data) 
        ? response.data.map(toNotificationResource)
        : []
      console.log('Load notifications - processed notifications:', notifications)
      state.notifications.splice(0, state.notifications.length, ...notifications)
      updateUnreadCount()
      console.log('Notifications loaded successfully. Total:', state.notifications.length)
    } catch (error) {
      console.error('Failed to load notifications:', error)
      if (error.response) {
        console.error('Response status:', error.response.status)
        console.error('Response data:', error.response.data)
      }
    } finally {
      state.isLoading = false
    }
  }

  const createNotification = async (notificationData) => {
    state.isLoading = true
    try {
      console.log('Creating notification with data:', notificationData)
      const payload = toNotificationRequest(notificationData)
      console.log('Notification payload being sent:', payload)
      const response = await api.createNotification(payload)
      console.log('Create notification - response:', response)
      const newNotification = toNotificationResource(response.data)
      console.log('Create notification - processed notification:', newNotification)
      state.notifications.unshift(newNotification) // Add to beginning
      updateUnreadCount()
      return newNotification
    } catch (error) {
      console.error('Failed to create notification:', error)
      if (error.response) {
        console.error('Response status:', error.response.status)
        console.error('Response data:', JSON.stringify(error.response.data, null, 2))
      }
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
      console.log('Marking notification as read:', id)
      await api.markAsRead(id)
      
      // Update local state immediately
      const notification = state.notifications.find(n => n.id === id)
      if (notification) {
        notification.isRead = true
        updateUnreadCount()
        console.log('Notification marked as read locally:', notification)
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      // If API call fails, reload to sync with server
      await loadNotifications()
      throw error
    }
  }

  const markAsUnread = async (id) => {
    try {
      console.log('Marking notification as unread:', id)
      await api.markAsUnread(id)
      
      // Update local state immediately
      const notification = state.notifications.find(n => n.id === id)
      if (notification) {
        notification.isRead = false
        updateUnreadCount()
        console.log('Notification marked as unread locally:', notification)
      }
    } catch (error) {
      console.error('Failed to mark notification as unread:', error)
      // If API call fails, reload to sync with server
      await loadNotifications()
      throw error
    }
  }

  const markAllAsRead = async () => {
    try {
      // Mark all as read locally first for immediate UI feedback
      const unreadNotifications = state.notifications.filter(n => !n.isRead)
      unreadNotifications.forEach(notification => {
        notification.isRead = true
      })
      updateUnreadCount()
      
      // Since the backend might not have a markAllAsRead endpoint,
      // we'll update each notification individually
      const updatePromises = unreadNotifications.map(notification => 
        api.markAsRead(notification.id).catch(error => {
          console.error(`Failed to mark notification ${notification.id} as read:`, error)
          // Revert local change if API call fails
          notification.isRead = false
        })
      )
      
      await Promise.allSettled(updatePromises)
      updateUnreadCount()
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

  // New endpoint methods for backend API
  const loadNotificationsByUser = async (userId) => {
    state.isLoading = true
    try {
      console.log('Loading notifications by user:', userId)
      const response = await api.getNotificationsByUser(userId)
      const notifications = Array.isArray(response.data) 
        ? response.data.map(toNotificationResource)
        : []
      return notifications
    } catch (error) {
      console.error('Failed to load notifications by user:', error)
      throw error
    } finally {
      state.isLoading = false
    }
  }

  const loadNotificationsByType = async (type) => {
    state.isLoading = true
    try {
      console.log('Loading notifications by type:', type)
      const response = await api.getNotificationsByType(type)
      const notifications = Array.isArray(response.data) 
        ? response.data.map(toNotificationResource)
        : []
      return notifications
    } catch (error) {
      console.error('Failed to load notifications by type:', error)
      throw error
    } finally {
      state.isLoading = false
    }
  }

  const loadNotificationsByCategory = async (category) => {
    state.isLoading = true
    try {
      console.log('Loading notifications by category:', category)
      const response = await api.getNotificationsByCategory(category)
      const notifications = Array.isArray(response.data) 
        ? response.data.map(toNotificationResource)
        : []
      return notifications
    } catch (error) {
      console.error('Failed to load notifications by category:', error)
      throw error
    } finally {
      state.isLoading = false
    }
  }

  const loadUnreadNotifications = async () => {
    state.isLoading = true
    try {
      console.log('Loading unread notifications...')
      const response = await api.getUnreadNotifications()
      const notifications = Array.isArray(response.data) 
        ? response.data.map(toNotificationResource)
        : []
      return notifications
    } catch (error) {
      console.error('Failed to load unread notifications:', error)
      throw error
    } finally {
      state.isLoading = false
    }
  }

  const loadNotificationsByStatus = async (status) => {
    state.isLoading = true
    try {
      console.log('Loading notifications by status:', status)
      const response = await api.getNotificationsByStatus(status)
      const notifications = Array.isArray(response.data) 
        ? response.data.map(toNotificationResource)
        : []
      return notifications
    } catch (error) {
      console.error('Failed to load notifications by status:', error)
      throw error
    } finally {
      state.isLoading = false
    }
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
    
    // New endpoint methods
    loadNotificationsByUser,
    loadNotificationsByType,
    loadNotificationsByCategory,
    loadUnreadNotifications,
    loadNotificationsByStatus,
    
    // Utilities
    formatNotificationDateTime,
    formatNotificationDate,
    formatNotificationTime,
    getRelativeTime,
    getNotificationIcon,
    getNotificationColor
  }
})