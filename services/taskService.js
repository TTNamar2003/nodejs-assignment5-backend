import { TaskModel } from "../models/taskModel.js";

export class TaskService {
  constructor(taskModel = new TaskModel()) {
    this.taskModel = taskModel;
  }

  async getTasks() {
    try {
      return await this.taskModel.getAllTasks();
    } catch (error) {
      throw error;
    }
  }

  async addTask(title) {
    try {
      return await this.taskModel.createTask(title);
    } catch (error) {
      throw error;
    }
  }

  async removeTask(id) {
    try {
      await this.taskModel.deleteTask(id);
    } catch (error) {
      throw error;
    }
  }
}
