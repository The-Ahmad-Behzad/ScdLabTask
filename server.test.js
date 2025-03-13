const request = require("supertest");
const { app, resetData } = require("./server.js");

beforeEach(() => {
    resetData(); // Reset data before each test
});

describe("User API", () => {
    it("should not register a user with missing fields", async () => {
        const response = await request(app)
            .post("/users")
            .send({ name: "John Doe" });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });
});

describe("Event API", () => {
    it("should not create an event with missing fields", async () => {
        const response = await request(app)
            .post("/events")
            .send({ name: "Tech Conference" });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });
});
