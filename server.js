import sgMail from '@sendgrid/mail';
import { GoogleGenerativeAI } from '@google/generative-ai';


sgMail.setApiKey(SENDGRID_API_KEY);
const genAI = new GoogleGenerativeAI(GEN_AI_API_KEY);


async function handleRequest(request) {
    const { method, url } = request;
    const parsedUrl = new URL(url);
    
    if (parsedUrl.pathname === '/' && method === 'GET') {
        return new Response('Hello from Cloudflare Workers!', { status: 200 });
    } else if (parsedUrl.pathname === '/Reg-email' && method === 'POST') {
        const data = await request.json();
        return sendEmail(data.userEmail);
    } else if (parsedUrl.pathname === '/send-email' && method === 'POST') {
        const formData = await request.formData();
        return handleSendEmail(formData);
    } else if (parsedUrl.pathname === '/bulk-email' && method === 'POST') {
        const formData = await request.formData();
        return handleBulkEmail(formData);
    } else if (parsedUrl.pathname === '/generateAI' && method === 'POST') {
        const data = await request.json();
        return generateAIContent(data.prompt);
    }

    return new Response('Not Found', { status: 404 });
}


async function sendEmail(userEmail) {
    const msg = {
        to: userEmail,
        from: 'xtan0108@gmail.com',
        subject: 'Event Registration Confirmation',
        text: 'You have successfully registered for the event.',
    };

    try {
        await sgMail.send(msg);
        return new Response(JSON.stringify({ message: 'Email sent successfully!' }), { status: 200 });
    } catch (error) {
        console.error('Error sending email:', error.message);
        return new Response(JSON.stringify({ message: 'Failed to send email.' }), { status: 500 });
    }
}

async function handleSendEmail(formData) {
    const from = formData.get('from');
    const subject = formData.get('subject');
    const text = formData.get('text');
    const attachments = [];

    for (let file of formData.getAll('attachments')) {
        const content = await file.arrayBuffer();
        attachments.push({
            content: btoa(String.fromCharCode(...new Uint8Array(content))),
            filename: file.name,
            type: file.type,
            disposition: 'attachment',
        });
    }

    const msg = {
        to: 'xtan0108@gmail.com',
        from,
        subject,
        text,
        attachments,
    };

    try {
        await sgMail.send(msg);
        return new Response('Email sent successfully', { status: 200 });
    } catch (error) {
        console.error('Error sending email:', error);
        return new Response('Error sending email', { status: 500 });
    }
}

async function generateAIContent(prompt) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent([prompt]);
        return new Response(JSON.stringify({ response: result.response.text() }), { status: 200 });
    } catch (error) {
        console.error('Error generating content:', error);
        return new Response('Failed to generate content using Gemini AI', { status: 500 });
    }
}


addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});
