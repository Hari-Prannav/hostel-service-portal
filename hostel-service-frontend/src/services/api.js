import axios from 'axios';

const API = axios.create({
  baseURL: 'https://hostel-service-portal-1.onrender.com/api', // Your backend URL
});

// This interceptor attaches the JWT token to every request automatically
API.interceptors.request.use((req) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    req.headers.Authorization = `Bearer ${JSON.parse(userInfo).token}`;
  }
  return req;
});

export default API;