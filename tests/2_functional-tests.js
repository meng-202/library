const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const { app, startServer } = require('../server');
const mongoose = require('mongoose');

chai.use(chaiHttp);

describe('Functional Tests', function() {
  this.timeout(10000);
  let testBookId;
  let server;

  before(async function() {
    // 强制使用 IPv4 并添加错误处理
    process.env.DB = 'mongodb://127.0.0.1:27017/library';
    try {
      server = await startServer();
      await mongoose.connection.dropDatabase();
    } catch (err) {
      console.error('初始化失败:', err);
      throw err;
    }
  });

  after(async function() {
    try {
      await server.close();
      await mongoose.disconnect();
    } catch (err) {
      console.error('清理失败:', err);
    }
  });

  // 测试用例改用更健壮的写法
  describe('图书操作', function() {
    it('应成功创建新书', async function() {
      const res = await chai.request(server)
        .post('/api/books')
        .send({ title: '测试图书' });
      
      assert.equal(res.status, 200);
      assert.isString(res.body._id);
      testBookId = res.body._id;
    });

    it('应能获取图书列表', async function() {
      const res = await chai.request(server).get('/api/books');
      assert.equal(res.status, 200);
      assert.isArray(res.body);
      assert.include(res.body.map(b => b.title), '测试图书');
    });

    it('应能添加评论', async function() {
      const res = await chai.request(server)
        .post(`/api/books/${testBookId}`)
        .send({ comment: '好书！' });
      
      assert.equal(res.status, 200);
      assert.include(res.body.comments, '好书！');
    });

    it('应能删除图书', async function() {
      const res = await chai.request(server)
        .delete(`/api/books/${testBookId}`);
      
      assert.equal(res.status, 200);
      assert.equal(res.text, 'delete successful');
    });
  });

  describe('批量操作', function() {
    before(async function() {
      // 准备测试数据
      await chai.request(server)
        .post('/api/books')
        .send({ title: '临时图书1' });
      await chai.request(server)
        .post('/api/books')
        .send({ title: '临时图书2' });
    });

    it('应能删除所有图书', async function() {
      const res = await chai.request(server).delete('/api/books');
      assert.equal(res.status, 200);
      assert.equal(res.text, 'complete delete successful');
      
      // 验证确实已删除
      const checkRes = await chai.request(server).get('/api/books');
      assert.isEmpty(checkRes.body);
    });
  });
});