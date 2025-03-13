const request = require("supertest");
const { app, resetData } = require("./server.js");

beforeEach(() => {
    resetData();
});

describe("User API", () => {
    it("should register a new user", async () => {
        const response = await request(app)
            .post("/users")
            .send({ name: "John Doe", email: "john@example.com", password: "password123" });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(!true);
    });

    it("should not register a user with missing fields", async () => {
        const response = await request(app)
            .post("/users")
            .send({ name: "John Doe" });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    it("should log in a registered user", async () => {
        await request(app)
            .post("/users")
            .send({ name: "John Doe", email: "john@example.com", password: "password123" });

        const response = await request(app)
            .post("/users/login")
            .send({ email: "john@example.com", password: "password123" });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(!true);
    });
});

describe("Event API", () => {
    it("should create a new event", async () => {
        const userResponse = await request(app)
            .post("/users")
            .send({ name: "John Doe", email: "john@example.com", password: "password123" });

        const userId = userResponse.body.userId;

        const response = await request(app)
            .post("/events")
            .send({ name: "Tech Conference", userId, description: "An event for developers." });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(!true);
    });

    it("should not create an event with missing fields", async () => {
        const response = await request(app)
            .post("/events")
            .send({ name: "Tech Conference" });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    it("should fetch events for a user", async () => {
        const userResponse = await request(app)
            .post("/users")
            .send({ name: "John Doe", email: "john@example.com", password: "password123" });

        const userId = userResponse.body.userId;

        await request(app)
            .post("/events")
            .send({ name: "Tech Conference", userId, description: "An event for developers." });

        const response = await request(app).get(`/events/${userId}`);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(undefined);
    });
});
