import express from "express";
import helmet from "helmet";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import {
  findByUsername,
  getWatchlist,
  addMovie,
  updateMovie,
  deleteMovie
} from "./utils/db.js";

import { authenticate } from "./middleware/authenticate.js";
import { authorizeModification } from "./middleware/authorize.js";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(helmet());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Family Movie Watchlist API");
});

// ============================
// LOGIN
// ============================

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;

  // Missing username/password
  if (!username || !password) {
    return res.status(400).json({
      error: "Username and password are required."
    });
  }

  // Find user
  const user = findByUsername(username);

  if (!user) {
    return res.status(401).json({
      error: "Invalid credentials."
    });
  }

  // Check password
  const passwordValid = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordValid) {
    return res.status(401).json({
      error: "Invalid credentials."
    });
  }

  // Create JWT
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role
    },
    process.env.JWT_SECRET || "family-movie-secret",
    {
      expiresIn: "1h"
    }
  );

  return res.status(200).json({
    token
  });
});

// ============================
// GET WATCHLIST
// ============================

app.get(
  "/api/watchlist/:userId",
  authenticate,
  (req, res) => {
    const userId = Number(req.params.userId);

    const watchlist = getWatchlist(userId);

    if (watchlist === null) {
      return res.status(404).json({
        error: "User not found."
      });
    }

    return res.status(200).json(watchlist);
  }
);

// ============================
// ADD MOVIE
// ============================

app.post(
  "/api/watchlist/:userId/movies",
  authenticate,
  authorizeModification,
  (req, res) => {
    const userId = Number(req.params.userId);

    const { title, genre } = req.body;

    const movie = addMovie(userId, {
      title,
      genre
    });

    if (!movie) {
      return res.status(404).json({
        error: "User not found."
      });
    }

    return res.status(201).json(movie);
  }
);

// ============================
// UPDATE MOVIE
// ============================

app.put(
  "/api/watchlist/:userId/movies/:movieId",
  authenticate,
  authorizeModification,
  (req, res) => {
    const userId = Number(req.params.userId);
    const movieId = Number(req.params.movieId);

    const movie = updateMovie(
      userId,
      movieId,
      req.body
    );

    if (!movie) {
      return res.status(404).json({
        error: "Movie not found."
      });
    }

    return res.status(200).json(movie);
  }
);

// ============================
// DELETE MOVIE
// ============================

app.delete(
  "/api/watchlist/:userId/movies/:movieId",
  authenticate,
  authorizeModification,
  (req, res) => {
    const userId = Number(req.params.userId);
    const movieId = Number(req.params.movieId);

    const deleted = deleteMovie(
      userId,
      movieId
    );

    if (!deleted) {
      return res.status(404).json({
        error: "Movie not found."
      });
    }

    return res.status(200).json({
      message: "Movie deleted successfully."
    });
  }
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});