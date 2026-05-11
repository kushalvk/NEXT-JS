import { generateToken } from '@/utils/token';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
}));

describe('generateToken', () => {
    it('should generate a token using jwt.sign', () => {
        const mockPayload = { user: { id: '123' } };
        const mockToken = 'fake.jwt.token';
        (jwt.sign as jest.Mock).mockReturnValue(mockToken);

        const result = generateToken(mockPayload, '2h');

        expect(jwt.sign).toHaveBeenCalledWith(
            mockPayload,
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );
        expect(result).toBe(mockToken);
    });
});
