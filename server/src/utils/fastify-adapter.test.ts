import { describe, it, expect, beforeEach } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';

import { fastifyAdapter } from './fastify-adapter';

import type { FastifyRequest, FastifyReply } from 'fastify';

// Mocks for FastifyRequest and FastifyReply
// Using mockDeep to handle nested properties easily
const mockRequest = mockDeep<FastifyRequest>();
const mockReply = mockDeep<FastifyReply>();

// Reset mocks before each test to ensure isolation
beforeEach(() => {
  mockReset(mockRequest);
  mockReset(mockReply);
});

describe('fastifyAdapter', () => {
  describe('toStandardRequest()', () => {
    it('should correctly convert a GET request', () => {
      // Arrange
      const mockRequest = {
        protocol: 'https',
        hostname: 'example.com',
        originalUrl: '/api/test?query=123',
        method: 'GET',
        headers: {
          'x-test-header': 'test-value',
          'user-agent': 'vitest',
        },
        body: undefined,
      } as unknown as FastifyRequest;

      // Act
      const standardRequest = fastifyAdapter.toStandardRequest(mockRequest);

      // Assert
      expect(standardRequest.url).toBe('https://example.com/api/test?query=123');
      expect(standardRequest.method).toBe('GET');
      expect(standardRequest.headers.get('x-test-header')).toBe('test-value');
      expect(standardRequest.headers.get('user-agent')).toBe('vitest');
      expect(standardRequest.body).toBe(null);
    });

    it('should correctly convert a POST request with a JSON body', async () => {
      const mockRequest = {
        protocol: 'http',
        hostname: 'localhost:3000',
        originalUrl: '/api/submit',
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: { message: 'hello world' },
      } as unknown as FastifyRequest;

      const standardRequest = fastifyAdapter.toStandardRequest(mockRequest);
      const body = await standardRequest.json();

      expect(standardRequest.url).toBe('http://localhost:3000/api/submit');
      expect(standardRequest.method).toBe('POST');
      expect(standardRequest.headers.get('content-type')).toBe('application/json');
      expect(body).toEqual({ message: 'hello world' });
    });

    it('should not include a body for a HEAD request', () => {
      const mockRequest = {
        protocol: 'https',
        hostname: 'api.example.com',
        originalUrl: '/status',
        method: 'HEAD',
        headers: {},
        body: { some: 'data' }, // should be ignored
      } as unknown as FastifyRequest;

      const standardRequest = fastifyAdapter.toStandardRequest(mockRequest);

      expect(standardRequest.method).toBe('HEAD');
      expect(standardRequest.body).toBe(null);
    });
  });

  describe('sendStandardResponse()', () => {
    it('should correctly send a standard Response to a FastifyReply', async () => {
      // Arrange: Create a standard Response object
      const responseBody = 'This is the response body.';
      const standardResponse = new Response(responseBody, {
        status: 201,
        headers: {
          'content-type': 'text/plain',
          'x-custom-header': 'custom-value',
        },
      });

      // Act: Use the adapter to send the response
      await fastifyAdapter.sendStandardResponse(mockReply, standardResponse);

      // Assert: Verify that the correct methods were called on the FastifyReply mock
      // Check if status was set
      expect(mockReply.status).toHaveBeenCalledWith(201);
      // Check if headers were set
      expect(mockReply.headers).toHaveBeenCalledWith({
        'content-type': 'text/plain',
        'x-custom-header': 'custom-value',
      });
      // Check if send was called with the correct body
      expect(mockReply.send).toHaveBeenCalledWith(responseBody);
    });

    it('should handle a response with a JSON body', async () => {
      // Arrange
      const jsonBody = { data: 'success' };
      const standardResponse = new Response(JSON.stringify(jsonBody), {
        status: 404,
        headers: { 'content-type': 'application/json' },
      });

      // Act
      await fastifyAdapter.sendStandardResponse(mockReply, standardResponse);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.headers).toHaveBeenCalledWith({ 'content-type': 'application/json' });
      expect(mockReply.send).toHaveBeenCalledWith(JSON.stringify(jsonBody));
    });

    it('should handle a response with no body', async () => {
      // Arrange
      const standardResponse = new Response(null, { status: 204 }); // No Content

      // Act
      await fastifyAdapter.sendStandardResponse(mockReply, standardResponse);

      // Assert
      expect(mockReply.status).toHaveBeenCalledWith(204);
      expect(mockReply.headers).toHaveBeenCalled();
      // The body will be an empty string after response.text() is called on a null body
      expect(mockReply.send).toHaveBeenCalledWith('');
    });
  });
});
