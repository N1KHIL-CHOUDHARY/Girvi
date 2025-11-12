const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const PawnTicket = require('../models/pawnTicket');
const Customer = require('../models/customer');

exports.generateNotice = async (req, res) => {
	try {
		const { ticketId } = req.params;
		const { shopId } = req.user;

		const ticket = await PawnTicket.findOne({ _id: ticketId, shop_id: shopId }).populate('customer_id');
		if (!ticket) {
			return res.status(404).json({ message: 'Ticket not found' });
		}

		const customer = ticket.customer_id || (await Customer.findById(ticket.customer_id));

		const pdfDoc = await PDFDocument.create();
		const page = pdfDoc.addPage([595.28, 841.89]); // A4
		const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

		const drawText = (text, x, y, size = 12) => {
			page.drawText(text, { x, y, size, font, color: rgb(0, 0, 0) });
		};

		let y = 800;
		drawText('One-Year Notice', 220, y, 18);
		y -= 40;
		drawText(`Ticket #: ${ticket.ticket_number}`, 60, y);
		y -= 20;
		drawText(`Status: ${ticket.status}`, 60, y);
		y -= 20;
		drawText(`Customer: ${customer?.full_name || ''}`, 60, y);
		y -= 20;
		drawText(`Phone: ${customer?.phone_number || ''}`, 60, y);
		y -= 20;
		drawText(`Loan Amount: ₹${ticket.loan_amount?.toLocaleString('en-IN')}`, 60, y);
		y -= 20;
		drawText(`Pawned Date: ${new Date(ticket.pawned_date).toLocaleDateString()}`, 60, y);
		y -= 40;
		drawText('This is an automated notice regarding the pledged item(s).', 60, y);

		const pdfBytes = await pdfDoc.save();
		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader('Content-Disposition', `inline; filename="notice-${ticket.ticket_number}.pdf"`);
		return res.send(Buffer.from(pdfBytes));
	} catch (err) {
		console.error('PDF ERROR:', err);
		return res.status(500).json({ message: 'Failed to generate PDF' });
	}
};


