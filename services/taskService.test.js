import { TaskService } from "../services/taskService.js";
import { TaskModel } from "../models/taskModel.js";

// mock the taskModel
jest.mock("../models/taskModel.js");

describe("TaskService", () => {
  let taskService;
  let mockTaskModel;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTaskModel = {
      getAllTasks: jest.fn(),
      createTask: jest.fn(),
      deleteTask: jest.fn(),
    };
    TaskModel.mockImplementation(() => mockTaskModel);
    taskService = new TaskService();
  });

  describe("getTasks", () => {
    it("should return all tasks", async () => {
      // mock data
      const mockTasks = [
        { id: 1, title: "Task 1" },
        { id: 2, title: "Task 2" },
      ];
      mockTaskModel.getAllTasks.mockResolvedValue(mockTasks);

      // call the getTasks
      const result = await taskService.getTasks();

      // assert expectations
      expect(mockTaskModel.getAllTasks).toHaveBeenCalled();
      expect(result).toEqual(mockTasks);
    });

    it("should propagate errors from getTasks Service", async () => {
      // mock an error
      const mockError = new Error("Database error");
      mockTaskModel.getAllTasks.mockRejectedValue(mockError);

      // assert expectations
      await expect(taskService.getTasks()).rejects.toThrow("Database error");
    });
  });

  describe("addTask", () => {
    it("should add a task with valid title", async () => {
      // mock data
      const mockTask = { id: 1, title: "New Task" };
      mockTaskModel.createTask.mockResolvedValue(mockTask);

      // call the addTask
      const result = await taskService.addTask("New Task");

      // assert expectations
      expect(mockTaskModel.createTask).toHaveBeenCalledWith("New Task");
      expect(result).toEqual(mockTask);
    });

    it("should propagate errors from the addTask service", async () => {
      // mocak an error
      const mockError = new Error("Database error");
      mockTaskModel.createTask.mockRejectedValue(mockError);

      // assert assert expectations
      await expect(taskService.addTask("New Task")).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("removeTask", () => {
    it("should remove a task with valid id", async () => {
      // call the removeTask method
      await taskService.removeTask(1);

      // assert assert expectations
      expect(mockTaskModel.deleteTask).toHaveBeenCalledWith(1);
    });

    it("should propagate errors from the removeTask service", async () => {
      // mock an error
      const mockError = new Error("Task not found");
      mockTaskModel.deleteTask.mockRejectedValue(mockError);

      // assert expectations
      await expect(taskService.removeTask(999)).rejects.toThrow(
        "Task not found"
      );
    });
  });
});
