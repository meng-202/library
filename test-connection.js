const mongoose = require('mongoose');

async function testConnection() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/library');
    console.log('✅ MongoDB 连接成功');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ MongoDB 连接失败:', err.message);
  }
}

testConnection();