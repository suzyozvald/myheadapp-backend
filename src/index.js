import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connect from "./db.js";
import auth from "./auth";

import { ObjectId } from "mongodb";

const app = express(); // instanciranje aplikacije
const port = 3000; // port na kojem će web server slušati

app.use(cors());
app.use(express.json()); // automatski dekodiraj JSON poruke

app.patch("/user", async (req, res) => {
  let changes = req.body;
  if (changes.new_password && changes.old_password) {
    let result = await auth.changeUserPassword(
      req.jwt.username,
      changes.old_password,
      changes.new_password
    );
    if (result) {
      res.status(201).send();
    } else {
      res.status(500).json({ error: "Cannot change password!" });
    }
  } else {
    res.status(400).json({ error: "Unrecognized request!" });
  }
});

app.post("/auth", async (req, res) => {
  let user = req.body;
  let username = user.username;
  let password = user.password;

  try {
    let result = await auth.authenticateUser(username, password);
    res.status(201).json(result);
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
});

app.post("/user", async (req, res) => {
  let user = req.body;

  try {
    let result = await auth.registerUser(user);
    res.status(201).send(result);
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
});

app.get("/pain-diary/:userId", async (req, res) => {
  let userId = req.params.userId;
  let db = await connect();
  let cursor = await db
    .collection("PainDiary")
    .find({ userId: ObjectId(userId) });
  let results = await cursor.toArray();

  res.json(results);
});

app.post("/pain-diary", async (req, res) => {
  let db = await connect();
  let doc = req.body.headpain;
  let strUserId = doc.userId;
  doc.userId = ObjectId(strUserId);
  let result = await db.collection("PainDiary").insertOne(doc);

  if (result.acknowledged == true) {
    res.json({
      status: "success",
      id: result.insertedId,
    });
  } else {
    res.json({
      status: "fail",
    });
  }
});

app.patch("/pain-diary", async (req, res) => {
  let db = await connect();
  let doc = req.body.headpain;

  let find = { _id: ObjectId(doc._id), userId: ObjectId(doc.userId) };
  let newData = {
    $set: {
      startDate: doc.startDate,
      startTime: doc.startTime,
      endDate: doc.endDate,
      endTime: doc.endTime,
      painStrength: doc.painStrength,
      painPosition: doc.painPosition,
      painReason: doc.painReason,
      painSimptoms: doc.painSimptoms,
      dailyActivityImpact: doc.dailyActivityImpact,
      medicationFrequency: doc.medicationFrequency,
    },
  };

  let result = await db.collection("PainDiary").updateOne(find, newData);

  if (result.modifiedCount == 1) {
    res.json({
      status: "success",
    });
  } else {
    res.json({
      status: "fail",
    });
  }
});

app.delete("/pain-diary/:userId/item/:itemId", async (req, res) => {
  let db = await connect();
  let userId = req.params.userId;
  let itemId = req.params.itemId;

  let result = await db
    .collection("PainDiary")
    .deleteOne({ _id: ObjectId(itemId) }, { userId: ObjectId(userId) });

  if (result.deletedCount == 1) {
    res.status(200).send();
  } else {
    res.status(500).json({
      status: "fail",
    });
  }
});

app.listen(port, () => console.log(`Slušam na portu ${port}!`));
