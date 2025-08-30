// importing packages
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Path to the dataset
const datasetPath = path.join(
  __dirname,
  '../Dataset/boardGames.json'
);

// Helper function to load games dynamically
const loadGames = () => {
  const rawData = fs.readFileSync(
    datasetPath,
    'utf-8'
  );
  return JSON.parse(rawData);
};

// Helper function to save games
const saveGames = (games) => {
  fs.writeFileSync(
    datasetPath,
    JSON.stringify(games, null, 2),
    'utf-8'
  );
};

//-------------------------------GET------------------------------------

// GET all games
router.get('/', (req, res) => {
  const games = loadGames();
  res.status(200).json(games);
});

// GET all reviewers and scores
router.get('/reviews', (req, res) => {
  const games = loadGames();

  const reviewsData = games.Games.map((game) => ({
    gameId: game.gameId,
    Name: game.Name,
    Reviews: game.Ratings.reviews.map(
      (review) => ({
        reviewId: review.reviewId,
        reviewer: review.reviewer,
        scores: review.scores,
      })
    ),
  }));

  res.status(200).json(reviewsData);
});

// GET reviews for a specific gameId
router.get('/:gameId/reviews', (req, res) => {
  const games = loadGames();
  const { gameId } = req.params;

  const game = games.Games.find(
    (g) => g.gameId === gameId
  );

  if (!game) {
    return res
      .status(404)
      .json({ message: 'Game not found' });
  }

  const reviewsData = game.Ratings.reviews.map(
    (review) => ({
      reviewId: review.reviewId,
      reviewer: review.reviewer,
      scores: review.scores,
    })
  );

  res.status(200).json({
    gameId: game.gameId,
    Name: game.Name,
    Reviews: reviewsData,
  });
});

// GET only the list of game names
router.get('/names', (req, res) => {
  const games = loadGames();
  const gameNames = games.Games.map(
    (game) => game.Name
  );
  res.status(200).json(gameNames);
});

//-------------------------------POST------------------------------------

// POST route to submit a review
router.post('/:gameId/reviews', (req, res) => {
  const games = loadGames();
  const { gameId } = req.params;
  const { reviewId, reviewer, scores } = req.body;

  // Find the game
  const game = games.Games.find(
    (g) => g.gameId === gameId
  );
  if (!game) {
    return res
      .status(404)
      .json({ message: 'Game not found' });
  }

  // Validate required fields
  if (!reviewId || !reviewer || !scores) {
    return res
      .status(400)
      .json({
        message:
          'Missing reviewId, reviewer, or scores',
      });
  }

  // Add the new review
  game.Ratings.reviews.push({
    reviewId,
    reviewer,
    scores,
  });

  // Recalculate averages
  const allScores = game.Ratings.reviews.map(
    (r) => r.scores
  );
  const categories = Object.keys(scores);

  const averages = {};
  categories.forEach((category) => {
    const values = allScores
      .map((s) => s[category])
      .filter(
        (v) => v !== null && v !== undefined
      );

    averages[category] =
      values.length > 0
        ? values.reduce((a, b) => a + b, 0) /
          values.length
        : null;
  });

  // Update averages in dataset
  game.Ratings.Averages = averages;

  // Save changes
  saveGames(games);

  res.status(201).json({
    message: 'Review added successfully',
    gameId: game.gameId,
    newReview: { reviewId, reviewer, scores },
    updatedAverages: averages,
  });
});

module.exports = router;
