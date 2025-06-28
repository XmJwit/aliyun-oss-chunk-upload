// frontend/src/components/OSSFileUploader.jsx
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const OSSFileUploader = ({ config }) => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('等待上传');
  const [chunks, setChunks] = useState(10);
  const [chunkSize, setChunkSize] = useState(5 * 1024 * 1024); // 5MB
  const fileInputRef = useRef(null);

  // 生成随机文件Key
  const generateFileKey = (fileName) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 10);
    const extension = fileName.split('.').pop();
    
    return `uploads/${year}/${month}/${day}/${random}.${extension}`;
  };

  // 处理文件选择
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // 根据文件大小自动计算分块数
      if (selectedFile.size > chunkSize) {
        const optimalChunks = Math.ceil(selectedFile.size / chunkSize);
        setChunks(optimalChunks > 100 ? 100 : optimalChunks);
      }
    }
  };

  // 开始上传
  const handleStartUpload = async () => {
    if (!file) {
      alert('请先选择文件');
      return;
    }
    
    setIsUploading(true);
    setUploadStatus('正在上传...');
    setUploadProgress(0);
    
    const fileKey = generateFileKey(file.name);
    
    try {
      // 分块上传
      const formData = new FormData();
      formData.append('file', file);
      formData.append('chunks', chunks);
      formData.append('chunk', 0);
      formData.append('fileKey', fileKey);
      formData.append('fileName', file.name);
      formData.append('fileSize', file.size);
      formData.append('config', JSON.stringify(config));
      
      // 上传进度监听
      const onUploadProgress = (progressEvent) => {
        if (progressEvent.lengthComputable) {
          const percentComplete = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentComplete);
        }
      };
      
      const response = await axios.post(
        `${config.apiBaseUrl}/api/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress
        }
      );
      
      setUploadStatus('上传完成');
      setIsUploading(false);
      
      return response.data;
    } catch (error) {
      console.error('上传错误:', error);
      setUploadStatus('上传失败');
      setIsUploading(false);
      throw error;
    }
  };

  return (
    <div className="oss-uploader">
      <h3>阿里云 OSS 大文件分块上传</h3>
      
      <div className="form-group">
        <label htmlFor="file-upload">选择文件:</label>
        <input 
          type="file" 
          id="file-upload" 
          ref={fileInputRef}
          onChange={handleFileSelect}
        />
        {file && (
          <div className="file-info">
            <p>文件名: {file.name}</p>
            <p>文件大小: {formatFileSize(file.size)}</p>
          </div>
        )}
      </div>
      
      <div className="form-group">
        <label>分块设置:</label>
        <div className="chunk-settings">
          <div>
            <label>分块大小:</label>
            <select 
              value={chunkSize / (1024 * 1024)}
              onChange={(e) => setChunkSize(parseInt(e.target.value) * 1024 * 1024)}
            >
              <option value="1">1MB</option>
              <option value="5" selected>5MB</option>
              <option value="10">10MB</option>
              <option value="50">50MB</option>
              <option value="100">100MB</option>
            </select>
          </div>
          <div>
            <label>分块数量:</label>
            <input 
              type="number" 
              min="1" 
              max="100" 
              value={chunks}
              onChange={(e) => setChunks(parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>
      
      <div className="upload-actions">
        <button 
          onClick={handleStartUpload} 
          disabled={isUploading || !file}
        >
          {isUploading ? '上传中...' : '开始上传'}
        </button>
      </div>
      
      {isUploading && (
        <div className="progress-bar">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${uploadProgress}%` }}
          ></div>
          <span>{uploadProgress}%</span>
        </div>
      )}
      
      <div className="upload-status">
        <p>状态: <strong>{uploadStatus}</strong></p>
      </div>
    </div>
  );
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default OSSFileUploader;