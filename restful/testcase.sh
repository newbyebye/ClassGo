1. 注册账号
curl -H "Content-Type:application/json" --data '{"username":"admin1","password":"admin"}' http://localhost:3000/api/user/new

2. 登陆
curl -H "Content-Type:application/json" --data '{"username":"admin5","password":"admin"}' http://localhost:3000/api/user/login

{"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjksImlhdCI6MTQ1OTc0NDA0N30.QcWSRFrzSqORYXbYobnewVvJK5WdDhZ3WugJxYyzFNE","ttl":1209600,"userId":9}
3. 获取用户信息
curl -H "Content-Type:application/json" http://localhost:3000/api/user/9

{"id":9,"username":"admin5","password":"admin","email":null,"emailVerified":null,"gender":null,"photo":null,"fullname":null,"mobile":null,"region":null,"school":null,"brief":null,"createAt":"2016-04-04T03:04:47.000Z","updateAt":"0000-00-00 00:00:00"}

4. 更新用户信息
curl -H "Content-Type:application/json" -H "x-access-token:eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjksImlhdCI6MTQ1OTc0NDA0N30.QcWSRFrzSqORYXbYobnewVvJK5WdDhZ3WugJxYyzFNE" --data '{"email":"sunbo_bb@163.com","emailVerified":null,"gender":1,"photo":null,"fullname":null,"mobile":null,"region":null,"school":null,"brief":null,"createAt":"2016-04-04T03:04:47.000Z","updateAt":"0000-00-00 00:00:00"}' http://localhost:3000/api/user/9



5. 发贴

curl -H "Content-Type:application/json" -H "x-access-token:eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjksImlhdCI6MTQ1OTc0NDA0N30.QcWSRFrzSqORYXbYobnewVvJK5WdDhZ3WugJxYyzFNE" --data '{"title":"demo", "body":"demo"}' http://localhost:3000/api/post/new

6. 获取帖子信息
curl -H "Content-Type:application/json" http://localhost:3000/api/post/1

7. 修改贴子
curl -H "Content-Type:application/json" -H "x-access-token:eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjksImlhdCI6MTQ1OTc0NDA0N30.QcWSRFrzSqORYXbYobnewVvJK5WdDhZ3WugJxYyzFNE" --data '{"title":"demo1", "body":"demo1"}' http://localhost:3000/api/post/1/edit

8. 启动签到
curl -H "Content-Type:application/json" -H "x-access-token:eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjksImlhdCI6MTQ1OTc0NDA0N30.QcWSRFrzSqORYXbYobnewVvJK5WdDhZ3WugJxYyzFNE" --data '{"status": 1, "starttime": "2010-10-05", "timeout": 600, "lng":12312.1231, "lat":1.2342} ' http://localhost:3000/api/post/1/lesson/new

9. 停止签名
curl -H "Content-Type:application/json" -H "x-access-token:eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjksImlhdCI6MTQ1OTc0NDA0N30.QcWSRFrzSqORYXbYobnewVvJK5WdDhZ3WugJxYyzFNE" --data '{"status": 2, "starttime": "2010-10-05", "timeout": 600, "lng":12312.1231, "lat":1.2342} ' http://localhost:3000/api/post/lesson/1/edit

10. 学生签名
curl -H "Content-Type:application/json" -H "x-access-token:eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjksImlhdCI6MTQ1OTc0NDA0N30.QcWSRFrzSqORYXbYobnewVvJK5WdDhZ3WugJxYyzFNE" --data '{"lng":12312.1231, "lat":1.2342} ' http://localhost:3000/api/post/lesson/1/sign

