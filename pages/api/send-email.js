import axios from 'axios';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        // Destructure the incoming form data
        const { email, name, school, message, formType } = req.body;

        // Basic validation for required fields
        if (!email || !formType) {
            return res.status(400).json({ success: false, message: 'Required fields are missing' });
        }

        // Setup EmailJS API URL and credentials
        const emailjsApiUrl = 'https://api.emailjs.com/api/v1.0/email/send';
        const serviceId = process.env.EMAILJS_SERVICE_ID; // Set this in your Vercel environment variables
        const userId = process.env.EMAILJS_USER_ID; // Set this in your Vercel environment variables

        // Initialize templateId and templateParams based on the form type
        let templateId = '';
        let templateParams = {};

        // Form Type - Waitlist or Demo Request
        if (formType === 'waitlist') {
            templateId = process.env.EMAILJS_WAITLIST_TEMPLATE_ID; // Set this in your Vercel environment variables
            templateParams = {
                email: email,
                formType: 'Waitlist',
                message: 'User joined the waiting list.',
            };
        } else if (formType === 'demoRequest') {
            templateId = process.env.EMAILJS_DEMO_TEMPLATE_ID; // Set this in your Vercel environment variables
            templateParams = {
                name: name,
                email: email,
                school: school,
                message: message,
                formType: 'Demo Request',
            };
        } else {
            return res.status(400).json({ success: false, message: 'Invalid form type' });
        }

        // Send the email via EmailJS API
        try {
            const response = await axios.post(emailjsApiUrl, {
                service_id: serviceId,
                template_id: templateId,
                user_id: userId,
                template_params: templateParams,
            });

            // Return success response
            return res.status(200).json({ success: true, message: 'Email sent successfully' });
        } catch (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ success: false, message: 'Failed to send email' });
        }
    } else {
        // Handle unsupported methods
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }
}
