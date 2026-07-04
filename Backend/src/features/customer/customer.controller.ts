import type { Request, Response } from 'express';
import { ApiError } from '../../lib/errors';
import { asyncHandler, sendSuccess } from '../../lib/http';
import type { CustomerBody, CustomerDetail, CustomerListResponse, CustomerQuery } from './customer.types';
import { createCustomer, deleteCustomer, getCustomerById, listCustomers, updateCustomer } from './customer.service';

export const createCustomerController = asyncHandler<unknown, CustomerDetail, CustomerBody>(async (req, res: Response<CustomerDetail>) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }

  const customer = await createCustomer(req.user, req.body);
  sendSuccess(res, {
    status: 201,
    message: 'Customer created successfully.',
    data: customer,
  });
});

export const listCustomersController = asyncHandler<unknown, CustomerListResponse, unknown, CustomerQuery>(async (req, res: Response<CustomerListResponse>) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }

  const result = await listCustomers(req.user, req.query as CustomerQuery);
  sendSuccess(res, {
    message: 'Customers fetched successfully.',
    data: result,
    meta: {
      page: result.currentPage,
      totalPages: result.totalPages,
      totalItems: result.totalCustomers,
    },
  });
});

export const getCustomerByIdController = asyncHandler<{ id: string }>(async (req: Request<{ id: string }>, res) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }

  const customer = await getCustomerById(req.user, req.params.id);
  sendSuccess(res, {
    message: 'Customer fetched successfully.',
    data: customer,
  });
});

export const updateCustomerController = asyncHandler<{ id: string }, CustomerDetail, Partial<CustomerBody>>(async (req: Request<{ id: string }>, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }

  const customer = await updateCustomer(req.user, req.params.id, req.body);
  sendSuccess(res, {
    message: 'Customer updated successfully.',
    data: customer,
  });
});

export const deleteCustomerController = asyncHandler<{ id: string }>(async (req: Request<{ id: string }>, res) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized. Token missing.');
  }

  const result = await deleteCustomer(req.user, req.params.id);
  sendSuccess(res, {
    message: 'Customer deleted successfully.',
    data: result,
  });
});
