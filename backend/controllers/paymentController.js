const stripe = require('../utils/stripe');
const User = require('../models/User');

exports.createCheckoutSession = async (req, res) => {
    const { priceId } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            success_url: 'http://localhost:3000/dashboard?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://localhost:3000',
        });

        res.json({ sessionId: session.id})
    } catch (error) {
        res.status(500).json({ message: error.message})
    }
};

exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawbody, sig, 'web hook secret');

        if(event.type === 'checkout.session.completed'){
            const session = event.data.object;
            const user = await User.findById(session.client_reference_id);
            user.subscribed = true;
            await user.save()
        }

        res.json({ received: true })
    } catch (error) {
        res.status(400).json({ message: `Webhook error: ${error.message}`})
    }
}