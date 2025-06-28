// frontend/src/App.js
import React from 'react';
import OSSFileUploader from './components/OSSFileUploader';
import './App.css';

function App() {
  // 从环境变量获取配置或使用默认值
  const config = {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://your-vercel-app.vercel.app',
    sts: {
      stsEndpoint: import.meta.env.VITE_STS_ENDPOINT || '',
      requestMethod: import.meta.env.VITE_STS_METHOD || 'GET',
      accessKeyIdPath: import.meta.env.VITE_ACCESS_KEY_ID_PATH || 'AccessKeyId',
      accessKeySecretPath: import.meta.env.VITE_ACCESS_KEY_SECRET_PATH || 'AccessKeySecret',
      securityTokenPath: import.meta.env.VITE_SECURITY_TOKEN_PATH || 'SecurityToken',
      expirationPath: import.meta.env.VITE_EXPIRATION_PATH || 'Expiration'
    },
    oss: {
      region: import.meta.env.VITE_OSS_REGION || 'oss-cn-hangzhou',
      bucket: import.meta.env.VITE_OSS_BUCKET || 'your-bucket-name'
    }
  };

  return (
    <div className="app-container">
      <h1>阿里云 OSS 大文件分块上传</h1>
      <OSSFileUploader config={config} />
    </div>
  );
}

export default App;