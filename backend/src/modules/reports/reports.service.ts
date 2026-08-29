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

    const whereClause: Prisma.PawnTicketWhereInput = {
      shopId,
      deletedAt: null
    };

    if (search) {
      whereClause.AND = [
        {
          OR: [
            { ticketNumber: { contains: search, mode: 'insensitive' } },
            { customer: { fullName: { contains: search, mode: 'insensitive' } } }
          ]
        }
      ];
    }

    const [tickets, totalCount] = await Promise.all([
      prisma.pawnTicket.findMany({
        where: whereClause,
        include: {
          customer: true,
          payments: {
            where: { deletedAt: null }
          }
        },
        orderBy: { pawnedDate: 'desc' },
        skip,
        take: limit
      }),
      prisma.pawnTicket.count({
        where: whereClause
      })
    ]);

    const report = tickets.map((t) => {
      const interestPaid = t.payments
        .filter((p) => ['interest', 'penalty', 'fine', 'processing_fee', 'service_fee'].includes(p.paymentFor))
        .reduce((sum, p) => sum.plus(p.amountPaid), new Prisma.Decimal(0));

      const principalPaid = t.payments
        .filter((p) => p.paymentFor === 'principal')
        .reduce((sum, p) => sum.plus(p.amountPaid), new Prisma.Decimal(0));

      return {
        id: t.id,
        ticket_number: t.ticketNumber,
        status: t.status as 'active' | 'settled' | 'defaulted',
        original_loan_amount: t.originalLoanAmount.toString(),
        loan_amount: t.loanAmount.toString(),
        total_interest_paid: interestPaid.toString(),
        total_principal_paid: principalPaid.toString(),
        customer_name: t.customer?.fullName || 'Walk-in Customer'
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

    const whereClause: Prisma.PawnTicketWhereInput = {
      shopId,
      deletedAt: null
    };

    if (search) {
      whereClause.AND = [
        {
          OR: [
            { ticketNumber: { contains: search, mode: 'insensitive' } },
            { customer: { fullName: { contains: search, mode: 'insensitive' } } }
          ]
        }
      ];
    }

    const tickets = await prisma.pawnTicket.findMany({
      where: whereClause,
      include: {
        customer: true,
        payments: {
          where: { deletedAt: null }
        }
      },
      orderBy: { pawnedDate: 'desc' }
    });

    // Write CSV header
    let csv = 'Ticket Number,Customer Name,Status,Original Loan,Remaining Loan,Interest Repaid,Principal Repaid\n';

    for (const t of tickets) {
      const interestPaid = t.payments
        .filter((p) => ['interest', 'penalty', 'fine', 'processing_fee', 'service_fee'].includes(p.paymentFor))
        .reduce((sum, p) => sum.plus(p.amountPaid), new Prisma.Decimal(0));

      const principalPaid = t.payments
        .filter((p) => p.paymentFor === 'principal')
        .reduce((sum, p) => sum.plus(p.amountPaid), new Prisma.Decimal(0));

      // Clean commas from names
      const name = (t.customer?.fullName || 'Walk-in').replace(/,/g, ' ');

      csv += `${t.ticketNumber},${name},${t.status},${t.originalLoanAmount},${t.loanAmount},${interestPaid},${principalPaid}\n`;
    }

    return csv;
  }

  async exportToExcel(search?: string): Promise<Buffer> {
    const shopId = getTenantShopId();
    if (!shopId) throw new AppError('Tenant context required', 400);

    const whereClause: Prisma.PawnTicketWhereInput = {
      shopId,
      deletedAt: null
    };

    if (search) {
      whereClause.AND = [
        {
          OR: [
            { ticketNumber: { contains: search, mode: 'insensitive' } },
            { customer: { fullName: { contains: search, mode: 'insensitive' } } }
          ]
        }
      ];
    }

    const tickets = await prisma.pawnTicket.findMany({
      where: whereClause,
      include: {
        customer: true,
        payments: {
          where: { deletedAt: null }
        }
      },
      orderBy: { pawnedDate: 'desc' }
    });

    // Format data rows
    const data = tickets.map((t) => {
      const interestPaid = t.payments
        .filter((p) => ['interest', 'penalty', 'fine', 'processing_fee', 'service_fee'].includes(p.paymentFor))
        .reduce((sum, p) => sum.plus(p.amountPaid), new Prisma.Decimal(0));

      const principalPaid = t.payments
        .filter((p) => p.paymentFor === 'principal')
        .reduce((sum, p) => sum.plus(p.amountPaid), new Prisma.Decimal(0));

      return {
        'Ticket Number': t.ticketNumber,
        'Customer Name': t.customer?.fullName || 'Walk-in Customer',
        'Status': t.status,
        'Original Loan (INR)': parseFloat(t.originalLoanAmount.toString()),
        'Remaining Principal (INR)': parseFloat(t.loanAmount.toString()),
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
    return buffer as Buffer;
  }
}

export const reportsService = new ReportsService();
export default reportsService;
