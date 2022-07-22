var express = require('express');

var router = express.Router();

var mysql = require('mysql');

models = {
    mysql: {
        host: '121.5.218.161',
        port: 3306,
        user: 'root',
        password: 'zcy723',
        database: 'web'
    }
};

var conn = mysql.createConnection(models.mysql);
conn.connect();

var jsonWrite = function(res, ret) {
    if(typeof ret === 'undefined') {
      res.json({
        code: '1',
        msg: '操作失败'
      });
    } else {
      res.json(ret);
    }
  };


router.post('/search', (req, res) => {
    var params = req.body;
    var sql = " select * from news where title like '%" + params.title + "%'";
    console.log(params);
    conn.query(sql, [params],function(err, result) {
        if (err) {
          console.log(err);
        }
        if (result) {
          jsonWrite(res, result);
        }
      }
    )
});

router.post('/graph', (req, res) => {
  var params = req.body;
  var sql = "SELECT publish_date,COUNT(*) FROM (SELECT * FROM news WHERE title LIKE '%" + params.title + "%') as tmp GROUP BY publish_date;";
  console.log(params);
  conn.query(sql, [params],function(err, result) {
      if (err) {
        console.log(err);
      }
      if (result) {
        jsonWrite(res, result);
      }
    }
  )
});


module.exports = router;