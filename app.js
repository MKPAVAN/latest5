const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// --------------API 1

const snakeToCamelCase = (eachMovie) => {
  const { movie_name } = eachMovie;
  return {
    movieName: `${movie_name}`,
  };
};

app.get("/movies/", async (request, response) => {
  const getSqlQuery = `
  SELECT
      *
  FROM
      movie
  ORDER BY
      movie_id;`;
  const dbResponse = await db.all(getSqlQuery);
  const moviesList = dbResponse.map((eachMovie) => {
    return snakeToCamelCase(eachMovie);
  });
  response.send(moviesList);
});

module.exports = app;

// -------------API 2

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const postSqlQuery = `
  INSERT INTO
      movie(director_id, movie_name, lead_actor)
  VALUES( ${directorId}, '${movieName}', '${leadActor}' );`;
  await db.run(postSqlQuery);
  response.send("Movie Successfully Added");
});

// -------------API 3

const oneMovieSnakeToCamelCase = (each) => {
  const { movie_id, director_id, movie_name, lead_actor } = each;
  return {
    movieId: movie_id,
    directorId: director_id,
    movieName: movie_name,
    leadActor: lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getBookSqlQuery = `
  SELECT
      *
  FROM
      movie
  WHERE
      movie_id = ${movieId};`;

  const movie = await db.get(getBookSqlQuery);
  const movieList = [movie];
  const result = movieList.map((each) => {
    return oneMovieSnakeToCamelCase(each);
  });
  response.send(result[0]);
});

//---------------API4

app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;

  const putSqlQuery = `
  UPDATE
      movie
  SET
      director_id = ${directorId},
      movie_name = '${movieName}',
      lead_actor = '${leadActor}';
  WHERE
      movie_id = ${movieId};`;

  await db.run(putSqlQuery);
  response.send("Movie Details Updated");
});

//---------------API5

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteSqlQuery = `
  DELETE FROM
      movie
  WHERE movie_id = ${movieId};`;
  await db.run(deleteSqlQuery);
  response.send("Movie Removed");
});

// ---------------API6

const convertDirectorSnakeToCamelCase = (eachDirector) => {
  const { director_id, director_name } = eachDirector;
  return {
    directorId: director_id,
    directorName: director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorsSqlQuery = `
  SELECT
      *
  FROM
      director
  ORDER BY
    director_id;`;

  const dbResponse = await db.all(getDirectorsSqlQuery);
  const result = dbResponse.map((eachDirector) => {
    return convertDirectorSnakeToCamelCase(eachDirector);
  });
  response.send(result);
});

// ---------------API7

const convertgetDirectorMoviesSnakeTOCamelCase = (each) => {
  const { movie_name } = each;
  return {
    movieName: movie_name,
  };
};

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesSqlQuery = `
  SELECT
      *
  FROM
     movie
  WHERE
    director_id = ${directorId};`;
  const dbResponse = await db.all(getDirectorMoviesSqlQuery);

  const result = dbResponse.map((each) => {
    return convertgetDirectorMoviesSnakeTOCamelCase(each);
  });
  response.send(result);
});
