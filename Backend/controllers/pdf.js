const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const PawnTicket = require('../models/pawnTicket');
const Customer = require('../models/customer');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

exports.generateNotice = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const shopId = req.query.shop_id;

  const query = { _id: ticketId };
  if (shopId) {
    query.shop_id = shopId;
  }
  const ticket = await PawnTicket.findOne(query).populate('customer_id');
  if (!ticket) {
    throw new ApiError(404, 'Ticket not found.');
  }

  const customer = ticket.customer_id || (await Customer.findById(ticket.customer_id));

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
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
  res.setHeader('X-Response-Message', 'Notice generated successfully.');

  return res.send(Buffer.from(pdfBytes));
});
