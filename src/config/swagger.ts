import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { Express } from 'express'

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Ride Sharing API',
        version: '1.0.0',
        description: `
  # Ride Sharing API Documentation
  
  Welcome to the **Ride Sharing API** documentation! Below, you'll find details about our WebSocket events and payloads.
  
  ---
  
  ## WebSocket Events:
  
  ### **ride:join**
  Join a ride using the following payload:
  
  \`\`\`json
  {
    "rideId": "string"
  }
  \`\`\`
  
  **Payload Details**:
  - \`rideId\` (**string**): The unique identifier of the ride to join.
  
  ---
  
  ### **ride:status:update**
  Clients who have joined a particular ride and are listenign to 'ride:status:update' will be broadcasted with payload below. Here's the payload structure:
  
  \`\`\`json
  {
    "rideId": "string",
    "status": "string",
    "message": "string",
    "timestamp": "string"
  }
  \`\`\`
  
  **Payload Details**:
  - \`rideId\` (**string**): The unique identifier of the ride.
  - \`status\` (**string**): The updated status (e.g., "completed", "in-progress").
  - \`message\` (**string**): A message describing the status update.
  - \`timestamp\` (**string**): The time the update occurred.
  
  ---
  
  ### Notes:
  - The API supports **real-time updates** via WebSockets for seamless communication.
      `,
    },
    servers: [
        {
            url: 'http://localhost:5000/api',
            description: 'Development server',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
    security: [{ bearerAuth: [] }],
};

const options = {
    swaggerDefinition,
    apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log('Swagger Docs available at http://localhost:5000/docs');
};
