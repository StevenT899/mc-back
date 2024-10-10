import { Router } from 'itty-router'
import sgMail from '@sendgrid/mail'
import { GoogleGenerativeAI } from '@google/generative-ai'


sgMail.setApiKey('YOUR_SENDGRID_API_KEY');
const genAI = new GoogleGenerativeAI('YOUR_GEN_AI_API_KEY');

const router = Router()


const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}


router.options('*', () => new Response(null, { headers: corsHeaders }))


router.get('/', () => {
    return new Response('Hello from Cloudflare Workers!', {
        headers: { 'Content-Type': 'text/plain', ...corsHeaders },
    })
})


router.post('/Reg-email', async request => {
    const { userEmail } = await request.json()

    const msg = {
        to: userEmail,
        from: 'your-email@example.com',
        subject: 'Event Registration Confirmation',
        text: 'You have successfully registered for the event.',
    }

    try {
        await sgMail.send(msg)
        return new Response(JSON.stringify({ message: 'Email sent successfully!' }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
            status: 200,
        })
    } catch (error) {
        console.error('Error sending email:', error)
        return new Response(JSON.stringify({ message: 'Failed to send email.' }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
            status: 500,
        })
    }
})


router.post('/generateAI', async request => {
    const { prompt } = await request.json()

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        const result = await model.generateContent([prompt])

        return new Response(JSON.stringify({ response: result.response.text() }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
            status: 200,
        })
    } catch (error) {
        console.error('Error generating content:', error)
        return new Response(JSON.stringify({ error: 'Failed to generate content using Gemini AI' }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
            status: 500,
        })
    }
})


export default {
    async fetch(request) {
        return router.handle(request).catch(err => {
            console.error('Unhandled error:', err)
            return new Response('Internal Server Error', { status: 500 })
        })
    }
}
