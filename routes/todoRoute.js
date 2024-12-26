const { Router } = require("express");
const { todoModel } = require("../models/todomodel");
const { authenticate } = require("../middlewares/authentication");
const router = Router();

router
  .route("/")
  .get((req, res) => {
    const userId = req.user;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    todoModel
      .find({ user: userId }) // Use `find` instead of `findOne` to fetch all todos for the user
      .then((data) => {
        res.status(200).json(data);
      })
      .catch((err) => {
        console.error("Error fetching todos:", err);
        res.status(500).json({ error: "Internal server error" });
      });
  })
  .post(async (req, res) => {
    const userId = req.user;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const { title, description, completed } = req.body;

    try {
      const newTodo = new todoModel({
        title,
        description,
        completed: completed || false, // Default to `false` if not provided
        user: userId,
      });

      await newTodo.save();

      res
        .status(201)
        .json({ message: "Todo created successfully", todo: newTodo });
    } catch (error) {
      console.error("Error creating todo:", error);
      res.status(500).json({ error: "Failed to create todo" });
    }
  })
  .delete((req, res) => {
    const userId = req.user;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    todoModel
      .deleteMany({ user: userId }) // Filter by `userId` to delete only the user's todos
      .then(() => {
        res.status(200).json({ message: "Todos deleted successfully" });
      })
      .catch((err) => {
        console.error("Error deleting todos:", err);
        res.status(500).json({ error: "Failed to delete todos" });
      });
  });

router
  .route("/:_id")
  .delete((req, res) => {
    const id = req.params._id;
    todoModel
      .findByIdAndDelete(id)
      .then(() => {
        res.json({ message: "Todo deleted successfully" });
      })
      .catch((err) => {
        console.error(err);
      });
  })
  .patch((req, res) => {
    const id = req.params._id;
    const { title, description, completed } = req.body;
    todoModel
      .findByIdAndUpdate(id, { title, description, completed })
      .then(() => {
        res.json({ message: "Todo updated successfully" });
      })
      .catch((err) => {
        console.error(err);
      });
  });

module.exports = router;
