import axios from '../api/axios';
import DOMAIN_SERVICE_API from './services/domainServiceService';
import SSL_SERVICE_API from './services/sslServiceService';
import HOSTING_SERVICE_API from './services/hostingServiceService';
import EMAIL_SERVICE_API from './services/emailServiceService';
import WEBSITE_SERVICE_API from './services/websiteServiceService';
import CONTRACT_API from './contractService';

const DASHBOARD_API = {
  // Lấy thống kê tổng quan cho dashboard
  getServiceStats: async () => {
    try {
      const [domainStats, sslStats, hostingStats, emailStats, websiteStats, contractStats] = await Promise.all([
        // Domain service stats
        Promise.all([
          DOMAIN_SERVICE_API.getAll({ page: 1, limit: 1 }),
          DOMAIN_SERVICE_API.getAll({ page: 1, limit: 1, status: 2 }),
          DOMAIN_SERVICE_API.getAll({ page: 1, limit: 1, status: 3 })
        ]),
        // SSL service stats
        Promise.all([
          SSL_SERVICE_API.getAll({ page: 1, limit: 1 }),
          SSL_SERVICE_API.getAll({ page: 1, limit: 1, status: 2 }),
          SSL_SERVICE_API.getAll({ page: 1, limit: 1, status: 3 })
        ]),
        // Hosting service stats
        Promise.all([
          HOSTING_SERVICE_API.getAll({ page: 1, limit: 1 }),
          HOSTING_SERVICE_API.getAll({ page: 1, limit: 1, status: 2 }),
          HOSTING_SERVICE_API.getAll({ page: 1, limit: 1, status: 3 })
        ]),
        // Email service stats
        Promise.all([
          EMAIL_SERVICE_API.getAll({ page: 1, limit: 1 }),
          EMAIL_SERVICE_API.getAll({ page: 1, limit: 1, status: 2 }),
          EMAIL_SERVICE_API.getAll({ page: 1, limit: 1, status: 3 })
        ]),
        // Website service stats
        Promise.all([
          WEBSITE_SERVICE_API.getAll({ page: 1, limit: 1 }),
          WEBSITE_SERVICE_API.getAll({ page: 1, limit: 1, status: 2 })
        ]),
        // Contract stats
        Promise.all([
          CONTRACT_API.getAll({ page: 1, limit: 1 }),
          CONTRACT_API.getAll({ page: 1, limit: 1, status: 2 }),
          CONTRACT_API.getAll({ page: 1, limit: 1, status: 3 })
        ])
      ]);

      return {
        domain: {
          total: domainStats[0].data.meta?.totalDocs || 0,
          nearExpired: domainStats[1].data.meta?.totalDocs || 0,
          expired: domainStats[2].data.meta?.totalDocs || 0,
          active: (domainStats[0].data.meta?.totalDocs || 0) - (domainStats[1].data.meta?.totalDocs || 0) - (domainStats[2].data.meta?.totalDocs || 0)
        },
        ssl: {
          total: sslStats[0].data.meta?.totalDocs || 0,
          nearExpired: sslStats[1].data.meta?.totalDocs || 0,
          expired: sslStats[2].data.meta?.totalDocs || 0,
          active: (sslStats[0].data.meta?.totalDocs || 0) - (sslStats[1].data.meta?.totalDocs || 0) - (sslStats[2].data.meta?.totalDocs || 0)
        },
        hosting: {
          total: hostingStats[0].data.meta?.totalDocs || 0,
          nearExpired: hostingStats[1].data.meta?.totalDocs || 0,
          expired: hostingStats[2].data.meta?.totalDocs || 0,
          active: (hostingStats[0].data.meta?.totalDocs || 0) - (hostingStats[1].data.meta?.totalDocs || 0) - (hostingStats[2].data.meta?.totalDocs || 0)
        },
        email: {
          total: emailStats[0].data.meta?.totalDocs || 0,
          nearExpired: emailStats[1].data.meta?.totalDocs || 0,
          expired: emailStats[2].data.meta?.totalDocs || 0,
          active: (emailStats[0].data.meta?.totalDocs || 0) - (emailStats[1].data.meta?.totalDocs || 0) - (emailStats[2].data.meta?.totalDocs || 0)
        },
        website: {
          total: websiteStats[0].data.meta?.totalDocs || 0,
          active: (websiteStats[0].data.meta?.totalDocs || 0) - (websiteStats[1].data.meta?.totalDocs || 0),
          closed: websiteStats[1].data.meta?.totalDocs || 0
        },
        contract: {
          total: contractStats[0].data.meta?.totalDocs || 0,
          nearExpired: contractStats[1].data.meta?.totalDocs || 0,
          expired: contractStats[2].data.meta?.totalDocs || 0,
          active: (contractStats[0].data.meta?.totalDocs || 0) - (contractStats[1].data.meta?.totalDocs || 0) - (contractStats[2].data.meta?.totalDocs || 0)
        }
      };
    } catch (error) {
      console.error('Error fetching service stats:', error);
      throw error;
    }
  }
};

export default DASHBOARD_API;
