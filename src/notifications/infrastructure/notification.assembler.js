import { Notification } from '../domain/model/notification.entity'

// Convert API response to Notification entity
export const toNotificationResource = (data) => {
  if (!data) return null
  
  return new Notification({
    id: data.id,
    title: data.title || '',
    message: data.message || '',
    type: data.type || 'info',
    sender: data.sender || '',
    timestamp: data.timestamp || new Date().toISOString(),
    isRead: Boolean(data.isRead),
    isArchived: Boolean(data.isArchived),
    priority: data.priority || 'normal',
    category: data.category || 'general',
    actionUrl: data.actionUrl || null,
    actionText: data.actionText || null
  })
}

// Convert Notification entity to API request payload
export const toNotificationRequest = (notification) => {
  if (!notification) return null
  
  return {
    title: notification.title,
    message: notification.message,
    type: notification.type,
    sender: notification.sender,
    timestamp: notification.timestamp,
    isRead: notification.isRead,
    isArchived: notification.isArchived,
    priority: notification.priority,
    category: notification.category,
    actionUrl: notification.actionUrl,
    actionText: notification.actionText
  }
}

// Format notification data for display
export const formatNotificationDateTime = (timestamp) => {
  const date = new Date(timestamp)
  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    relative: getRelativeTime(date)
  }
}

export const formatNotificationDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString()
}

export const formatNotificationTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Get relative time (e.g., "2 hours ago", "Yesterday")
export const getRelativeTime = (date) => {
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minutes ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  
  return date.toLocaleDateString()
}

// Get notification icon based on type and category
export const getNotificationIcon = (notification) => {
  const iconMap = {
    // By type
    info: 'pi pi-info-circle',
    warning: 'pi pi-exclamation-triangle',
    error: 'pi pi-times-circle',
    success: 'pi pi-check-circle',
    
    // By category (override type if specified)
    medical: 'pi pi-heart',
    appointment: 'pi pi-calendar',
    reminder: 'pi pi-clock',
    system: 'pi pi-cog',
    general: 'pi pi-bell'
  }
  
  return iconMap[notification.category] || iconMap[notification.type] || 'pi pi-bell'
}

// Get notification color based on type and priority
export const getNotificationColor = (notification) => {
  if (notification.priority === 'urgent') return '#dc3545' // Red
  if (notification.priority === 'high') return '#fd7e14' // Orange
  
  const colorMap = {
    info: '#0ea5e9',    // Blue
    warning: '#f59e0b', // Yellow
    error: '#dc3545',   // Red
    success: '#10b981'  // Green
  }
  
  return colorMap[notification.type] || '#6b7280' // Gray default
}

// Group notifications by date
export const groupNotificationsByDate = (notifications) => {
  const groups = {}
  
  notifications.forEach(notification => {
    const date = new Date(notification.timestamp).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(notification)
  })
  
  return groups
}

// Sort notifications by timestamp (newest first)
export const sortNotificationsByDate = (notifications) => {
  return [...notifications].sort((a, b) => {
    return new Date(b.timestamp) - new Date(a.timestamp)
  })
}

// Filter notifications
export const filterNotifications = (notifications, filters) => {
  return notifications.filter(notification => {
    if (filters.isRead !== undefined && notification.isRead !== filters.isRead) {
      return false
    }
    if (filters.category && notification.category !== filters.category) {
      return false
    }
    if (filters.priority && notification.priority !== filters.priority) {
      return false
    }
    if (filters.type && notification.type !== filters.type) {
      return false
    }
    return true
  })
}