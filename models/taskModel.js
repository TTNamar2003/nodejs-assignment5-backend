import db from "../config/db.js";

export class TaskModel {
  async getAllTasks() {
    try {
      const result = await db.query(
        "SELECT * FROM tasks ORDER BY created_at DESC"
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching tasks: ${error.message}`);
    }
  }

  async createTask(title) {
    try {
      const result = await db.query(
        "INSERT INTO tasks (title) VALUES ($1) RETURNING *",
        [title]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating task: ${error.message}`);
    }
  }

  async deleteTask(id) {
    try {
      const result = await db.query("DELETE FROM tasks WHERE id = $1", [id]);
      if (result.rowCount === 0) {
        throw new Error(`Task with ID ${id} not found`);
      }
    } catch (error) {
      throw new Error(`Error deleting task: ${error.message}`);
    }
  }
}
