<template>
  <div 
    :class="[
      'notification-item',
      {
        'notification-unread': !notification.isRead,
        'notification-urgent': notification.isUrgent(),
        'notification-high': notification.isHigh()
      }
    ]"
    @click="handleClick"
  >
    <!-- Notification Icon -->
    <div class="notification-icon">
      <i 
        :class="getIcon()" 
        :style="{ color: getColor() }"
      ></i>
    </div>

    <!-- Notification Content -->
    <div class="notification-content">
      <div class="notification-header">
        <h4 class="notification-title">{{ notification.title }}</h4>
        <span class="notification-time">{{ notification.getFormattedTime() }}</span>
      </div>
      
      <p class="notification-message">{{ notification.message }}</p>
      
      <div class="notification-meta">
        <span class="notification-sender">{{ notification.sender }}</span>
        <span class="notification-relative-time">{{ notification.getTimeAgo() }}</span>
      </div>
    </div>

    <!-- Notification Actions -->
    <div class="notification-actions">
      <Button
        :icon="notification.isRead ? 'pi pi-eye-slash' : 'pi pi-eye'"
        :title="notification.isRead ? 'Mark as unread' : 'Mark as read'"
        @click.stop="toggleRead"
        class="p-button-text p-button-sm"
        :class="{ 'text-primary': !notification.isRead }"
      />
      
      <Button
        icon="pi pi-trash"
        title="Delete notification"
        @click.stop="deleteNotification"
        class="p-button-text p-button-sm p-button-danger"
      />
    </div>

    <!-- Read/Unread indicator -->
    <div 
      v-if="!notification.isRead" 
      class="notification-indicator"
    ></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Button from 'primevue/button'
import { useNotificationStore } from '../../application/notification.store'

const props = defineProps({
  notification: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click', 'read', 'delete'])

const notificationStore = useNotificationStore()

const getIcon = () => {
  return notificationStore.getNotificationIcon(props.notification)
}

const getColor = () => {
  return notificationStore.getNotificationColor(props.notification)
}

const handleClick = () => {
  emit('click', props.notification)
  if (!props.notification.isRead) {
    toggleRead()
  }
}

const toggleRead = async () => {
  try {
    if (props.notification.isRead) {
      await notificationStore.markAsUnread(props.notification.id)
    } else {
      await notificationStore.markAsRead(props.notification.id)
    }
    emit('read', props.notification)
  } catch (error) {
    console.error('Error toggling read status:', error)
  }
}

const deleteNotification = async () => {
  if (confirm('Are you sure you want to delete this notification?')) {
    try {
      await notificationStore.deleteNotification(props.notification.id)
      emit('delete', props.notification)
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }
}
</script>

<style scoped>
.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  margin-bottom: 0.5rem;
}

.notification-item:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.notification-unread {
  background: #f0f9ff;
  border-left: 4px solid #3b82f6;
}

.notification-urgent {
  border-left-color: #dc2626 !important;
}

.notification-high {
  border-left-color: #ea580c !important;
}

.notification-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 50%;
}

.notification-icon i {
  font-size: 1.25rem;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.notification-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  line-height: 1.4;
}

.notification-time {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.notification-message {
  font-size: 0.8rem;
  color: #475569;
  line-height: 1.4;
  margin: 0 0 0.5rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #64748b;
}

.notification-sender {
  font-weight: 500;
  color: #3b82f6;
}

.notification-relative-time {
  font-style: italic;
}

.notification-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.notification-item:hover .notification-actions {
  opacity: 1;
}

.notification-indicator {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
}

.text-primary {
  color: #3b82f6 !important;
}

/* Responsive design */
@media (max-width: 768px) {
  .notification-item {
    padding: 0.75rem;
  }
  
  .notification-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .notification-time {
    margin-left: 0;
    margin-top: 0.25rem;
  }
  
  .notification-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>