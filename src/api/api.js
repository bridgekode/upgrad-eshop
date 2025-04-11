import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'https://dev-project-ecommerce.upgrad.dev/api',
  headers: {
    'Content-Type': 'application/json',
    'x-auth-token': 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbkBkZW1vLmNvbSIsImlhdCI6MTc0NDMwMjcyOSwiZXhwIjoxNzQ0MzExMTI5fQ.GGCV1v3eQ_OrVfO7n1RA60HSMeDKLNBdvnNwccBAFsCYPAQjAf9NmeS3bqpgwSNIFMPSdmppdWhswW0D2X1ZYQ'
  }
});

export default api; 