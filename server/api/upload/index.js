// server/api/upload/index.js
const OSS = require('ali-oss');
const STSClient = require('../../utils/sts-client');
const config = require('../../config');

// 分块上传处理函数
module.exports.handler = async (event, context) => {
  try {
    const { method } = event;
    
    switch (method) {
      case 'POST':
        return await handleUpload(event);
      case 'GET':
        return await handleGetUploadStatus(event);
      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ message: '不支持的请求方法' })
        };
    }
  } catch (error) {
    console.error('上传处理错误:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: '服务器错误', error: error.message })
    };
  }
};

// 处理文件上传
async function handleUpload(event) {
  const { 
    chunk, 
    chunks, 
    fileKey, 
    fileName, 
    fileSize,
    config: uploadConfig 
  } = JSON.parse(event.body);
  
  // 初始化 STS 客户端
  const stsClient = new STSClient(uploadConfig.sts);
  const stsCredentials = await stsClient.getSTSCredentials();
  
  // 初始化 OSS 客户端
  const oss = new OSS({
    region: uploadConfig.oss.region,
    accessKeyId: stsCredentials.accessKeyId,
    accessKeySecret: stsCredentials.accessKeySecret,
    securityToken: stsCredentials.securityToken,
    bucket: uploadConfig.oss.bucket
  });
  
  // 分块上传
  const result = await oss.multipartUpload(fileKey, event.isBase64Encoded 
    ? Buffer.from(event.body, 'base64') 
    : event.body, {
    partSize: uploadConfig.chunkSize || 1024 * 1024 * 5, // 5MB per chunk
    parallel: uploadConfig.parallel || 3, // 并行上传块数
    progress: (p, c) => {
      console.log(`上传进度: ${p * 100}%`);
    }
  });
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: '上传成功',
      data: result
    })
  };
}

// 获取上传状态
async function handleGetUploadStatus(event) {
  const { fileKey, uploadConfig } = JSON.parse(event.body);
  
  // 初始化 STS 客户端
  const stsClient = new STSClient(uploadConfig.sts);
  const stsCredentials = await stsClient.getSTSCredentials();
  
  // 初始化 OSS 客户端
  const oss = new OSS({
    region: uploadConfig.oss.region,
    accessKeyId: stsCredentials.accessKeyId,
    accessKeySecret: stsCredentials.accessKeySecret,
    securityToken: stsCredentials.securityToken,
    bucket: uploadConfig.oss.bucket
  });
  
  // 获取分片上传信息
  const uploadId = await oss.getMultipartUploadId(fileKey);
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: '获取状态成功',
      data: {
        uploadId: uploadId.uploadId,
        fileKey
      }
    })
  };
}