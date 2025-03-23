import request from "supertest";
import express from "express";
import router from "../routes/taskRoutes.js";
import { TaskService } from "../services/taskService.js";

// mock the testService
jest.mock("../services/taskService.js", () => {
  const mockTaskServiceInstance = {
    getTasks: jest.fn(),
    addTask: jest.fn(),
    removeTask: jest.fn(),
  };

  return {
    TaskService: jest.fn().mockImplementation(() => mockTaskServiceInstance),
  };
});

describe("Task Routes", () => {
  let app;
  let mockTaskService;

  beforeAll(() => {
    // create express app and use the router
    app = express();
    app.use(express.json());
    app.use("/", router);

    // add error handler
    app.use((err, req, res, next) => {
      res.status(500).json({ error: err.message });
    });

    // create the instance of taskService class
    mockTaskService = new TaskService();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /tasks", () => {
    test("should return all tasks", async () => {
      // arrange
      const mockTasks = [
        { id: 1, title: "Task 1", completed: false },
        { id: 2, title: "Task 2", completed: true },
      ];
      mockTaskService.getTasks.mockResolvedValue(mockTasks);

      // act
      const response = await request(app).get("/tasks");

      // assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTasks);
      expect(mockTaskService.getTasks).toHaveBeenCalledTimes(1);
    });

    test("should return 500 when service throws an error", async () => {
      // arrange
      mockTaskService.getTasks.mockRejectedValue(new Error("Database error"));

      // act
      const response = await request(app).get("/tasks");

      // assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error", "Database error");
      expect(mockTaskService.getTasks).toHaveBeenCalledTimes(1);
    });
  });

  describe("POST /tasks", () => {
    test("should create a new task with valid title", async () => {
      // arrange
      const newTask = { id: 1, title: "New Task", completed: false };
      mockTaskService.addTask.mockResolvedValue(newTask);

      // act
      const response = await request(app)
        .post("/tasks")
        .send({ title: "New Task" });

      // assert
      expect(response.status).toBe(201);
      expect(response.body).toEqual(newTask);
      expect(mockTaskService.addTask).toHaveBeenCalledWith("New Task");
    });

    test("should return 400 when title is missing", async () => {
      // act
      const response = await request(app).post("/tasks").send({});

      // assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Title is required");
      expect(mockTaskService.addTask).not.toHaveBeenCalled();
    });

    test("should return 400 when title is empty", async () => {
      // act
      const response = await request(app).post("/tasks").send({ title: "   " });

      // assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Title is empty");
      expect(mockTaskService.addTask).not.toHaveBeenCalled();
    });

    test("should return 500 when service throws an error", async () => {
      // arrange
      mockTaskService.addTask.mockRejectedValue(new Error("Database error"));

      // act
      const response = await request(app)
        .post("/tasks")
        .send({ title: "New Task" });

      // assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error", "Database error");
      expect(mockTaskService.addTask).toHaveBeenCalledWith("New Task");
    });
  });

  describe("DELETE /tasks/:id", () => {
    test("should delete a task with valid id", async () => {
      // arrange
      mockTaskService.removeTask.mockResolvedValue();

      // act
      const response = await request(app).delete("/tasks/1");

      // assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Task deleted successfully" });
      expect(mockTaskService.removeTask).toHaveBeenCalledWith(1);
    });

    test("should return 400 when id is not a number", async () => {
      // act
      const response = await request(app).delete("/tasks/abc");

      // assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Valid ID is required");
      expect(mockTaskService.removeTask).not.toHaveBeenCalled();
    });

    test("should return 404 when task is not found", async () => {
      // arrange
      mockTaskService.removeTask.mockRejectedValue(new Error("Task not found"));

      // act
      const response = await request(app).delete("/tasks/999");

      // assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Task not found");
      expect(mockTaskService.removeTask).toHaveBeenCalledWith(999);
    });

    test("should return 500 when service throws a non-404 error", async () => {
      // arrange
      mockTaskService.removeTask.mockRejectedValue(new Error("Database error"));

      // act
      const response = await request(app).delete("/tasks/1");

      // assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error", "Database error");
      expect(mockTaskService.removeTask).toHaveBeenCalledWith(1);
    });
  });
});
