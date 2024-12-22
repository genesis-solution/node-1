const Report = require("../../app/model/Report");
const User = require("../../app/model/User");
const app = require("../../app");
const request = require("supertest");
const { connect } = require("../../app/config/database");
const { Grant } = require("../../app/model/Grant");

describe("Routes: Report", () => {
    let connection;
    beforeAll(async () => {
        connection = await connect('test-report-routes');
        await Grant.create([
            new Grant({ resource: "report", action: "create", possession: "own", attributes: ["*", '!reportedBy', '!status', '!rejectedReason'], role: "user" }),
            new Grant({ resource: "report", action: "read", possession: "own", attributes: ["*"], role: "user" }),

            new Grant({ resource: "report", action: "read", possession: "any", attributes: ["*"], role: "admin" }),
            new Grant({ resource: "report", action: "update", possession: "own", attributes: ["*"], role: "admin" }),
            new Grant({ resource: "report", action: "create", possession: "any", attributes: ["*"], role: "admin" }),
            new Grant({ resource: "report", action: "delete", possession: "own", attributes: ["*"], role: "admin" }),
        ]);
    });
    afterAll(async () => {
        await connection.disconnect();
    });

    let screenshot = "test/fixtures/image.jpg";
    const user = new User({ disabled: false, verified: true, role: "user" });
    const reportedBy = new User({ disabled: false, verified: true, role: "user" });
    const admin = new User({ disabled: false, verified: true, role: "admin" });

    beforeEach(async () => {
        jest.restoreAllMocks();
        await Report.deleteMany({});
    });

    async function mockUserFindById(id) {
        if (!id) return null;
        id = id.toString();
        switch (id) {
            case user._id.toString():
                return user;
            case reportedBy._id.toString():
                return reportedBy;
            case admin._id.toString():
                return admin;
            default:
                return null;
        }
        return null;
    }

    describe("POST /api/report", () => {

        it("should not return 404", async () => {
            const response = await request(app).post("/api/report");
            expect(response.status).not.toBe(404);
        });

        it("should return 401 if user is not authenticated", async () => {
            const response = await request(app).post("/api/report");
            expect(response.status).toBe(401);
        });


        it("should create a report", async () => {
            const findUserById = jest.spyOn(User, "findById").mockImplementation(mockUserFindById);
            const createReport = jest.spyOn(Report, "create");
            const response = await request(app)
                .post("/api/report")
                .set("Authorization", `Bearer ${reportedBy.generateToken()}`)
                .field("reason", "fake account")
                .field("description", "This account is fake")
                .field("entity[entity]", user._id.toString())
                .field("entity[type]", "User")
                .attach("screenshots[]", screenshot)
                ;
            console.log(response.body);
            expect(response.status).toBe(201);
            expect(createReport).toHaveBeenCalledWith({
                reason: "fake account",
                description: "This account is fake",
                entity: { entity: user._id.toString(), type: "User" },
                reportedBy: reportedBy._id,
                screenshots: [expect.any(String)],
            });
            const createdReport = await Report.findOne();
            expect(createdReport).toMatchObject({
                reason: "fake account",
                description: "This account is fake",
                entity: { entity: user._id, type: "User" },
                reportedBy: reportedBy._id,
                screenshots: [expect.any(String)],
            });
        });

        it("should return 404 if user is not found", async () => {
            const findUserById = jest.spyOn(User, "findById")
                .mockImplementation(mockUserFindById);
            const createReport = jest.spyOn(Report, "create");
            const response = await request(app)
                .post("/api/report")
                .field("reason", "fake account")
                .field("description", "This account is fake")
                .field("entity[entity]", new User()._id.toString())
                .field("entity[type]", "User")
                .field("reportedBy", new User()._id.toString())
                .attach("screenshots[]", screenshot)
                .set("Authorization", `Bearer ${admin.generateToken()}`)
                .expect(404);

            expect(createReport).not.toHaveBeenCalled();
        });

        it("should ignore filtered field from req.body", async () => {
            const findUserById = jest.spyOn(User, "findById").mockImplementation(mockUserFindById);
            const createReport = jest.spyOn(Report, "create");
            const filter = jest.spyOn(require("accesscontrol/lib/core/Permission").Permission.prototype, "filter");
            jest.spyOn(Grant, "find").mockResolvedValue([new Grant({ resource: "report", action: "create", possession: "own", attributes: ["*", "!reportedBy", "!status", "!rejectedReason"], role: "user" })]);
            const response = await request(app)
                .post("/api/report")
                .field("reason", "fake account")
                .field("description", "This account is fake")
                .field("entity[entity]", user._id.toString())
                .field("entity[type]", "User")
                .field("status", "approved")
                .field("reportedBy", new User()._id.toString())
                .attach("screenshots[]", screenshot)
                .set("Authorization", `Bearer ${reportedBy.generateToken()}`);

            expect(response.status).toBe(201);
            expect(filter).toHaveBeenCalledWith({
                reason: "fake account",
                description: "This account is fake",
                entity: { entity: user._id.toString(), type: "User" },
                screenshots: [expect.any(String)],
                reportedBy: expect.any(String),
                status: "approved",
            });
            expect(createReport).toHaveBeenCalledWith({
                reason: "fake account",
                description: "This account is fake",
                entity: { entity: user._id.toString(), type: "User" },
                reportedBy: reportedBy._id,
                screenshots: [expect.any(String)],
            });

        });

        it("should validate the request on save", async () => {
            const findUserById = jest.spyOn(User, "findById").mockImplementation(mockUserFindById);
            const createReport = jest.spyOn(Report, "create");
            const response = await request(app)
                .post("/api/report")
                .field("description", "This account is fake")
                .attach("screenshots[]", screenshot)
                .set("Authorization", `Bearer ${reportedBy.generateToken()}`)
                .expect(400);

            expect(createReport).toHaveBeenCalled();
        });

        it("should return 500 if an error occurs", async () => {
            const findUserById = jest.spyOn(User, "findById").mockImplementation(mockUserFindById);
            const createReport = jest.spyOn(Report, "create").mockRejectedValue(new Error("fake error"));
            const response = await request(app)
                .post("/api/report")
                .field("reason", "fake account")
                .field("description", "This account is fake")
                .attach("screenshots[]", screenshot)
                .set("Authorization", `Bearer ${reportedBy.generateToken()}`);

            expect(response.status).toBe(500);
            expect(createReport).toHaveBeenCalled();
        });
    });

});




