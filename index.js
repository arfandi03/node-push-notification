const express = require('express');
const webPush = require('web-push');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'client')));

app.use(bodyParser.json());

const publicVapidKey =
  'BPJzMyhMPvX59eUJb_CDePER0KnIia6uJ_0mGWl6SMwmQLtuik2v_JUeph4hYrVECL5OVGwXZLYWOVo4Mg82IAw';
const privateVapidKey = 'NCsxVc4E2WTC6h-cmJ0-fyu0eHI230gesK2qkSRvcN0';

webPush.setVapidDetails(
  'mailto:agang.usemahu03@gmail.com',
  publicVapidKey,
  privateVapidKey,
);

const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'db_notification',
  port: 8889,
});

conn.connect((err) => {
  if (err) throw err;
  console.log('Mysql Connected...');
});

app.post('/subcription', (req, res) => {
  const subcription = req.body;

  const payload = JSON.stringify({ title: 'Push Test' });

  const { keys, ...data } = subcription;
  data.auth = keys.auth;
  data.p256dh = keys.p256dh;

  console.log('data', data);

  const sql = 'INSERT INTO subcriptions SET ?';

  let response = {};

  conn.query(sql, data, (err, results) => {
    if (err) throw err;
    response = results;
  });

  webPush
    .sendNotification(subcription, payload)
    .catch((err) => console.log(err));

  res.status(201).json(response);
});

app.get('/broadcast', (req, res) => {
  const notification = { title: 'Hey, this is a push notification!' };

  const notifications = [];

  const sql = 'SELECT * FROM subcriptions';

  conn.query(sql, async (err, results) => {
    if (err) throw err;

    for (let index = 0; index < results.length; index++) {
      const subcription = results[index];

      console.log('subcription', subcription);

      const { auth, p256dh, ...newSubcription } = subcription;
      console.log('auth', auth);
      console.log('p256dh', auth);

      const keys = { auth, p256dh };
      console.log('keys', keys);

      newSubcription.keys = keys;

      console.log('newSubcription', newSubcription);

      const sendResult = await webPush
        .sendNotification(newSubcription, JSON.stringify(notification))
        .catch((err) => console.log(err));

      notifications.push(sendResult);
    }

    await Promise.all(notifications);

    console.log('notifications', notifications);

    res.status(200).json(notifications);
  });
});

const port = 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));
