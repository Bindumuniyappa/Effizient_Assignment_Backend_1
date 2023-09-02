const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const sopRoutes = require('./routes/sopRoutes');


const app = express();
app.use(cors())

const port = 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/sop', sopRoutes);

app.listen(port, () => {
  console.log(`SOP generator app listening at http://localhost:${port}`);
});
