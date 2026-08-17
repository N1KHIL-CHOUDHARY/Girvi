import { Request, Response } from 'express';
import { customerService } from './customer.service';
import { sendSuccess } from '../../common/utils/apiResponse';
import { asyncHandler } from '../../common/utils/asyncHandler';

export class CustomerController {
  getCustomers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search = req.query.search as string;

    const result = await customerService.listCustomers({ page, limit, search });

    sendSuccess(
      res,
      result.customers,
      'Customers retrieved successfully',
      200,
      {
        page: result.currentPage,
        limit,
        total: result.totalCustomers,
        totalPages: result.totalPages
      }
    );
  });

  getCustomerById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const customer = await customerService.getCustomerById(id);
    sendSuccess(res, customer, 'Customer retrieved successfully');
  });

  createCustomer = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const customer = await customerService.createCustomer(req.body);
    sendSuccess(res, customer, 'Customer registered successfully', 201);
  });

  updateCustomer = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const customer = await customerService.updateCustomer(id, req.body);
    sendSuccess(res, customer, 'Customer updated successfully');
  });

  deleteCustomer = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await customerService.deleteCustomer(id);
    sendSuccess(res, undefined, 'Customer deleted successfully');
  });

  getCustomerStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await customerService.getCustomerStats(id);
    sendSuccess(res, result.stats, 'Customer financial metrics generated successfully', 200, { payments: result.payments });
  });

  getCustomerTickets = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id || req.params.accountId;
    const tickets = await customerService.getCustomerTickets(id);
    sendSuccess(res, tickets, 'Customer pawn tickets retrieved successfully');
  });
}

export const customerController = new CustomerController();
export default customerController;
