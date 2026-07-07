import { prisma } from '../../config/database';
import { getTenantShopId } from '../../common/context/tenant.context';
import { AppError } from '../../common/errors/AppError';
import { Prisma } from '@prisma/client';
import xlsx from 'xlsx';

export class ReportsService {
  async getFinancialReport(params: { page: number; limit: number; search?: string }) {
    const shopId = getTenantShopId();
    if (!shopId) throw new AppError('Tenant context required', 400);

    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.PawnTicketWhereInput = { shopId };

    if (search) {
      whereClause.OR = [
        { ticket_number: { contains: search, mode: 'insensitive' } },
        { customer: { full_name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [tickets, totalCount] = await Promise.all([
      prisma.pawnTicket.findMany({
        where: whereClause,
        include: {
          customer: true,
          payments: true
        },
        orderBy: { pawned_date: 'desc' },
        skip,
        take: limit
      }),
      prisma.pawnTicket.count({
        where: whereClause
      })
    ]);

    const report = tickets.map((t) => {
      const interestPaid = t.payments
        .filter((p) => ['interest', 'penalty', 'fine', 'processing_fee', 'service_fee'].includes(p.payment_for))
        .reduce((sum, p) => sum.plus(p.amount_paid), new Prisma.Decimal(0));

      const principalPaid = t.payments
        .filter((p) => p.payment_for === 'principal')
        .reduce((sum, p) => sum.plus(p.amount_paid), new Prisma.Decimal(0));

      return {
        id: t.id,
        ticket_number: t.ticket_number,
        status: t.status as 'active' | 'settled' | 'defaulted',
        original_loan_amount: t.original_loan_amount.toString(),
        loan_amount: t.loan_amount.toString(),
        total_interest_paid: interestPaid.toString(),
        total_principal_paid: principalPaid.toString(),
        customer_name: t.customer?.full_name || 'Walk-in Customer'
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      report,
      totalItems: totalCount,
      totalPages,
      page,
      limit
    };
  }

  async exportToCsv(search?: string): Promise<string> {
    const shopId = getTenantShopId();
    if (!shopId) throw new AppError('Tenant context required', 400);

    const whereClause: Prisma.PawnTicketWhereInput = { shopId };

    if (search) {
      whereClause.OR = [
        { ticket_number: { contains: search, mode: 'insensitive' } },
        { customer: { full_name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const tickets = await prisma.pawnTicket.findMany({
      where: whereClause,
      include: {
        customer: true,
        payments: true
      },
      orderBy: { pawned_date: 'desc' }
    });

    // Write CSV header
    let csv = 'Ticket Number,Customer Name,Status,Original Loan,Remaining Loan,Interest Repaid,Principal Repaid\n';

    for (const t of tickets) {
      const interestPaid = t.payments
        .filter((p) => ['interest', 'penalty', 'fine', 'processing_fee', 'service_fee'].includes(p.payment_for))
        .reduce((sum, p) => sum.plus(p.amount_paid), new Prisma.Decimal(0));

      const principalPaid = t.payments
        .filter((p) => p.payment_for === 'principal')
        .reduce((sum, p) => sum.plus(p.amount_paid), new Prisma.Decimal(0));

      // Clean commas from names
      const name = (t.customer?.full_name || 'Walk-in').replace(/,/g, ' ');

      csv += `${t.ticket_number},${name},${t.status},${t.original_loan_amount},${t.loan_amount},${interestPaid},${principalPaid}\n`;
    }

    return csv;
  }

  async exportToExcel(search?: string): Promise<Buffer> {
    const shopId = getTenantShopId();
    if (!shopId) throw new AppError('Tenant context required', 400);

    const whereClause: Prisma.PawnTicketWhereInput = { shopId };

    if (search) {
      whereClause.OR = [
        { ticket_number: { contains: search, mode: 'insensitive' } },
        { customer: { full_name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const tickets = await prisma.pawnTicket.findMany({
      where: whereClause,
      include: {
        customer: true,
        payments: true
      },
      orderBy: { pawned_date: 'desc' }
    });

    // Format data rows
    const data = tickets.map((t) => {
      const interestPaid = t.payments
        .filter((p) => ['interest', 'penalty', 'fine', 'processing_fee', 'service_fee'].includes(p.payment_for))
        .reduce((sum, p) => sum.plus(p.amount_paid), new Prisma.Decimal(0));

      const principalPaid = t.payments
        .filter((p) => p.payment_for === 'principal')
        .reduce((sum, p) => sum.plus(p.amount_paid), new Prisma.Decimal(0));

      return {
        'Ticket Number': t.ticket_number,
        'Customer Name': t.customer?.full_name || 'Walk-in Customer',
        'Status': t.status,
        'Original Loan (INR)': parseFloat(t.original_loan_amount.toString()),
        'Remaining Principal (INR)': parseFloat(t.loan_amount.toString()),
        'Total Interest Paid (INR)': parseFloat(interestPaid.toString()),
        'Total Principal Repaid (INR)': parseFloat(principalPaid.toString())
      };
    });

    // Create Excel Workbook
    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Financial Report');
    
    // Output file buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }
}

export const reportsService = new ReportsService();
export default reportsService;
