const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");

let planets = require("./data/planets.json");
const PORT = 3000; // process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  requestHandler(req, res);
});

server.listen(PORT);

/**
 * Handles the incoming request and routes it to the appropriate controller based on the pathname.
 *
 * @param {http.IncomingMessage} req - The incoming request object.
 * @param {http.ServerResponse} res - The server response object.
 */
function requestHandler(req, res) {
  const { pathname } = url.parse(req.url);

  if (pathnameIsForHomepage(pathname)) {
    homepageController(req, res);
  } else if (pathnameIsForPlanets(pathname)) {
    planetsController(req, res);
  } else {
    notFoundHandler(res);
  }
}

/**
 * Controller for handling planet-related requests.
 *
 * @param {http.IncomingMessage} req - The incoming request object.
 * @param {http.ServerResponse} res - The server response object.
 */
async function planetsController(req, res) {
  const { pathname, query } = url.parse(req.url, true);
  const { method } = req;

  if (pathname === "/planets" && method === "GET") {
    res.setHeader("Content-Type", "application/json");
    const filteredPlanets = planets.filter((planet) => planet.population > 0);
    successHandler(res, JSON.stringify(filteredPlanets));
  } else if (pathname === "/planet") {
    if (method === "GET") {
      res.setHeader("Content-Type", "application/json");
      const planetId = query.id;
      if (planetId) {
        const planet = planets.find((planet) => planet.id === Number(planetId));
        if (planet) {
          successHandler(res, JSON.stringify(planet));
        } else {
          notFoundHandler(res);
        }
      } else {
        badRequestHandler(res);
      }
    } else if (method === "POST") {
      res.setHeader("Content-Type", "application/json");
      const body = await loadBody(req);
      const planetId = query.id;
      const surfaceWater = Number(body.surface_water);
      if (planetId && surfaceWater) {
        const planet = planets.find((planet) => planet.id === Number(planetId));
        if (planet) {
          planet.surface_water = surfaceWater;
          successHandler(
            res,
            JSON.stringify({
              success: true,
              message: `Planet updated. Surface water new value: ${surfaceWater}`,
            })
          );
        } else {
          notFoundHandler(res);
        }
      } else {
        badRequestHandler(res);
      }
    }
  }
}

/**
 * Controller for handling the homepage request.
 *
 * @param {http.IncomingMessage} req - The incoming request object.
 * @param {http.ServerResponse} res - The server response object.
 */
function homepageController(req, res) {
  const { method } = req;

  if (method === "GET") {
    res.setHeader("Content-Type", "text/html");
    fs.readFile(path.join(__dirname, "static", "index.html"), (err, data) => {
      if (err) {
        internalServerErrorHandler(res);
      } else {
        successHandler(res, data);
      }
    });
  } else {
    notFoundHandler(res);
  }
}

/**
 * Checks if the provided pathname is for planet-related requests..
 *
 * @param {string} pathname - The pathname to check.
 * @returns {boolean} - `true` if the pathname is for planet-related requests, `false` otherwise.
 */
function pathnameIsForPlanets(pathname) {
  const pathArray = pathname.split("/");
  pathArray.shift();
  const rootPath = pathArray[0];
  return rootPath === "planets" || rootPath === "planet" ? true : false;
}

/**
 * Checks if the provided pathname is for homepage requests..
 *
 * @param {string} pathname - The pathname to check.
 * @returns {boolean} - `true` if the pathname is for homepage, `false` otherwise.
 */
function pathnameIsForHomepage(pathname) {
  return pathname === "/" ? true : false;
}

/**
 * Asynchronously loads the request body from an incoming HTTP request.
 *
 * @param {object} req - The HTTP request object representing the incoming request.
 * @returns {Promise} A promise that resolves with the parsed request body or rejects with an error.
 *
 * Note: This function assumes that the request contains a JSON payload. Adjustments should be made to handle different
 * payload formats accordingly.
 */
function loadBody(req) {
  return new Promise((resolve, reject) => {
    let requestBodyJSON = "";

    req.on("data", (chunk) => {
      requestBodyJSON += chunk;
    });

    req.on("end", () => {
      try {
        const requestBody = JSON.parse(requestBodyJSON);
        resolve(requestBody);
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", (error) => {
      reject(error);
    });
  });
}

/**
 * Handles the success response for a request.
 *
 * @param {http.ServerResponse} res - The response object to send the success response.
 * @param {unknown} res - The data to send with the success response.
 */
function successHandler(res, data) {
  res.statusCode = 200;
  res.end(data);
}

/**
 * Handles the "Not Found" response for a request.
 *
 * @param {http.ServerResponse} res - The response object to send the "Not Found" response.
 */
function notFoundHandler(res) {
  res.statusCode = 404;
  res.end("Not Found!");
}

/**
 * Handles the "Bad Request" response for a request.
 *
 * @param {http.ServerResponse} res - The response object to send the "Bad Request" response.
 */
function badRequestHandler(res) {
  res.statusCode = 400;
  res.end("Bad Request");
}

/**
 * Handles the "Internal Server Error" response for a request.
 *
 * @param {http.ServerResponse} res - The response object to send the "Internal Server Error" response.
 */
function internalServerErrorHandler(res) {
  res.statusCode = 500;
  res.end("Internal Server Error");
}
