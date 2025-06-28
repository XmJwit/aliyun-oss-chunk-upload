// server/handler.js
const express = require('express');
const cors = require('cors');
const uploadHandler = require('./api/upload');
const stsHandler = require('./api/sts');

const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API路由
app.post('/api/upload', uploadHandler);
app.get('/api/sts', stsHandler);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    message: '服务器内部错误',
    error: err.message
  });
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在端口 ${port}`);
});

module.exports = app;