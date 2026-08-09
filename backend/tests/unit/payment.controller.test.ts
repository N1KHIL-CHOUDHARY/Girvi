import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { paymentController } from '../../src/modules/payment/payment.controller';
import { paymentService } from '../../src/modules/payment/payment.service';

vi.mock('../../src/modules/payment/payment.service');

describe('PaymentController Unit Tests', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = {
      headers: {},
      body: {
        ticket_id: 'ticket-1',
        amount_paid: 100,
        payment_for: 'principal'
      },
      params: {}
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };

    mockNext = vi.fn() as unknown as NextFunction;
  });

  it('should return 201 Created when a new payment is processed', async () => {
    vi.mocked(paymentService.createPayment).mockResolvedValue({
      payment: {
        id: 'pay-1',
        shop_id: 'shop-1',
        customer_id: 'cust-1',
        ticket_id: 'ticket-1',
        amount_paid: '100',
        payment_for: 'principal',
        payment_date: '2026-08-09T10:00:00.000Z',
        createdAt: '2026-08-09T10:00:00.000Z'
      },
      remaining_balance: '900',
      ticket_status: 'active',
      isDuplicate: false
    });

    if (mockReq.headers) {
      mockReq.headers['x-idempotency-key'] = 'key-123';
    }

    paymentController.createPayment(
      mockReq as Request,
      mockRes as Response,
      mockNext
    );
    await new Promise(process.nextTick);

    expect(paymentService.createPayment).toHaveBeenCalledWith({
      ticket_id: 'ticket-1',
      amount_paid: 100,
      payment_for: 'principal',
      idempotencyKey: 'key-123'
    });

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Payment received and posted successfully',
        data: expect.objectContaining({ id: 'pay-1' }),
        meta: expect.objectContaining({ isDuplicate: false, remaining_balance: '900' })
      })
    );
  });

  it('should return 200 OK with duplicate message when idempotent retry is detected', async () => {
    vi.mocked(paymentService.createPayment).mockResolvedValue({
      payment: {
        id: 'pay-1',
        shop_id: 'shop-1',
        customer_id: 'cust-1',
        ticket_id: 'ticket-1',
        amount_paid: '100',
        payment_for: 'principal',
        payment_date: '2026-08-09T10:00:00.000Z',
        createdAt: '2026-08-09T10:00:00.000Z'
      },
      remaining_balance: '900',
      ticket_status: 'active',
      isDuplicate: true
    });

    if (mockReq.headers) {
      mockReq.headers['x-idempotency-key'] = 'key-duplicate';
    }

    paymentController.createPayment(
      mockReq as Request,
      mockRes as Response,
      mockNext
    );
    await new Promise(process.nextTick);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Duplicate payment request ignored (Idempotent response)',
        data: expect.objectContaining({ id: 'pay-1' }),
        meta: expect.objectContaining({ isDuplicate: true })
      })
    );
  });
});
