import app from "./app.js";
import connectDB from "./config/db.js";
import { ensureAdminAccount } from "./createAdmin.js";

const PORT = process.env.PORT || 5000;

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`QueueLess API running on port ${PORT}`);
  });

  connectDB()
    .then(() => ensureAdminAccount())
    .catch((err) => {
      console.error("Database initialization error:", err.message);
    });
};

startServer();