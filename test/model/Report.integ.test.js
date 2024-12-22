const { connect } = require("../../app/config/database");
const Report = require("../../app/model/Report");
const mongoose = require("mongoose");
const User = require("../../app/model/User");

// Model for storing user reports (fake account,  etc.)
describe("Report Model Integration Test", () => {
    let connection;
    beforeAll(async () => {
        connection = await connect('test-report-integ');
    });
    afterAll(async () => {
        await connection.disconnect();
    });

    it("should create a report", async () => {
        const user = await User.create({
            name: "test",
            email: "test" + Date.now() + "@test.com",
            password: "test",
            role: "user",
            verified: true,
            disabled: false,
        });
        const report = await Report.create({
            reason: "fake account",
            description: "This account is fake",
            entity: {
                type: "User",
                entity: user._id,
            },
            reportedBy: new mongoose.Types.ObjectId(),
            status: undefined,
            rejectedReason: null,
            screenshots: [],
        });

        const fountReport = await Report.findById(report._id).populate("entity.entity");
        expect(fountReport).not.toBeNull();

        expect(fountReport.reason).toBe("fake account");
        expect(fountReport.description).toBe("This account is fake");

        expect(fountReport.entity).toBeDefined();
        expect(fountReport.entity.type).toBe("User");
        expect(fountReport.entity.entity._id).toStrictEqual(user._id);

        expect(fountReport.reportedBy).toStrictEqual(report.reportedBy);

        expect(fountReport.status).toBe("pending");
        expect(fountReport.rejectedReason).toBeNull();
        expect(fountReport.screenshots).toEqual([]);

        expect(fountReport.createdAt).toBeDefined();
        expect(fountReport.updatedAt).toBeDefined();
        expect(fountReport.id).toEqual(expect.any(Number));


    });
});