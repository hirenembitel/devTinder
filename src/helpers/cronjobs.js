import cron from "node-cron";

//Run every day at midnight
cron.schedule('0 0 * * *', () => {
  const now = new Date().toLocaleString();
  console.log(`Daily cron job executed at: ${now}`);
});