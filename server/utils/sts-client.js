// server/utils/sts-client.js
class STSClient {
  constructor(config) {
    // 配置参数
    this.config = {
      stsEndpoint: config.stsEndpoint || '',
      requestMethod: config.requestMethod || 'GET',
      accessKeyIdPath: config.accessKeyIdPath || 'AccessKeyId',
      accessKeySecretPath: config.accessKeySecretPath || 'AccessKeySecret',
      securityTokenPath: config.securityTokenPath || 'SecurityToken',
      expirationPath: config.expirationPath || 'Expiration',
      ...config
    };
  }

  // 获取 STS 临时凭证
  async getSTSCredentials() {
    try {
      const response = await fetch(this.config.stsEndpoint, {
        method: this.config.requestMethod,
        headers: this.config.requestHeaders || {},
        body: this.config.requestMethod === 'POST' ? 
               JSON.stringify(this.config.requestBody || {}) : 
               null
      });

      if (!response.ok) {
        throw new Error(`获取STS凭证失败: ${response.status}`);
      }

      const data = await response.json();
      
      // 从响应数据中提取凭证信息
      const credentials = {
        accessKeyId: this._getNestedProperty(data, this.config.accessKeyIdPath),
        accessKeySecret: this._getNestedProperty(data, this.config.accessKeySecretPath),
        securityToken: this._getNestedProperty(data, this.config.securityTokenPath),
        expiration: this._getNestedProperty(data, this.config.expirationPath)
      };
      
      // 验证凭证是否有效
      if (!credentials.accessKeyId || !credentials.accessKeySecret || !credentials.securityToken) {
        throw new Error('STS凭证格式不正确');
      }
      
      return credentials;
    } catch (error) {
      console.error('获取STS凭证错误:', error);
      throw error;
    }
  }

  // 获取嵌套对象属性的工具方法
  _getNestedProperty(obj, path) {
    if (!obj || !path) return null;
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }
}

module.exports = STSClient;