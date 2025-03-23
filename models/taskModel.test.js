import { TaskModel } from "../models/taskModel.js";
import db from "../config/db.js";

// mock the db
jest.mock("../config/db.js", () => ({
  query: jest.fn(),
}));

describe("TaskModel", () => {
  let taskModel;

  beforeEach(() => {
    taskModel = new TaskModel();
    jest.clearAllMocks();
  });

  describe("getAllTasks", () => {
    it("should return all tasks", async () => {
      //mock the query response
      const mockRows = [
        { id: 1, title: "Task 1", created_at: new Date() },
        { id: 2, title: "Task 2", created_at: new Date() },
      ];
      db.query.mockResolvedValue({ rows: mockRows });

      // call the getAllTasks method
      const result = await taskModel.getAllTasks();

      // assert expectations
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM tasks ORDER BY created_at DESC"
      );
      expect(result).toEqual(mockRows);
    });

    it("should throw an error when database query fails", async () => {
      // mock the failed query
      const mockError = new Error("Database connection error");
      db.query.mockRejectedValue(mockError);

      // assert expectations for error
      await expect(taskModel.getAllTasks()).rejects.toThrow(
        "Error fetching tasks: Database connection error"
      );
    });
  });

  describe("createTask", () => {
    it("should create a new task", async () => {
      // mock the data
      const mockTask = { id: 1, title: "New Task", created_at: new Date() };
      db.query.mockResolvedValue({ rows: [mockTask] });

      // call the createTask method
      const result = await taskModel.createTask("New Task");

      // expectation
      expect(db.query).toHaveBeenCalledWith(
        "INSERT INTO tasks (title) VALUES ($1) RETURNING *",
        ["New Task"]
      );
      expect(result).toEqual(mockTask);
    });

    it("should throw an error when task creation fails", async () => {
      // mock the error response
      const mockError = new Error("Invalid input");
      db.query.mockRejectedValue(mockError);

      // expecations for error
      await expect(taskModel.createTask("New Task")).rejects.toThrow(
        "Error creating task: Invalid input"
      );
    });
  });

  describe("deleteTask", () => {
    it("should delete a task successfully", async () => {
      // mock resolved value
      db.query.mockResolvedValue({ rowCount: 1 });

      // call the deleleTask
      await taskModel.deleteTask(1);

      // assert expectations
      expect(db.query).toHaveBeenCalledWith("DELETE FROM tasks WHERE id = $1", [
        1,
      ]);
    });

    it("should throw an error when task is not found", async () => {
      // mock resolved value
      db.query.mockResolvedValue({ rowCount: 0 });
      // assert expectations for error
      await expect(taskModel.deleteTask(999)).rejects.toThrow(
        "Task with ID 999 not found"
      );
    });

    it("should throw an error when deletion fails", async () => {
      // mock a failed query
      const mockError = new Error("Database connection error");
      db.query.mockRejectedValue(mockError);

      // assert expectations to throw an error
      await expect(taskModel.deleteTask(1)).rejects.toThrow(
        "Error deleting task: Database connection error"
      );
    });
  });
});
