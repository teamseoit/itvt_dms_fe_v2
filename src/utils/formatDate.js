import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  return dayjs.utc(dateString).format('DD/MM/YYYY HH:mm:ss');
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  return dayjs.utc(dateString).format('DD/MM/YYYY');
}; 