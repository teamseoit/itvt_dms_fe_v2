import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  return dayjs(dateString).format('DD/MM/YYYY HH:mm:ss');
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  return dayjs(dateString).format('DD/MM/YYYY');
}; 

export const maskPhoneNumber = (phone) => {
  let phoneStr = phone.toString();
  if (phoneStr.startsWith('84')) {
    phoneStr = '0' + phoneStr.slice(2);
  }
  phoneStr = phoneStr.padStart(10, '0');
  const visible = phoneStr.slice(0, 7);
  return visible.replace(/(\d{4})(\d{2})/, '$1 $2') + '****';
};

export const convertToFullUrl = (filePath) => {
  if (!filePath) return '';
  const path = filePath.replace(/\\/g, '/');
  return `${import.meta.env.VITE_API_UPLOAD}/${path}`;
};

export const extractDomain = (url) => {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}
