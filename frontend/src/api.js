import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || (
    import.meta.env.PROD
        ? 'https://placementportal-44a3.onrender.com'
        : 'http://localhost:5000'
);

const api = axios.create({
    baseURL: API_BASE_URL,
});

export { API_BASE_URL };
export default api;
