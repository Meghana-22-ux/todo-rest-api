const express = require("express");
const Todo = require("../models/Todo");

const router = express.Router();

// GET - Get all todos
router.get("/", async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });

    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch todos",
      error: error.message
    });
  }
});

// POST - Create a new todo
router.post("/", async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Title is required"
      });
    }

    const todo = new Todo({
      title,
      description
    });

    const savedTodo = await todo.save();

    res.status(201).json(savedTodo);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create todo",
      error: error.message
    });
  }
});

// PUT - Update a todo
router.put("/:id", async (req, res) => {
  try {
    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedTodo) {
      return res.status(404).json({
        message: "Todo not found"
      });
    }

    res.status(200).json(updatedTodo);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update todo",
      error: error.message
    });
  }
});

// DELETE - Delete a todo
router.delete("/:id", async (req, res) => {
  try {
    const deletedTodo = await Todo.findByIdAndDelete(req.params.id);

    if (!deletedTodo) {
      return res.status(404).json({
        message: "Todo not found"
      });
    }

    res.status(200).json({
      message: "Todo deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete todo",
      error: error.message
    });
  }
});

module.exports = router;