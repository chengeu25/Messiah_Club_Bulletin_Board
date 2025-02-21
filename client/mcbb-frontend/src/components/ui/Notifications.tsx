import { IoMdClose } from 'react-icons/io';
import { NotificationType } from '../../contexts/NotificationContext';

/**
 * Displays a list of notifications
 *
 * @param {{notifications: NotificationType[], deleteNotification: (id: string) => void}} props - The properties for the Notifications component
 * @returns {JSX.Element} A component displaying the notifications
 */
const Notifications = ({
  notifications,
  deleteNotification
}: {
  notifications: NotificationType[];
  deleteNotification: (id: string) => void;
}) => (
  <div
    className={`fixed top-4 w-screen flex flex-col items-center gap-4 z-[1000]`}
  >
    {notifications.map(({ type, message, id }) => (
      <div
        key={id}
        className={`p-4 rounded-md ${
          type === 'error'
            ? 'bg-red-500 text-white'
            : type === 'info'
            ? 'bg-blue-500 text-white'
            : 'bg-green-500 text-white'
        } flex flex-row gap-4 shadow-md justify-between w-[90%] sm:w-[60%] lg:w-[600px]`}
      >
        <p>{message}</p>
        <button
          onClick={() => {
            deleteNotification(id);
          }}
        >
          <IoMdClose size={24} color='white' />
        </button>
      </div>
    ))}
  </div>
);

export default Notifications;
