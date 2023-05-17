const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");

/**
 * Represents a base module with common functionality.
 */
class BaseModule {
  /**
   * Checks if the pathname matches a given condition.
   * @param {string} pathname - The URL pathname (starts with '/').
   * @returns {boolean} - Returns true if the pathname matches the condition, false otherwise.
   */
  pathnameMatches(pathname) {}

  /**
   * Handles the request and forwards it to the corresponding controller.
   * @param {http.IncomingMessage} req - The HTTP request object.
   * @param {http.ServerResponse} res - The HTTP response object.
   */
  requestHandler(req, res) {}
}

class HomepageModule extends BaseModule {
  pathnameMatches(pathname) {
    return pathname === "/" ? true : false;
  }

  requestHandler(req, res) {
    const { method } = req;

    if (method === "GET") {
      this.getHomepageController(req, res);
    } else {
      notFoundHandler(res);
    }
  }

  getHomepageController(req, res) {
    res.setHeader("Content-Type", "text/html");
    fs.readFile(path.join(__dirname, "static", "index.html"), (err, data) => {
      if (err) {
        internalServerErrorHandler(res);
      } else {
        successHandler(res, data);
      }
    });
  }
}

class PlanetsModule extends BaseModule {
  pathnameMatches(pathname) {
    const pathArray = pathname.split("/");
    pathArray.shift();
    const rootPath = pathArray[0];
    return rootPath === "planets" || rootPath === "planet" ? true : false;
  }

  requestHandler(req, res) {
    const { pathname } = url.parse(req.url, true);
    const { method } = req;

    if (pathname === "/planets" && method === "GET") {
      this.getAllPlanetsController(req, res);
    } else if (pathname === "/planet") {
      if (method === "GET") {
        this.getOnePlanetController(req, res);
      } else if (method === "POST") {
        this.updatePlanetController(req, res);
      }
    }
  }

  getAllPlanetsController(req, res) {
    res.setHeader("Content-Type", "application/json");
    const filteredPlanets = planets.filter((planet) => planet.population > 0);
    successHandler(res, JSON.stringify(filteredPlanets));
  }

  getOnePlanetController(req, res) {
    const { query } = url.parse(req.url, true);
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
  }

  async updatePlanetController(req, res) {
    const { query } = url.parse(req.url, true);
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

const modules = [HomepageModule, PlanetsModule]; // Array of module classes to be used
let planets = require("./data/planets.json"); // Loading planet data from a JSON file
const PORT = 3000; // The port on which the server will listen for incoming requests. It is set to 3000 by default but can be overridden using the environment variable process.env.PORT.

/**
 * Handles the HTTP request and routes it to the appropriate module for further processing.
 * @param {http.IncomingMessage} req - The HTTP request object.
 * @param {http.ServerResponse} res - The HTTP response object.
 */
function requestHandler(req, res) {
  const { pathname } = url.parse(req.url, true);
  let associatedModuleFound = false;

  for (let index = 0; index < modules.length; index++) {
    const Module = modules[index];
    const moduleInstance = new Module();
    if (moduleInstance.pathnameMatches(pathname)) {
      associatedModuleFound = true;
      moduleInstance.requestHandler(req, res);
      break;
    }
  }

  if (!associatedModuleFound) notFoundHandler(res);
}

const server = http.createServer(async (req, res) => {
  requestHandler(req, res);
});

server.listen(PORT);
