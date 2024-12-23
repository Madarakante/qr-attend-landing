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
        const userId = process.env.EMAILJS_PUBLIC_KEY; // Set this in your Vercel environment variables
        const waitlistTemplateId = process.env.EMAILJS_WAITLIST_TEMPLATE_ID; // Set this in your Vercel environment variables
        const demoTemplateId = process.env.EMAILJS_DEMO_TEMPLATE_ID; // Set this in your Vercel environment variables

        // Check if required environment variables are available
        if (!serviceId || !userId || !waitlistTemplateId || !demoTemplateId) {
            return res.status(500).json({ success: false, message: 'Missing EmailJS credentials or template IDs' });
        }

        // Initialize templateId and templateParams based on the form type
        let templateId = '';
        let templateParams = {};

        // Determine the template and parameters based on form type
        if (formType === 'waitlist') {
            templateId = waitlistTemplateId;
            templateParams = {
                email,
                formType: 'Waitlist',
                message: 'User joined the waiting list.',
            };
        } else if (formType === 'demoRequest') {
            templateId = demoTemplateId;
            templateParams = {
                name,
                email,
                school,
                message,
                formType: 'Demo Request',
            };
        } else {
            return res.status(400).json({ success: false, message: 'Invalid form type' });
        }

        // Send the email using EmailJS API
        try {
            // eslint-disable-next-line no-unused-vars
            const response = await axios.post(
                emailjsApiUrl,
                {
                    service_id: serviceId,
                    template_id: templateId,
                    user_id: userId,
                    template_params: templateParams,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            // Return success response
            return res.status(200).json({ success: true, message: 'Email sent successfully' });
        } catch (error) {
            // Improved error logging
            if (error.response) {
                // Log the response from EmailJS
                console.error('EmailJS Error:', error.response.data);
                return res.status(error.response.status || 500).json({
                    success: false,
                    message: `EmailJS error: ${error.response.data.message || 'Failed to send email'}`,
                });
            } else {
                // Log the error message if no response object is available
                console.error('Error sending email:', error.message);
                return res.status(500).json({ success: false, message: 'Failed to send email' });
            }
        }
    } else {
        // Handle unsupported methods
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }
}
