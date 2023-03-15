const express = require("express");
const app = express();
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
app.use(express.json());
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.get("/movies/", async (request, response) => {
  dbQuery = `SELECT * FROM movie;`;
  const dbResponse = await db.all(dbQuery);
  const newResponse = dbResponse.map((each) => {
    return { movieName: each.movie_name };
  });
  response.send(newResponse);
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const dbQuery = `INSERT INTO movie(director_id,movie_name,lead_actor) VALUES(${directorId},'${movieName}','${leadActor}');`;
  await db.run(dbQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const dbQuery = `SELECT * FROM movie WHERE movie_id=${movieId};`;
  const dbResponse = await db.get(dbQuery);
  const newResponse = () => {
    return {
      movieId: dbResponse.movie_id,
      directorId: dbResponse.director_id,
      movieName: dbResponse.movie_name,
      leadActor: dbResponse.lead_actor,
    };
  };
  response.send(newResponse());
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const dbQuery = `UPDATE movie SET director_id=${directorId},movie_name='${movieName}',lead_actor='${leadActor}' WHERE movie_id=${movieId};`;
  await db.run(dbQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const dbQuery = `DELETE FROM movie WHERE movie_id=${movieId};`;
  await db.run(dbQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const dbQuery = `SELECT * FROM director ORDER BY director_id;`;
  const dbResponse = await db.all(dbQuery);
  const newArr = dbResponse.map((each) => {
    return {
      directorId: each.director_id,
      directorName: each.director_name,
    };
  });
  response.send(newArr);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const dbQuery = `SELECT * FROM movie NATURAL JOIN director WHERE director_id=${directorId};`;
  const dbResponse = await db.all(dbQuery);
  const newArr = dbResponse.map((each) => {
    return {
      movieName: each.movie_name,
    };
  });
  response.send(newArr);
});

module.exports = app;
