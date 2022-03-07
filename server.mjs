import express from 'express';
import bodyParser from 'body-parser';
import twilio from 'twilio';
import cors from "cors";
import "dotenv/config";
import sendMessage from './utiles/whatsappSendMessage.mjs'
import textQueryRequestResponse from './utiles/DialogflowHelper.mjs'
import { WebhookClient, Card, Suggestion, Image, Payload } from 'dialogflow-fulfillment';
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
        req.body.text,
        'en-US'
    )
   
    res.send({
        text: responses[0].queryResult.fulfillmentText
    });

})
app.post("/webhook", (req, res) => {

    const agent = new WebhookClient({ request: req, response: res });

    function welcome(agent) {
        // agent.add(new Card({
        //     title: 'Vibrating molecules',
        //     imageUrl: "https://media.nationalgeographic.org/assets/photos/000/263/26383.jpg",
        //     text: 'Did you know that temperature is really just a measure of how fast molecules are vibrating around?! 😱',
        //     buttonText: 'Temperature Wikipedia Page',
        //     buttonUrl: "https://sysborg.com"
        // })
        // );

        let image = new Image("https://media.nationalgeographic.org/assets/photos/000/263/26383.jpg");

        agent.add(image)

        // agent.add(` //ssml
        //     <speak>
        //         <prosody rate="slow" pitch="-2st">Can you hear me now?</prosody>
        //     </speak>
        // `);

        agent.add('Welcome to the Weather Assistant!');
        agent.add('you can ask me name, or weather updates');
        agent.add(new Suggestion('what is your name'));
        agent.add(new Suggestion('Weather update'));
        agent.add(new Suggestion('Cancel'));


        const facebookSuggestionChip = [{
            "content_type": "text",
            "title": "I am quick reply",
            // "image_url": "http://example.com/img/red.png",
            // "payload":"<DEVELOPER_DEFINED_PAYLOAD>"
        },
        {
            "content_type": "text",
            "title": "I am quick reply 2",
            // "image_url": "http://example.com/img/red.png",
            // "payload":"<DEVELOPER_DEFINED_PAYLOAD>"
        }]
        const payload = new Payload(
            'FACEBOOK',
            facebookSuggestionChip
        );
        agent.add(payload)

    }

    function tellWeather(agent) {
        // Get parameters from Dialogflow to convert
        const cityName = agent.parameters.cityName;

        console.log(`User requested to city ${cityName}`);

        //TODO: Get weather from api

        // Compile and send response
        agent.add(`in ${cityName} its 27 degree centigrade, would you like to know anything else?`);
        // agent.add(new Suggestion('What is your name'));
        // agent.add(new Suggestion('Hi'));
        // agent.add(new Suggestion('Cancel'));
    }

    function fallback(agent) {
        agent.add('Woah! Its getting a little hot in here.');
        agent.add(`I didn't get that, can you try again?`);
    }

    let intentMap = new Map(); // Map functions to Dialogflow intent names
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('tellWeather', tellWeather);
    intentMap.set('Default Fallback Intent', fallback);
    agent.handleRequest(intentMap);

})
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});
