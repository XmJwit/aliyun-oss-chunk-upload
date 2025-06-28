// server/config.js
module.exports = {
  sts: {
    stsEndpoint: 'https://your-sts-service.com/get-sts-token', // STS接口地址
    requestMethod: 'POST', // 请求方式
    accessKeyIdPath: 'credentials.accessKeyId', // accessKeyId在响应中的路径
    accessKeySecretPath: 'credentials.accessKeySecret', // accessKeySecret在响应中的路径
    securityTokenPath: 'credentials.securityToken', // securityToken在响应中的路径
    expirationPath: 'credentials.expiration', // expiration在响应中的路径
    requestHeaders: {
      'Content-Type': 'application/json'
    },
    requestBody: {
      // 可选的请求体参数
    }
  },
  oss: {
    region: 'oss-cn-hangzhou', // OSS区域
    bucket: 'your-oss-bucket' // OSS存储桶
  },
  chunkSize: 5 * 1024 * 1024, // 分块大小(5MB)
  parallel: 3, // 并行上传块数
  apiBaseUrl: 'https://your-vercel-app.vercel.app' // API基础地址
};