const { paginate, DOCUMENTS_PER_PAGE } = require('../../app/utils/paginations');
describe('Utils: paginate', () => {
    it('should handle pagination', async () => {
        const total = 100;
        const page = 2;
        const handler = jest.fn();
        await paginate({ total, page, handler });
        expect(handler).toBeCalledWith({ skip: 10, limit: 10 }, {
            total,
            page,
            pages: Math.ceil(total / DOCUMENTS_PER_PAGE),
            nextPage: 3,
            prevPage: 1
        });
    });

    it('should handle pagination with start and size', async () => {
        const total = 100;
        const start = 10;
        const size = 10;
        const handler = jest.fn();
        await paginate({ total, start, size, handler });
        expect(handler).toBeCalledWith({ skip: start, limit: size }, {
            total,
            page: null,
            pages: Math.ceil(total / size),
            nextPage: null,
            prevPage: null
        });
    });

    it('should handle negative page', () => {
        const total = 100;
        const page = -2;
        const handler = jest.fn();
        paginate({ total, page, handler });
        expect(handler).toHaveBeenCalledWith({ skip: 10, limit: 10 }, {
            total,
            page: 2,
            pages: Math.ceil(total / DOCUMENTS_PER_PAGE),
            nextPage: 3,
            prevPage: 1
        });
    });
});