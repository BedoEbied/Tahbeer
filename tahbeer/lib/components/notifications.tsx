'use client';

import { useNotifications } from '@/lib/stores/notifications';

export const Notifications = () => {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        maxWidth: '400px',
      }}
    >
      {notifications.map((notification) => (
        <div
          key={notification.id}
          style={{
            padding: '1rem',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            backgroundColor:
              notification.type === 'error'
                ? '#fee2e2'
                : notification.type === 'success'
                ? '#d1fae5'
                : notification.type === 'warning'
                ? '#fef3c7'
                : '#dbeafe',
            color:
              notification.type === 'error'
                ? '#991b1b'
                : notification.type === 'success'
                ? '#065f46'
                : notification.type === 'warning'
                ? '#92400e'
                : '#1e40af',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
              {notification.title}
            </div>
            {notification.message && (
              <div style={{ fontSize: '0.875rem' }}>{notification.message}</div>
            )}
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            style={{
              marginLeft: '1rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.25rem',
              lineHeight: 1,
              opacity: 0.7,
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
