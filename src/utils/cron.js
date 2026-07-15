const cron = require("node-cron");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const ConnectionRequstModel = require("../models/connectionRequest");
const sendEmail = require("../utils/ses_sendemail");

cron.schedule("18 23 * * *", async () => {
  //send  eamil to all the users who got request the previous day
  const yesterday = subDays(new Date(), 1);
  const yesterdayStart = startOfDay(yesterday);
  const yesterdayEnd = endOfDay(yesterday);

  try {
    const pendingRequests = await ConnectionRequstModel.find({
      status: "interested",
      createdAt: {
        $gt: yesterdayStart,
        $lt: yesterdayEnd,
      },
    }).populate("fromUserId toUserId");

    const listOfEmails = [
      ...new Set(pendingRequests.map((req) => req.toUserId.emailId)),
    ];

    console.log(listOfEmails);
    for (const email of listOfEmails) {
      try {
        const res = await sendEmail.run(
          "New Friend request pending for " + email,
          "There are so many friend requests,  please login to devtinder.in and accept or ignore the requests",
        );
        console.log(res);
      } catch (err) {
        console.error(err);
      }
    }
  } catch (err) {
    console.error(err);
  }
});
