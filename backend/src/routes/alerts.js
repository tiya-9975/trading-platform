// backend/src/routes/alerts.js
const express = require("express");
const auth = require("../middleware/auth");
const Alert = require("../models/Alert");
const { broadcastAlertTriggered } = require("../config/websocket");

const router = express.Router();

/* ------------------------------
   GET USER ALERTS
------------------------------ */
router.get("/", auth, async (req, res) => {
  try {
    const alerts = await Alert.find({ userId: req.userId }).sort({
      createdAt: -1,
    });

    res.json(alerts);
  } catch (error) {
    console.error("Get alerts error:", error);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

/* ------------------------------
   CREATE ALERT
------------------------------ */
router.post("/", auth, async (req, res) => {
  try {
    const { symbol, name, targetPrice, condition } = req.body;

    if (!symbol || !name || !targetPrice || !condition) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!["above", "below"].includes(condition)) {
      return res
        .status(400)
        .json({ error: 'Condition must be "above" or "below"' });
    }

    if (targetPrice <= 0) {
      return res
        .status(400)
        .json({ error: "Target price must be positive" });
    }

    const alert = new Alert({
      userId: req.userId,
      symbol,
      name,
      targetPrice,
      condition,
    });

    await alert.save();

    res.status(201).json(alert);
  } catch (error) {
    console.error("Create alert error:", error);
    res.status(500).json({ error: "Failed to create alert" });
  }
});

/* ------------------------------
   UPDATE ALERT
   - this is what gets called from frontend when it triggers
------------------------------ */
router.patch("/:id", auth, async (req, res) => {
  try {
    const { isActive, triggered } = req.body;

    const alert = await Alert.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!alert) {
      return res.status(404).json({ error: "Alert not found" });
    }

    // make sure triggered is a real boolean
    const triggeredBool = triggered === true || triggered === "true";

    if (isActive !== undefined) alert.isActive = isActive;
    if (triggered !== undefined) alert.triggered = triggeredBool;

    await alert.save();

    // 🔔 only broadcast when it was really triggered
    if (triggeredBool) {
      broadcastAlertTriggered(alert);
      console.log("📢 Alert broadcast sent!");
    }

    res.json(alert);
  } catch (error) {
    console.error("Update alert error:", error);
    res.status(500).json({ error: "Failed to update alert" });
  }
});

/* ------------------------------
   DELETE ALERT
------------------------------ */
router.delete("/:id", auth, async (req, res) => {
  try {
    const result = await Alert.deleteOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Alert not found" });
    }

    res.json({ message: "Alert deleted" });
  } catch (error) {
    console.error("Delete alert error:", error);
    res.status(500).json({ error: "Failed to delete alert" });
  }
});

/* ------------------------------
   ACTIVE ALERT COUNT
------------------------------ */
router.get("/count", auth, async (req, res) => {
  try {
    const count = await Alert.countDocuments({
      userId: req.userId,
      isActive: true,
      triggered: false,
    });

    res.json({ count });
  } catch (error) {
    console.error("Count alert error:", error);
    res.status(500).json({ error: "Failed to fetch alert count" });
  }
});

module.exports = router;
