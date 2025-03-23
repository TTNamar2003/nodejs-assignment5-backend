import {
  getTasks,
  createTask,
  deleteTask,
} from "../controllers/taskController.js";
import { TaskService } from "../services/taskService.js";

// mock the taskService
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

describe("Task Controller", () => {
  let mockReq;
  let mockRes;
  let mockNext;
  let mockTaskServiceInstance;

  beforeEach(() => {
    // reset the mocks
    jest.clearAllMocks();

    // create mock request, response, and next function
    mockReq = {};
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();

    // creating the mock instanceof TaskService class
    mockTaskServiceInstance = new TaskService();
  });

  describe("getTasks", () => {
    test("should return tasks when successful", async () => {
      // arrange
      const mockTasks = [{ id: 1, title: "Test Task", completed: false }];
      mockTaskServiceInstance.getTasks.mockResolvedValue(mockTasks);

      // act
      await getTasks(mockReq, mockRes, mockNext);

      // assert
      expect(mockTaskServiceInstance.getTasks).toHaveBeenCalledTimes(1);
      expect(mockRes.json).toHaveBeenCalledWith(mockTasks);
    });

    test("should call next with error when getTasks fails", async () => {
      // arrange
      const mockError = new Error("Database error");
      mockTaskServiceInstance.getTasks.mockRejectedValue(mockError);

      // act
      await getTasks(mockReq, mockRes, mockNext);

      // assert
      expect(mockTaskServiceInstance.getTasks).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe("createTask", () => {
    test("should create a task when valid title is provided", async () => {
      // arrange
      const mockTask = { id: 1, title: "New Task", completed: false };
      mockReq.body = { title: "New Task" };
      mockTaskServiceInstance.addTask.mockResolvedValue(mockTask);

      // act
      await createTask(mockReq, mockRes, mockNext);

      // assert
      expect(mockTaskServiceInstance.addTask).toHaveBeenCalledWith("New Task");
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockTask);
    });

    test("should return 400 when title is missing", async () => {
      // arrange
      mockReq.body = {};

      // act
      await createTask(mockReq, mockRes, mockNext);

      // assert
      expect(mockTaskServiceInstance.addTask).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Title is required" });
    });

    test("should return 400 when title is empty", async () => {
      // arrange
      mockReq.body = { title: "   " };

      // act
      await createTask(mockReq, mockRes, mockNext);

      // assert
      expect(mockTaskServiceInstance.addTask).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Title is empty" });
    });

    test("should call next with error when addTask fails", async () => {
      // arrange
      const mockError = new Error("Database error");
      mockReq.body = { title: "New Task" };
      mockTaskServiceInstance.addTask.mockRejectedValue(mockError);

      // act
      await createTask(mockReq, mockRes, mockNext);

      // assert
      expect(mockTaskServiceInstance.addTask).toHaveBeenCalledWith("New Task");
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe("deleteTask", () => {
    test("should delete a task when valid id is provided", async () => {
      // arrange
      mockReq.params = { id: "1" };

      // act
      await deleteTask(mockReq, mockRes, mockNext);

      // assert
      expect(mockTaskServiceInstance.removeTask).toHaveBeenCalledWith(1);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Task deleted successfully",
      });
    });

    test("should return 400 when id is missing", async () => {
      // arrange
      mockReq.params = {};

      // act
      await deleteTask(mockReq, mockRes, mockNext);

      // assert
      expect(mockTaskServiceInstance.removeTask).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Valid ID is required",
      });
    });

    test("should return 400 when id is not a number", async () => {
      // arrange
      mockReq.params = { id: "abc" };

      // act
      await deleteTask(mockReq, mockRes, mockNext);

      // assert
      expect(mockTaskServiceInstance.removeTask).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Valid ID is required",
      });
    });

    test("should return 404 when task is not found", async () => {
      // arrange
      mockReq.params = { id: "999" };
      const notFoundError = new Error("Task not found");
      mockTaskServiceInstance.removeTask.mockRejectedValue(notFoundError);

      // act
      await deleteTask(mockReq, mockRes, mockNext);

      // assert
      expect(mockTaskServiceInstance.removeTask).toHaveBeenCalledWith(999);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: notFoundError.message,
      });
    });

    test("should call next with error when removeTask fails with non-404 error", async () => {
      // arrange
      mockReq.params = { id: "1" };
      const mockError = new Error("Database error");
      mockTaskServiceInstance.removeTask.mockRejectedValue(mockError);

      // act
      await deleteTask(mockReq, mockRes, mockNext);

      // assert
      expect(mockTaskServiceInstance.removeTask).toHaveBeenCalledWith(1);
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });
});
