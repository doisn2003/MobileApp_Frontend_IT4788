import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import * as Constants from '../../constants.js';

// CHANGE THIS URL BASED ON YOUR ENV
// Android Emulator: http://10.0.2.2:3000/it4788
// iOS Simulator: http://localhost:3000/it4788
// Physical Device: http://<YOUR_LAN_IP>:3000/it4788

const BASE_URL = Constants.API_BASE_URL;

const client = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

client.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
            // console.log('Token found, attaching to header:', token.substring(0, 10) + '...');
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.log('WARNING: No token found in SecureStore!');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default client;
