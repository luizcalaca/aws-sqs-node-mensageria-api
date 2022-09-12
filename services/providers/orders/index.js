const express = require('express');
const port = process.argv.slice(2)[0];
const app = express();
const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
const queueUrl = "";

app.use(express.json());
app.get('/index', (req, res) => {
    res.send("Welcome to Ecommerce Orders.")
});

app.post('/order', (req, res) => {
    let orderData = {
        'userEmail': req.body['userEmail'],
        'itemName': req.body['itemName'],
        'itemPrice': req.body['itemPrice'],
        'itemsQuantity': req.body['itemsQuantity']
    }

    let sqsOrderData = {
        MessageAttributes: {
            "userEmail": {
                DataType: "String",
                StringValue: orderData.userEmail
            },
            "itemName": {
                DataType: "String",
                StringValue: orderData.itemName
            },
            "itemPrice": {
                DataType: "Number",
                StringValue: orderData.itemPrice
            },
            "itemsQuantity": {
                DataType: "Number",
                StringValue: orderData.itemsQuantity
            }
        },
        MessageBody: JSON.stringify(orderData),
        MessageDeduplicationId: req.body['userEmail'],
        MessageGroupId: "UserOrders",
        QueueUrl: queueUrl
    };

    let sendSqsMessage = sqs.sendMessage(sqsOrderData).promise();

    sendSqsMessage.then((data) => {
        console.log(`Orders | SUCCESS: ${data.MessageId}`);
        res.send("Thank you for your order. Check you inbox for the confirmation email.");
    }).catch((err) => {
        console.log(`Orders | ERROR: ${err}`);
        res.send("We ran into an error. Please try again.");
    });
});

console.log(`Orders service on port ${port}`);
app.listen(port);