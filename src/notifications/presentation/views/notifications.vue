<template>
  <div class="notifications-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">{{ t('notifications.title') }}</h1>
    </div>

    <!-- Main Content -->
    <div class="notifications-layout">
      <!-- Notifications List -->
      <div class="notifications-section">
        <Card class="notifications-card">
          <template #content>
            <div class="notification-messages">
              <div
                  v-for="notification in visibleNotifications"
                  :key="notification.id"
                  :class="['message-item', { 'message-unread': !notification.isRead }]"
                  @click="handleNotificationClick(notification)"
              >
                <div class="message-content">
                  <div class="message-header">
                    <h4 class="message-title">{{ notification.title }}</h4>
                    <span class="message-time">{{ notification.getTimeAgo() }}</span>
                  </div>
                  <p class="message-text">{{ notification.message }}</p>
                </div>

                <div class="message-actions">
                  <Button
                      :icon="notification.isRead ? 'pi pi-check' : 'pi pi-circle'"
                      :title="notification.isRead ? t('notifications.markUnread') : t('notifications.markRead')"
                      @click.stop="toggleRead(notification)"
                      class="p-button-text p-button-sm action-read"
                      :class="{ 'text-success': notification.isRead }"
                  />

                  <Button
                      icon="pi pi-trash"
                      :title="t('notifications.deleteTooltip')"
                      @click.stop="deleteNotification(notification)"
                      class="p-button-text p-button-sm action-delete"
                  />
                </div>
              </div>

              <!-- Empty state -->
              <div v-if="visibleNotifications.length === 0" class="empty-messages">
                <i class="pi pi-inbox" style="font-size: 3rem; color: #cbd5e1;"></i>
                <h3>{{ t('notifications.emptyTitle') }}</h3>
                <p>{{ t('notifications.emptyDescription') }}</p>
              </div>
            </div>
          </template>
        </Card>

        <!-- See All Messages Button -->
        <div v-if="allNotifications.length > 5" class="see-all-container">
          <Button
              :label="showAll ? t('notifications.seeLess') : t('notifications.seeAll')"
              :icon="showAll ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
              @click="toggleShowAll"
              class="see-all-button"
          />
        </div>
      </div>
    </div>

    <!-- Notification Detail Dialog -->
    <Dialog
        v-model:visible="showDetailDialog"
        :header="selectedNotification?.title || t('notifications.detailHeader')"
        modal
        :style="{ width: '600px' }"
        class="notification-dialog"
    >
      <div v-if="selectedNotification" class="notification-details">
        <div class="detail-header">
          <div class="detail-sender">
            <i :class="getNotificationIcon(selectedNotification)"></i>
            <span class="notification-type">{{ selectedNotification.type }}</span>
          </div>
          <span class="detail-time">{{ formatDateTime(selectedNotification.timestamp) }}</span>
        </div>

        <div class="detail-content">
          <h3>{{ selectedNotification.title }}</h3>
          <p>{{ selectedNotification.message }}</p>

          <div v-if="selectedNotification.actionUrl" class="detail-action">
            <Button
                :label="selectedNotification.actionText || t('notifications.viewDetails')"
                @click="handleAction(selectedNotification)"
                class="p-button-primary"
            />
          </div>
        </div>

        <div class="detail-meta">
          <span class="detail-category">{{ selectedNotification.category }}</span>
          <span class="detail-priority" :class="`priority-${selectedNotification.priority}`">
            {{ selectedNotification.priority }}
          </span>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useNotificationStore } from '../../application/notification.store'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'

const { t } = useI18n()
const notificationStore = useNotificationStore()

const showDetailDialog = ref(false)
const selectedNotification = ref(null)
const showAll = ref(false)

const allNotifications = computed(() => notificationStore.allNotifications)
const visibleNotifications = computed(() =>
    showAll.value ? allNotifications.value : allNotifications.value.slice(0, 5)
)

const handleNotificationClick = (notification) => {
  selectedNotification.value = notification
  showDetailDialog.value = true
  if (!notification.isRead) toggleRead(notification)
}

const toggleRead = async (notification) => {
  try {
    console.log('Toggling read status for notification:', notification.id, 'current isRead:', notification.isRead)
    
    if (notification.isRead) {
      await notificationStore.markAsUnread(notification.id)
      console.log('Marked as unread')
    } else {
      await notificationStore.markAsRead(notification.id)
      console.log('Marked as read')
    }
  } catch (error) {
    console.error('Error toggling read status:', error)
    alert('Error updating notification status. Please try again.')
  }
}

const deleteNotification = async (notification) => {
  if (confirm(t('notifications.confirmDelete'))) {
    try {
      await notificationStore.deleteNotification(notification.id)
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }
}

const toggleShowAll = () => {
  showAll.value = !showAll.value
}

const getNotificationIcon = (notification) => notificationStore.getNotificationIcon(notification)

const formatDateTime = (timestamp) => new Date(timestamp).toLocaleString()

const handleAction = (notification) => {
  if (notification.actionUrl) window.open(notification.actionUrl, '_blank')
  showDetailDialog.value = false
}

onMounted(async () => {
  await notificationStore.initialize()
})
</script>


<style scoped>
.notifications-page {
  padding: 1rem 2rem;
  background-color: #f5f6fa;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.notifications-layout {
  display: flex;
  justify-content: center;
  width: 100%;
}

.notifications-section {
  width: 100%;
  max-width: 1200px;
}

.notifications-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  width: 100%;
}

.notification-messages {
  padding: 0.5rem;
  max-height: none;
  overflow: visible;
}

.message-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem 1.25rem;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.message-item:hover {
  background: #f1f5f9;
  transform: translateX(4px);
}

.message-unread {
  background: #eff6ff;
  border-left-color: #3b82f6;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.message-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #3b82f6;
  margin: 0;
}

.message-time {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.message-text {
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.message-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease;
  margin-left: 1rem;
}

.message-item:hover .message-actions {
  opacity: 1;
}

.action-read.text-success {
  color: #10b981 !important;
}

.action-delete {
  color: #ef4444 !important;
}

.empty-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
}

.empty-messages h3 {
  margin: 1.5rem 0 0.75rem 0;
  color: #374151;
  font-size: 1.5rem;
}

.empty-messages p {
  color: #6b7280;
  margin: 0;
  font-size: 1.1rem;
}

.see-all-container {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.see-all-button {
  background: #10b981;
  border: none;
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 25px;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.see-all-button:hover {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.see-all-button .p-button-icon {
  margin: 0;
}

/* Dialog Styles */
.notification-details {
  padding: 1rem 0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.detail-sender {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #3b82f6;
}

.notification-type {
  font-size: 0.875rem;
  text-transform: capitalize;
  color: #374151;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.detail-time {
  font-size: 0.875rem;
  color: #64748b;
}

.detail-content h3 {
  margin: 0 0 1rem 0;
  color: #1e293b;
}

.detail-content p {
  color: #475569;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.detail-action {
  margin: 1rem 0;
}

.detail-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  font-size: 0.875rem;
}

.detail-category {
  color: #64748b;
  text-transform: capitalize;
}

.detail-priority {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.priority-urgent {
  background: #fee2e2;
  color: #dc2626;
}

.priority-high {
  background: #fef3c7;
  color: #d97706;
}

.priority-normal {
  background: #e0f2fe;
  color: #0284c7;
}

.priority-low {
  background: #f0fdf4;
  color: #16a34a;
}

/* Responsive design */
@media (max-width: 1200px) {
  .notifications-section {
    max-width: 900px;
  }
}

@media (max-width: 768px) {
  .notifications-page {
    padding: 1rem;
    max-width: 100%;
  }
  
  .notifications-section {
    max-width: 100%;
  }
  
  .message-item {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .message-actions {
    opacity: 1;
    margin-left: 0;
    align-self: flex-end;
  }
  
  .message-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .empty-messages {
    padding: 2rem 1rem;
  }
}
</style>