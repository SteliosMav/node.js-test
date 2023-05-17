# Node.js HTTP Server

This is a simple Node.js HTTP server that handles requests and routes them to the appropriate controllers based on the URL pathname. It provides functionality for handling homepage requests and planet-related requests.

## Getting Started

To get started with the server, follow these steps:

1. Clone the repository:
   git clone https://github.com/your-username/your-repository.git

2. Navigate to the project directory:cd your-repository

3. Start the server: node script

The server is now running. You can access it at [http://localhost:3000](http://localhost:3000).

## Usage

### Homepage

The server handles requests to the homepage ("/") and serves the "index.html" file located in the "static" directory. Only GET requests are supported for the homepage.

### Planets

The server provides functionality for handling planet-related requests. The following endpoints are available:

- GET /planets: Retrieves a list of planets with a population greater than 0.
- GET /planet?id={planetId}: Retrieves information about a specific planet with the given ID.
- POST /planet?id={planetId}: Updates the surface water value of a specific planet with the given ID. The new surface water value should be provided in the request body as JSON.

### Error Handling

The server includes error handling for different scenarios, such as:

- Not Found (404): When the requested endpoint is not found.
- Bad Request (400): When a request is malformed or missing required parameters.
- Internal Server Error (500): When an unexpected error occurs on the server.

## Configuration

The server is configured to listen on port 3000 by default. You can modify the port by changing the value of the `PORT` constant in the code.

## Customization

You can customize the server's behavior by modifying the controllers and handlers in the code. The controllers are responsible for processing requests and generating responses, while the handlers handle different types of responses (success, error) and set appropriate headers.

### Additional File: Alternate Implementation

In addition to the main script file, an alternate implementation file (`with-modules.js`) is provided. This file uses a different approach to handle requests and implement the routing logic. It introduces the concept of modules and base classes to organize the code and handle different types of requests.

The `with-modules.js` file includes the following classes and functions:

- `BaseModule`: Represents a base module with common functionality.
- `HomepageModule`: Inherits from `BaseModule` and handles requests to the homepage (`"/"`).
- `PlanetsModule`: Inherits from `BaseModule` and handles planet-related requests.

The `requestHandler` function in `with-modules.js` is responsible for routing incoming requests to the corresponding modules based on the URL pathname. Each module has its own `pathnameMatches` and `requestHandler` methods to handle specific types of requests.

The alternate implementation provides a modular and extensible approach to handling requests and allows for easy customization and expansion.
