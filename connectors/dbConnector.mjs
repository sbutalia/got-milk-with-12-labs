import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';
import path from 'path';
import fs from 'fs';

import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construct the file path using __dirname
const file = path.join(__dirname, '../.data/db.json');

const defaultData = { submissions: [] }; 

// Check if the file exists
if (!fs.existsSync(file)) {
  // If it doesn't exist, create it with the default data
  fs.writeFileSync(file, JSON.stringify(defaultData, null, 2));
} 

const adapter = new JSONFileSync(file);
const db = new LowSync(adapter, defaultData);

async function loadDb() {
  db.read();
}

// Function to clear the database
async function clearDB() {
  db.data = defaultData;
  db.write();
  db.read();
}

async function purgeOldData() {
  const cutoff = Date.now() - (5 * 24 * 60 * 60 * 1000); // 5 days in milliseconds
  db.data.emails = db.data.emails.filter((email) => email.timestamp >= cutoff);
  db.write();
  db.read();
}
 
// Function to add a new email entry
async function addSubmission(subName, subEmail, ytUrl, rec12Id) {
  let fullRec = {subName, subEmail, ytUrl, rec12Id};
  if (!ytUrl) {
    console.error("YouTube Url is required");
    return;
  }
  if (!subName) {
    console.error("sub Name is required");
    return;
  }
  if (!subEmail) {
    console.error("sub Email is required");
    return;
  }
  
  const existingRec = await db.data.submissions.find((sub) => sub.ytUrl === ytUrl);
  
  if (existingRec) {
    console.log(`Record with id ${existingRec.ytUrl} already exists`);
    return;
  }
  
  fullRec["timestamp"] = Date.now();
  fullRec["state"] = "NEW";
  
  await db.data.submissions.unshift(fullRec); 
  await db.write();
  await db.read();
}

// Function to retrieve all email entries
async function getAllSubmissions() {
  return db.data.submissions;
}

// Function to retrieve a specific email entry by mailId
async function getSubmission(rec12Id) {
  const rec = db.data.submissions.find((sub) => sub.rec12Id === rec12Id);
  return rec;
}
 
async function getSubmissionYtUrl(ytUrl) {
  const rec = db.data.submissions.find((sub) => sub.ytUrl === ytUrl);
  return rec;
} 

async function getEntriesByState(state) {
  const subs = db.data.submissions.filter(sub => sub.state === state);
  return subs;
}

async function getEntriesByStates(states) {
  const subs = db.data.submissions.filter(sub => states.includes(sub.state));
  return subs;
}

async function updateSubmissionVidId(rec12Id, videoId, metadata, thumb, state) {
  const rec = db.data.submissions.find((sub) => sub.rec12Id === rec12Id);

  rec["state"] = state;
  rec["twVideoId"] = videoId;
  rec["thumb"] = thumb;
  rec["twVideoMetadata"] = metadata;
  
  await db.write();
  await db.read();
}

async function updateSubmissionAddJudgeResults(rec12Id, results, score, scoresFull) {
  const rec = db.data.submissions.find((sub) => sub.rec12Id === rec12Id);
  rec["judgeResults"] = results;
  rec["judgeScoreFull"] = scoresFull;
  rec["judgeScore"] = score;
  rec["state"] = "PROCESSED";
  await db.write();
  await db.read();
}

// Function to delete an email entry by mailId
async function deleteRec(mailId) {
  const index = db.data.submissions.findIndex((sub) => sub.mailId === mailId);
  if (index >= 0) {
    db.data.submissions.splice(index, 1);
    db.write();
    db.read();
  }
}

export { loadDb, clearDB, purgeOldData, addSubmission, getAllSubmissions, getSubmission, getSubmissionYtUrl, updateSubmissionVidId, updateSubmissionAddJudgeResults, deleteRec, getEntriesByState, getEntriesByStates };