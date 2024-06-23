# Got Milk? Campaign Video Evaluation

This project is designed to evaluate videos submitted for the "Got Milk?" campaign. It uses the Twelve Labs API to ingest videos and then generates an evaluation based on specific criteria relevant to the campaign.

## Author
Simran Butalia

## Features

- Submit YouTube videos for evaluation.
- Ingest videos using the Twelve Labs API.
- Generate detailed evaluations based on relevance to the "Got Milk?" campaign.
- Display evaluation results in a structured and visually appealing format using Bootstrap.

## Prerequisites

- Node.js and npm installed on your machine.
- Twelve Labs API key.
- Twelve Labs Index ID.

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/got-milk-evaluation.git
    cd got-milk-evaluation
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory and add your Twelve Labs API key:
    ```plaintext
    TWELVE_LABS_API_KEY=your_twelve_labs_api_key
    TWELVE_LABS_SUBMISSION_INDEX=your_twelve_labs_index_id (used to submit videos to 12 labs index)
    ```

## Usage

1. Start the server:
    ```bash
    npm start
    ```

2. Open your browser and navigate to `http://localhost:3000`.

3. Enter the YouTube URL of the video you want to evaluate and click "Submit".

4. The evaluation results will be displayed in /viewSubmissions

## Project Structure

- `public/`: Contains the frontend JavaScript files.
  - `app.js`: Handles form submission and result display.
  - `api.js`: Handles API requests to the backend.
- `views/`: Contains the EJS templates.
  - `index.ejs`: The main template for the submission form and results display.
- `controllers/`: Contains the backend logic.
  - `twelveLabsController.js`: Handles video ingestion and evaluation.
- `routes/`: Contains the route definitions.
  - `download.js`: Defines the route for submitting videos.
- `server.js`: The main server file to set up Fastify and define routes.

## Judging Timer

The `judgingTimers.js` is an AI Judge module that is responsible for periodically checking for new video submissions in the database and processing them. It performs the following tasks:

1. **Retrieve New Entries**: Fetches entries from the database that are in 'NEW' or 'INDEXED' states.
2. **Process Each Entry**:
   - For new entries, it gets the task status from the Twelve Labs API. If the task is ready, it fetches the video thumbnail, updates the database with the video ID, metadata, and thumbnail, and changes the state to 'INDEXED'.
   - For indexed entries, it checks the criteria of the video using the Twelve Labs API. If successful, it updates the database with the judge's results.
3. **Reschedule Processing**: The function is scheduled to run every 120 seconds (2 minutes) using `setTimeout`.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.