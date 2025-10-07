export class Notification {
  constructor({
    id = null,
    title = '',
    message = '',
    type = 'info', // 'info', 'warning', 'error', 'success'
    sender = '',
    timestamp = new Date().toISOString(),
    isRead = false,
    isArchived = false,
    priority = 'normal', // 'low', 'normal', 'high', 'urgent'
    category = 'general', // 'medical', 'appointment', 'reminder', 'system', 'general'
    actionUrl = null,
    actionText = null
  }) {
    this.id = id
    this.title = title
    this.message = message
    this.type = type
    this.sender = sender
    this.timestamp = timestamp
    this.isRead = isRead
    this.isArchived = isArchived
    this.priority = priority
    this.category = category
    this.actionUrl = actionUrl
    this.actionText = actionText
  }

  // Business logic methods
  markAsRead() {
    this.isRead = true
  }

  markAsUnread() {
    this.isRead = false
  }

  archive() {
    this.isArchived = true
  }

  unarchive() {
    this.isArchived = false
  }

  isUrgent() {
    return this.priority === 'urgent'
  }

  isHigh() {
    return this.priority === 'high'
  }

  isMedical() {
    return this.category === 'medical' || this.category === 'appointment'
  }

  getTimeAgo() {
    const now = new Date()
    const notificationTime = new Date(this.timestamp)
    const diffMs = now - notificationTime
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    
    return notificationTime.toLocaleDateString()
  }

  getFormattedTime() {
    const time = new Date(this.timestamp)
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Validation methods
  isValid() {
    return this.title && this.message && this.sender
  }

  // Convert to plain object for API calls
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      message: this.message,
      type: this.type,
      sender: this.sender,
      timestamp: this.timestamp,
      isRead: this.isRead,
      isArchived: this.isArchived,
      priority: this.priority,
      category: this.category,
      actionUrl: this.actionUrl,
      actionText: this.actionText
    }
  }
}

export default Notification