import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// CHANGE THIS URL BASED ON YOUR ENV
// Android Emulator: http://10.0.2.2:3000/it4788
// iOS Simulator: http://localhost:3000/it4788
// Physical Device: http://<YOUR_LAN_IP>:3000/it4788
const BASE_URL = 'http://192.168.1.7:3000/it4788';

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
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default client;
