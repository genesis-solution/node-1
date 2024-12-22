const { connect } = require('../../app/config/database');
const Banner = require('../../app/model/Banner');


describe('Banner Model', () => {
    let connection;
    beforeAll(async () => {
        connection = await connect('banner-db');
    });
    afterEach(async () => {
        await Banner.deleteMany();
    });
    afterAll(async () => {
        await connection.disconnect();
    });

    it('should create banner', async () => {
        const banner = {
            image: "image.jpg"
        };

        const newBanner = await Banner.create(banner);
        expect(newBanner.image).toBe(banner.image);

    });

    it('should not create banner without image', async () => {
        const banner = {
            image: ""
        };
        expect(Banner.create(banner)).rejects.toThrow();

    });

});