/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

 const { default: axios } = require('axios');
 var bodyParser = require('body-parser');
 var express = require('express');
 var app = express();
 var xhub = require('express-x-hub');
 const headers = {
   'Content-Type': 'application/json',
   'Authorization': `Bearer ${process.env.AUTHORIZATION}`
 }
 
 const interactiveBody = {
   messaging_product: "whatsapp",
   recipient_type: "individual",
   to: "94778836023",
   type: "interactive",
   interactive: {
     type: "list",
     header: {
       type: "text",
       text: "HEADER_TEXT"
     },
     body: {
       text: "BODY_TEXT"
     },
     footer: {
       text: "FOOTER_TEXT"
     },
     action: {
       button: "BUTTON_TEXT",
       sections: [
         {
           title: "SECTION_1_TITLE",
           rows: [
             {
               id: "SECTION_1_ROW_1_ID",
               title: "SECTION_1_ROW_1_TITLE",
               description: "SECTION_1_ROW_1_DESCRIPTION"
             },
             {
               id: "SECTION_1_ROW_2_ID",
               title: "SECTION_1_ROW_2_TITLE",
               description: "SECTION_1_ROW_2_DESCRIPTION"
             }
           ]
         },
         {
           title: "SECTION_2_TITLE",
           rows: [
             {
               id: "SECTION_2_ROW_1_ID",
               title: "SECTION_2_ROW_1_TITLE",
               description: "SECTION_2_ROW_1_DESCRIPTION"
             },
             {
               id: "SECTION_2_ROW_2_ID",
               title: "SECTION_2_ROW_2_TITLE",
               description: "SECTION_2_ROW_2_DESCRIPTION"
             }
           ]
         }
       ]
     }
   }
 }
 
 app.set('port', (process.env.PORT || 5000));
 app.listen(app.get('port'));
 
 app.use(xhub({ algorithm: 'sha1', secret: process.env.APP_SECRET }));
 app.use(bodyParser.json());
 
 var token = process.env.TOKEN || 'token';
 var received_updates = [];
 
 app.get('/', function(req, res) {
   console.log(req);
   res.send('<pre>' + JSON.stringify(received_updates, null, 2) + '</pre>');
 });
 
 app.get(['/facebook', '/instagram'], function(req, res) {
   if (
     req.query['hub.mode'] == 'subscribe' &&
     req.query['hub.verify_token'] == token
   ) {
     res.send(req.query['hub.challenge']);
   } else {
     res.sendStatus(400);
   }
 });
 
 app.post('/facebook', function(req, res) {
   console.log('Facebook request body:', req.body);
 
   if (!req.isXHubValid()) {
     console.log('Warning - request header X-Hub-Signature not present or invalid');
     res.sendStatus(401);
     return;
   }
 
   console.log('request header X-Hub-Signature validated');
   // Process the Facebook updates here
   received_updates.unshift(req.body);
   const body = req.body
   console.log(req.body)
   if(body.entry[0].changes[0].messages[0].type == 'text'){
     axios.post(`https://graph.facebook.com/v13.0/${process.env.PHONE_ID}/messages`, interactiveBody, {headers : headers})
   }
   res.sendStatus(200);
 });
 app.listen();
 