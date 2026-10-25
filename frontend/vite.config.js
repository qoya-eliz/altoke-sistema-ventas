import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
export default defineConfig({plugins:[react()],server:{port:5174,strictPort:true,host:'127.0.0.1',proxy:{'/api':{target:process.env.ALTOKE_API_TARGET || 'http://127.0.0.1:5001',changeOrigin:true}}}});
