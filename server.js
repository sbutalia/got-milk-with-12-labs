/**
 * This is the main Node.js server script for your project
 * Check out the two endpoints this back-end API provides in fastify.get and fastify.post below
 */
 
const path = require("path");
const ascii = require("ascii-art");
require("dotenv").config();
const fetch = require("node-fetch");
const twelveLabsController = require("./controllers/twelveLabsController");
const judingTimerInst = require('./timers/judgingTimer');

const authenticate = { realm: 'Westeros' }; 

// CommonJS wrapper to use ES module
let dbInst;
(async () => {
  dbInst = await import('./connectors/dbConnector.mjs');
  await dbInst.loadDb();
  
  twelveLabsController.setDbInstance(dbInst);
  judingTimerInst.processNewEntries(dbInst);
})();


// Require the fastify framework and instantiate it
const fastify = require("fastify")({
  // Set this to true for detailed logging:
  logger: false,
});


// ADD FAVORITES ARRAY VARIABLE FROM TODO HERE

// Setup our static files
fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"),
  prefix: "/", // optional: default '/'
});

// Formbody lets us parse incoming forms
fastify.register(require("@fastify/formbody"));

// View is a templating manager for fastify
fastify.register(require("@fastify/view"), {
  engine: {
    handlebars: require("handlebars"),
  },
});

fastify.register(require('@fastify/basic-auth'), {
  validate: async (username, password, req, reply) => {
    if (username === 'john' && password === 'snow') {
      return;
    } else {
      return new Error('Winter is coming');
    }
  },
  authenticate,
});

// Load and parse SEO data
const seo = require("./src/seo.json");
if (seo.url === "glitch-default") {
  seo.url = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
}

/**
 * Our home page route
 *
 * Returns src/pages/index.hbs with data built into it
 */
fastify.after(() => {
  //fastify.addHook('onRequest', fastify.basicAuth);

  fastify.get('/', (req, reply) => {
    let params = { seo: seo };
    return reply.view("/src/pages/index.hbs", params);
  });

  fastify.get('/dev', (req, reply) => {
    let params = { seo: seo };
    return reply.view("/src/pages/devIndex.hbs", params);
  });
  
  fastify.get('/submissions', (req, reply) => {
    let params = { seo: seo };
    return reply.view("/src/pages/submissions.hbs", params);
  });
  
  fastify.get('/viewSubs', (req, reply) => {
    let params = { seo: seo };
    return reply.view("/src/pages/viewSubs.hbs", params);
  });  
  
});

/**
 * Our POST route to handle and react to form submissions
 *
 * Accepts body data indicating the user choice
 */
fastify.post("/", function (request, reply) {
  // Build the params object to pass to the template
  let params = { seo: seo };

  // The Handlebars template will use the parameter values to update the page with the chosen color
  return reply.view("/src/pages/index.hbs", params);
});


fastify.get("/indexes", twelveLabsController.listIndexes);
fastify.get("/getSubmissions", twelveLabsController.getSubmissions)

fastify.post("/generate", twelveLabsController.generateData);
fastify.post("/listVideosInIndex", twelveLabsController.listVideosInIndex);
fastify.post("/getThumbnail", twelveLabsController.getThumbnail);
fastify.post("/getVideo", twelveLabsController.getVideo);
fastify.post("/checkCriteria", twelveLabsController.checkCriteria);
fastify.post("/twelveWebHook", twelveLabsController.twelveWebHook);

//fastify.get("/submissions", twelveLabsController.displaySubmissions);
fastify.post("/submitVideo", twelveLabsController.submitVideo);

// Run the server and report out to the logs
fastify.listen(
  { port: process.env.PORT, host: "0.0.0.0" },
  function (err, address) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Your app is listening on ${address}`);
  }
);

