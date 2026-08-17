import { Customer, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';

export class CustomerRepository {
  async findAndCount(params: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ customers: Customer[]; totalCount: number }> {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.CustomerWhereInput = {};

    if (search) {
      whereClause.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search } },
        { customerCode: { contains: search, mode: 'insensitive' } },
        { aadhaarNumberLast4: { contains: search } },
        { panNumberLast4: { contains: search } }
      ];
    }

    const [customers, totalCount] = await Promise.all([
      prisma.customer.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.customer.count({
        where: whereClause
      })
    ]);

    return { customers, totalCount };
  }

  async findById(id: string): Promise<Customer | null> {
    return prisma.customer.findUnique({
      where: { id }
    });
  }

  async create(data: Prisma.CustomerCreateInput): Promise<Customer> {
    return prisma.customer.create({
      data
    });
  }

  async update(id: string, data: Prisma.CustomerUpdateInput): Promise<Customer> {
    return prisma.customer.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<Customer> {
    return prisma.customer.delete({
      where: { id }
    });
  }

  async findTicketsByCustomerId(customerId: string) {
    return prisma.pawnTicket.findMany({
      where: { customerId },
      include: {
        items: true
      },
      orderBy: { pawnedDate: 'desc' }
    });
  }

  async getCustomerStats(customerId: string) {
    const [ticketAgg, activeTicketAgg, paymentGroups] = await Promise.all([
      prisma.pawnTicket.aggregate({
        where: { customerId },
        _sum: { originalLoanAmount: true },
        _count: { id: true }
      }),
      prisma.pawnTicket.aggregate({
        where: { customerId, status: 'active' },
        _sum: { loanAmount: true },
        _count: { id: true }
      }),
      prisma.payment.groupBy({
        by: ['paymentFor'],
        where: { customerId },
        _sum: { amountPaid: true }
      })
    ]);

    const totalLoanValue = ticketAgg._sum.originalLoanAmount ?? new Prisma.Decimal(0);
    const totalActiveLoan = activeTicketAgg._sum.loanAmount ?? new Prisma.Decimal(0);
    const totalTickets = ticketAgg._count.id ?? 0;
    const activeTickets = activeTicketAgg._count.id ?? 0;

    let totalInterestPaid = new Prisma.Decimal(0);
    let totalPrincipalPaid = new Prisma.Decimal(0);

    for (const group of paymentGroups) {
      const pf = (group.paymentFor || '').toLowerCase();
      const sum = group._sum.amountPaid ?? new Prisma.Decimal(0);
      if (pf === 'interest' || pf === 'penalty' || pf === 'fine') {
        totalInterestPaid = totalInterestPaid.plus(sum);
      } else if (pf === 'principal') {
        totalPrincipalPaid = totalPrincipalPaid.plus(sum);
      }
    }

    return {
      stats: {
        total_loan_value: totalLoanValue.toFixed(2),
        total_active_loan: totalActiveLoan.toFixed(2),
        total_tickets: totalTickets,
        active_tickets: activeTickets
      },
      payments: [
        { payment_for: 'interest' as const, total_paid: totalInterestPaid.toFixed(2) },
        { payment_for: 'principal' as const, total_paid: totalPrincipalPaid.toFixed(2) }
      ]
    };
  }
}

export const customerRepository = new CustomerRepository();
export default customerRepository;
