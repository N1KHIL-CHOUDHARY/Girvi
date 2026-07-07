import { Request, Response, NextFunction } from 'express';
import { customerService } from './customer.service';
import { sendResponse } from '../../common/utils/apiResponse';

export class CustomerController {
  async getCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const search = req.query.search as string;

      const result = await customerService.listCustomers({ page, limit, search });

      sendResponse(res, {
        message: 'Customers retrieved successfully',
        data: {
          items: result.customers,
          page: result.currentPage,
          limit,
          total: result.totalCustomers,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  }
  async getCustomerById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const customer = await customerService.getCustomerById(id);

      sendResponse(res, {
        message: 'Customer retrieved successfully',
        data: customer
      });
    } catch (error) {
      next(error);
    }
  }

  async createCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customer = await customerService.createCustomer(req.body);

      sendResponse(res, {
        statusCode: 201,
        message: 'Customer registered successfully',
        data: customer
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const customer = await customerService.updateCustomer(id, req.body);

      sendResponse(res, {
        message: 'Customer updated successfully',
        data: customer
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await customerService.deleteCustomer(id);

      sendResponse(res, {
        message: 'Customer deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await customerService.getCustomerStats(id);

      sendResponse(res, {
        message: 'Customer financial metrics generated successfully',
        data: result.stats,
        meta: { payments: result.payments }
      });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { accountId } = req.params; // Align parameter name with frontend getPawnTicketsByAccountId
      const tickets = await customerService.getCustomerTickets(accountId);

      sendResponse(res, {
        message: 'Customer pawn tickets retrieved successfully',
        data: tickets
      });
    } catch (error) {
      next(error);
    }
  }
}

export const customerController = new CustomerController();
export default customerController;
