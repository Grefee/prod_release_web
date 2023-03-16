const express = require('express');
const cors = require('cors');
const db = require('./queries')

const app = express();
const port = 3005;

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
    next();
  });

app.use(cors())
app.use(express.json())

const XLSX = require('xlsx');

app.get('/getTypyLinek', db.getTypyLinek)
app.post('/getNameOfLine', db.getNameOfLine)
app.post('/getTemplateAboutLinka', db.getTemplateAboutLinka)
app.post('/insertFinalData', db.insetFinalData)

app.post('/adminReports', db.adminReports)

app.post('/getOperationsByLineId', db.getOperationsByLineId)
app.post('/getProcessesByLineId', db.getProcessesByLineId)

app.post('/createNewProcess', db.createNewProcess)
app.delete('/deleteProcess', db.deleteProcess)
app.put('/changeProcess', db.changeProcess)
app.post('/createNewOperation', db.createNewOperation)
app.delete('/deleteOperation', db.deleteOperation)
app.post('/createNewLine', db.createNewLine)

app.post('/createExport', db.createExport)

app.listen(port, () => {
  console.log(`Excel API is listening at http://localhost:${port}`);
});
