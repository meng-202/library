require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api', apiRoutes);

// 数据库连接
const startServer = async () => {
  try {
    // 使用IPv4地址避免IPv6问题
    await mongoose.connect(process.env.DB.replace('localhost', '127.0.0.1'), {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Database connected');
    
    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    
    return server; // 返回服务器实例
  } catch (err) {
    console.error('Database connection failed', err);
    process.exit(1);
  }
};

// 导出app和startServer函数
module.exports = { app, startServer };