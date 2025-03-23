import { TaskService } from "../services/taskService.js";
const taskService = new TaskService();

export async function getTasks(req, res, next) {
  try {
    const tasks = await taskService.getTasks();
    res.json(tasks);
  } catch (error) {
    next(error);
  }
}

export async function createTask(req, res, next) {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (title.trim() === "") {
      return res.status(400).json({ error: "Title is empty" });
    }

    const task = await taskService.addTask(title);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;
    console.log(typeof id);

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: "Valid ID is required" });
    }

    await taskService.removeTask(Number(id));
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
}
