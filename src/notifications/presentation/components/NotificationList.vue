<template>
  <div class="notification-list">
    <!-- Filters and Actions Header -->
    <div class="list-header">
      <div class="filter-controls">
        <Dropdown
          v-model="selectedFilter"
          :options="filterOptions"
          option-label="label"
          option-value="value"
          placeholder="Filter notifications"
          class="filter-dropdown"
          @change="applyFilter"
        />
        
        <Button
          label="Mark All Read"
          icon="pi pi-check"
          @click="markAllAsRead"
          :disabled="!hasUnread"
          class="p-button-sm p-button-outlined"
        />
      </div>
      
      <div class="notification-count">
        <span v-if="hasUnread" class="unread-count">
          {{ unreadCount }} unread
        </span>
        <span class="total-count">
          {{ totalCount }} total
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <ProgressSpinner size="50px" />
      <p>Loading notifications...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="notifications.length === 0" class="empty-state">
      <i class="pi pi-bell-slash" style="font-size: 3rem; color: #cbd5e1;"></i>
      <h3>No notifications</h3>
      <p>You're all caught up! No new notifications to show.</p>
    </div>

    <!-- Notifications List -->
    <div v-else class="notifications-container">
      <!-- Group by date if enabled -->
      <div v-if="groupByDate" class="grouped-notifications">
        <div 
          v-for="(group, date) in groupedNotifications" 
          :key="date"
          class="notification-group"
        >
          <div class="group-header">
            <h4 class="group-date">{{ formatGroupDate(date) }}</h4>
            <span class="group-count">{{ group.length }} notifications</span>
          </div>
          
          <div class="group-items">
            <NotificationItem
              v-for="notification in group"
              :key="notification.id"
              :notification="notification"
              @click="onNotificationClick"
              @read="onNotificationRead"
              @delete="onNotificationDelete"
            />
          </div>
        </div>
      </div>

      <!-- Simple list if grouping disabled -->
      <div v-else class="simple-notifications">
        <NotificationItem
          v-for="notification in notifications"
          :key="notification.id"
          :notification="notification"
          @click="onNotificationClick"
          @read="onNotificationRead"
          @delete="onNotificationDelete"
        />
      </div>
    </div>

    <!-- Load More Button -->
    <div v-if="hasMore" class="load-more">
      <Button
        label="Load More"
        icon="pi pi-chevron-down"
        @click="loadMore"
        :loading="isLoadingMore"
        class="p-button-outlined w-full"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNotificationStore } from '../../application/notification.store'
import NotificationItem from './NotificationItem.vue'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'

const props = defineProps({
  groupByDate: {
    type: Boolean,
    default: true
  },
  showFilters: {
    type: Boolean,
    default: true
  },
  maxItems: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['notification-click', 'notification-read', 'notification-delete'])

const notificationStore = useNotificationStore()

// Local state
const selectedFilter = ref('all')
const isLoadingMore = ref(false)
const hasMore = ref(false)

// Filter options
const filterOptions = [
  { label: 'All notifications', value: 'all' },
  { label: 'Unread only', value: 'unread' },
  { label: 'Read only', value: 'read' },
  { label: 'Medical', value: 'medical' },
  { label: 'Appointments', value: 'appointment' },
  { label: 'Reminders', value: 'reminder' },
  { label: 'System', value: 'system' },
  { label: 'Urgent', value: 'urgent' },
  { label: 'High Priority', value: 'high' }
]

// Computed properties
const isLoading = computed(() => notificationStore.state.isLoading)
const notifications = computed(() => notificationStore.filteredNotifications)
const groupedNotifications = computed(() => notificationStore.groupedNotifications)
const unreadCount = computed(() => notificationStore.state.unreadCount)
const totalCount = computed(() => notificationStore.state.notifications.length)
const hasUnread = computed(() => notificationStore.hasUnreadNotifications)

// Methods
const applyFilter = () => {
  const filters = {}
  
  switch (selectedFilter.value) {
    case 'unread':
      filters.isRead = false
      break
    case 'read':
      filters.isRead = true
      break
    case 'medical':
      filters.category = 'medical'
      break
    case 'appointment':
      filters.category = 'appointment'
      break
    case 'reminder':
      filters.category = 'reminder'
      break
    case 'system':
      filters.category = 'system'
      break
    case 'urgent':
      filters.priority = 'urgent'
      break
    case 'high':
      filters.priority = 'high'
      break
    default:
      // Clear filters for 'all'
      break
  }
  
  notificationStore.setFilters(filters)
}

const markAllAsRead = async () => {
  try {
    await notificationStore.markAllAsRead()
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
  }
}

const formatGroupDate = (dateStr) => {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  } else {
    return date.toLocaleDateString([], { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
}

const onNotificationClick = (notification) => {
  emit('notification-click', notification)
}

const onNotificationRead = (notification) => {
  emit('notification-read', notification)
}

const onNotificationDelete = (notification) => {
  emit('notification-delete', notification)
}

const loadMore = async () => {
  isLoadingMore.value = true
  // Implement pagination logic here if needed
  setTimeout(() => {
    isLoadingMore.value = false
    hasMore.value = false // For now, disable after first load
  }, 1000)
}

// Initialize
onMounted(async () => {
  await notificationStore.initialize()
})
</script>

<style scoped>
.notification-list {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.filter-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.filter-dropdown {
  min-width: 200px;
}

.notification-count {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
}

.unread-count {
  color: #3b82f6;
  font-weight: 600;
}

.total-count {
  color: #64748b;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.empty-state h3 {
  margin: 1rem 0 0.5rem 0;
  color: #374151;
}

.empty-state p {
  color: #6b7280;
  margin: 0;
}

.notifications-container {
  max-height: 600px;
  overflow-y: auto;
}

.notification-group {
  border-bottom: 1px solid #f1f5f9;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.group-date {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.group-count {
  font-size: 0.75rem;
  color: #6b7280;
}

.group-items {
  padding: 0.5rem;
}

.simple-notifications {
  padding: 0.5rem;
}

.load-more {
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
}

/* Responsive design */
@media (max-width: 768px) {
  .list-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .filter-controls {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .filter-dropdown {
    min-width: 100%;
  }
  
  .notification-count {
    justify-content: center;
  }
}
</style>