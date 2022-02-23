import express from 'express';
import bodyParser from 'body-parser';
import twilio from 'twilio';
import cors from "cors";
import "dotenv/config";
import sendMessage from './utiles/whatsappSendMessage.mjs'
import textQueryRequestResponse from './utiles/DialogflowHelper.mjs'

const app = express();
const PORT = process.env.PORT || 3000;
// const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
const twilioClient="";
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin: '*'
}));

app.get('/', (req, res) => {
    res.send("Server is running")
})

//! Twilio messeging end point
app.post("/twiliowebhook", (req, res) => {

    // console.log("req: ", JSON.stringify(req.body));

    console.log("message: ", req.body.Body);

   // TODO: ask dialogflow what to respond
   
   
    let twiml = new twilio.twiml.MessagingResponse()
    twiml.message('The Robots are coming! Head for the hills!');

    res.header('Content-Type', 'text/xml');
    res.send(twiml.toString());
})

//! Whatsapp webhook
app.post("/whatsappwebhook", (req, res) => {
    let message = req.body.Body;
    let senderID = req.body.From;

    console.log(`${message} --- ${senderID} --- ${process.env.TWILIO_NUMBER}`)

    sendMessage(twilioClient, "Hello From Pc", senderID, process.env.TWILIO_NUMBER)
})

//! Dialogflow response endpoint
app.post("/talktochatbot", async (req, res) => {

    
    const {responses} = await textQueryRequestResponse(
        process.env.DIALOGFLOW_PROJECT_ID,
        req.query.text,
        'en-US'
    )
   
    res.send({
        text: responses[0].queryResult.fulfillmentText
    });

})

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});
