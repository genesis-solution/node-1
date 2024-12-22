// @ts-check
const mongoose = require('mongoose');

const handleNegative = (value) => value < 0 ? value * -1 : value;
const DOCUMENTS_PER_PAGE = 10;


/**
 * @type {{skip: number, limit: number}}
 */
let typeOptions;

/**
 * @type {{total: number, page: number | null, pages: number, nextPage: number | null, prevPage: number | null}}
 */
let typeData;

/** 
 * 
 * @type {(options: typeOptions, data: typeData) => any}
 */
let handler;

/**
 * Handles pagination
 * @param {object} params
 * @param {number | Promise<number>} params.total
 * @param {number | string=} params.page
 * @param {number | undefined | null} params.start
 * @param {number | undefined | null} params.size
 * @param {handler} params.handler
 * @returns 
 */
async function paginate({ total, page, start, size, handler }) {
    const total1 = typeof total === 'number' ? total : await total;
    size = size ?? DOCUMENTS_PER_PAGE;
    const pages = Math.ceil(total1 / size);
    const options = { limit: size, skip: start ?? 0 };

    const data = { total: total1, page: null, pages, nextPage: null, prevPage: null };
    if (page !== null && page !== undefined) {
        // @ts-ignore
        const _page = parseInt(page) || 1;
        const pageNumber = handleNegative(_page);
        const skip = start ?? ((pageNumber - 1) * size);
        data.page = pageNumber;
        data.nextPage = pages > 1 ? Math.min(pageNumber + 1, pages) : null;
        data.prevPage = pages > 1 ? Math.max(pageNumber - 1, 1) : null;
        options.skip = skip;
    }
    return await handler(options, data);
}
/**
 * Paginates data using Material React Table.
 *
 * @param {Object} options - The pagination options.
 * @param {import("express").Request} options.req - The response object.
 * @param {(query: object) => Promise<number>} options.total - The total number of items.
 * @param {(options: typeOptions, data: typeData, extra: {sorting: object, query: object}) => any} options.handler - The handler function for processing the data.
 * @param {(query: object) => any} options.filter - The filter function for processing the data.
 * @param {boolean=} options.parseMongoID - Whether to parse the MongoDB ID.
 * @returns {Promise<void>} - A promise that resolves when the pagination is complete.
 */
async function paginateWithMaterialReactTable({ req, total, handler, filter, parseMongoID = false }) {
    const query = req.query;
    const size = +query.size || undefined;
    const start = +query.start || undefined;
    const page = +query.page || undefined;
    // @ts-ignore
    const sorting = Object.fromEntries(query.sorting?.map(e => [e.id, e.desc == 'true' ? -1 : 1]) ?? []);
    // @ts-ignore
    const filters = Object.fromEntries(query.filters?.map(e => {
        const value = parseMongoID && mongoose.Types.ObjectId.isValid(e.value)
            ? new mongoose.Types.ObjectId(e.value)
            : e.value;
        return [e.id, value];
    }) ?? []);//;


    delete query.size;
    delete query.start;
    delete query.page;
    delete query.sorting;
    delete query.filters;


    const _query = filter({
        ...Object.fromEntries(Object.entries(query).map(([key, value]) => {
            const _value = parseMongoID && typeof value === 'string' && mongoose.Types.ObjectId.isValid(value)
                ? new mongoose.Types.ObjectId(value)
                : value;
            return [key, _value];
        })),
        ...filters
    });

    await paginate({
        total: await total(_query),
        start,
        size,
        ...page ? { page } : {},
        handler: function (options, data) {
            return handler(options, data, { sorting, query: _query });
        }
    });
}


module.exports = {
    DOCUMENTS_PER_PAGE,
    paginate,
    paginateWithMaterialReactTable
};