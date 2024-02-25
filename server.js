const mongoose = require('mongoose');

require('dotenv').config({
  path: './config.env',
});
const app = require('./app');

process.on('uncaughtException', (err, origin) => {
  console.log('uncaughtException .........');
  console.log(err.name, err.message);
  process.exit(1);
});

const Db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATEBASE_PASSWORD,
);
mongoose
  .connect(Db, {
    useNewUrlParser: true,
  })
  .then(() => console.log('connected'));
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`listening on port: ${port}`);
});
process.on('unhandledRejection', (err) => {
  console.log('Unhandled rejection .........');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
