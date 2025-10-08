import axios from '../api/axios';

const REPORT_API = {
  // Lấy danh sách dịch vụ
  getServices: () => {
    return axios.get('/statistics/services');
  },

  // Lấy danh sách năm có dữ liệu
  getExpenseReportYears: () => {
    return axios.get('/statistics/expense-report/years');
  },

  // Lấy báo cáo chi phí
  getExpenseReport: (params) => {
    return axios.get('/statistics/expense-report', { params });
  }
};

export default REPORT_API; 