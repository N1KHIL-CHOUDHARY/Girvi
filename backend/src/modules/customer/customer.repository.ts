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
        { full_name: { contains: search, mode: 'insensitive' } },
        { phone_number: { contains: search } },
        { customerCode: { contains: search, mode: 'insensitive' } },
        { aadhaar_number_last4: { contains: search } },
        { pan_number_last4: { contains: search } }
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
    return prisma.customer.findFirst({
      where: { id }
    });
  }

  async create(data: any): Promise<Customer> {
    return prisma.customer.create({
      data
    });
  }

  async update(id: string, data: any): Promise<Customer> {
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
      orderBy: { pawned_date: 'desc' }
    });
  }

  async getCustomerStats(customerId: string) {
    const tickets = await prisma.pawnTicket.findMany({
      where: { customerId }
    });

    const payments = await prisma.payment.findMany({
      where: { customerId }
    });

    const activeTickets = tickets.filter((t) => t.status === 'active');

    // Aggregate stats using Prisma.Decimal to avoid precision loss
    const totalLoanValue = tickets.reduce((acc, t) => acc.plus(t.original_loan_amount), new Prisma.Decimal(0));
    const totalActiveLoan = activeTickets.reduce((acc, t) => acc.plus(t.loan_amount), new Prisma.Decimal(0));

    const totalInterestPaid = payments
      .filter((p) => p.payment_for === 'interest' || p.payment_for === 'penalty' || p.payment_for === 'fine')
      .reduce((acc, p) => acc.plus(p.amount_paid), new Prisma.Decimal(0));

    const totalPrincipalPaid = payments
      .filter((p) => p.payment_for === 'principal')
      .reduce((acc, p) => acc.plus(p.amount_paid), new Prisma.Decimal(0));

    return {
      stats: {
        total_loan_value: totalLoanValue.toFixed(2),
        total_active_loan: totalActiveLoan.toFixed(2),
        total_tickets: tickets.length,
        active_tickets: activeTickets.length
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
