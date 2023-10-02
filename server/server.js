import express from 'express';
import cors from 'cors';
import fileUpload from "express-fileupload";
import csv from "csv-parser";
import dotenv from "dotenv";
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { bufferToStream } from './utils.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(fileUpload());

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.post('/upload', async (req, res) => {
    const file = req.files.file;
    const sheetUrl = req.body.sheetUrl;
    const sheetName = req.body.sheetName;
    const sep = req.body.seperator;
    var headers = req.body.headers;
    if (headers){
        headers = headers.split(',');
    }

    const sheetId = sheetUrl.split('/')[5];

    const serviceAccountAuth = new JWT({
        email: process.env.CLIENT_EMAIL,
        key: process.env.PRIVATE_KEY,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    })
    
    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);

    await doc.loadInfo();
    
    const sheet = doc.sheetsByTitle[sheetName];

    if (!sheet){
        res.status(500).json({
            success: false,
            message: 'Sheet not found'
        })
    }

    if (headers.length > 0){
        await sheet.setHeaderRow(headers);
    }

    try{
        const buf = file.data;
        const results = [];
        bufferToStream(buf)
            .pipe(csv({separator: sep}))
            .on('headers', (headers) => {
                if(headers.length === 0){
                    sheet.setHeaderRow(headers);
                }
            })
            .on('data', (row) => {
                results.push(row);
            })
            .on('end', () => {
                sheet.addRows(results).then(() => {
                    res.status(200).json({
                        success: true
                    })
                }).catch((err) => {
                    res.status(500).json({
                        success: false,
                        message: err
                    })
                })
            })
            .on('error', (err) => {
                console.log(err.message);
                res.status(500).json({
                    success: false,
                    message: err
                })
            })

    }
    catch(err){
        console.log(err.message);
        res.status(500).json({
            success: false,
            message: err
        })
    }
})


app.post('/getColumns', async (req, res) => {
    const file = req.files.file;
    const sep = req.body.seperator;
    try{
        const buf = file.data;
        bufferToStream(buf)
            .pipe(csv({separator: sep}))
            .on('headers', (headers) => {
                res.status(200).json({
                    success: true,
                    columns: headers
                })
            })
            .on('error', (err) => {
                res.status(500).json({
                    success: false,
                    message: err
                })
            })   
    }
    catch(err){
        res.status(500).json({
            success: false,
            message: err
        })
    }
})


app.listen(5000, () => {
    console.log('Server started on port 5000');
});