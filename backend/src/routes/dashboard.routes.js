const express = require("express");
const Item = require("../models/Item");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const formatYMD = (date) => {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const itemValue = (item) =>
  (Number(item.quantity) || 0) * (Number(item.pricePerUnit) || 0);

const sumValue = (items) => items.reduce((sum, item) => sum + itemValue(item), 0);

const pct = (current, previous) => {
  if (!previous && !current) return "0.0%";
  if (!previous) return "100.0%";
  return `${(((current - previous) / previous) * 100).toFixed(1)}%`;
};

// Personalized dashboard summary from stored items
router.get("/summary", authMiddleware, async (req, res) => {
  try {
    const items = await Item.find({ userId: req.userId }).lean();
    const now = new Date();
    const todayStart = startOfDay(now);
    const in7DaysEnd = endOfDay(new Date(todayStart.getTime() + 6 * DAY_MS));

    const weekStart = startOfDay(new Date(now));
    const dayOfWeek = weekStart.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    weekStart.setDate(weekStart.getDate() + mondayOffset);
    const weekEnd = endOfDay(new Date(weekStart.getTime() + 6 * DAY_MS));

    const prevWeekStart = startOfDay(new Date(weekStart.getTime() - 7 * DAY_MS));
    const prevWeekEnd = endOfDay(new Date(weekEnd.getTime() - 7 * DAY_MS));

    const currentWeekAddedItems = items.filter((item) => {
      const createdAt = new Date(item.createdAt || item.importedAt || now);
      return createdAt >= weekStart && createdAt <= weekEnd;
    });
    const previousWeekAddedItems = items.filter((item) => {
      const createdAt = new Date(item.createdAt || item.importedAt || now);
      return createdAt >= prevWeekStart && createdAt <= prevWeekEnd;
    });

    const currentWeekLossItems = items.filter((item) => {
      const expiry = new Date(item.expiryDate);
      return expiry <= now && expiry >= weekStart && expiry <= weekEnd;
    });
    const previousWeekLossItems = items.filter((item) => {
      const expiry = new Date(item.expiryDate);
      return expiry <= now && expiry >= prevWeekStart && expiry <= prevWeekEnd;
    });

    const currentWeekAdded = sumValue(currentWeekAddedItems);
    const previousWeekAdded = sumValue(previousWeekAddedItems);
    const currentWeekLoss = sumValue(currentWeekLossItems);
    const previousWeekLoss = sumValue(previousWeekLossItems);
    const currentWeekNetSavings = currentWeekAdded - currentWeekLoss;
    const previousWeekNetSavings = previousWeekAdded - previousWeekLoss;

    const weekByDay = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
      (day, i) => {
        const dayStart = startOfDay(new Date(weekStart.getTime() + i * DAY_MS));
        const dayEnd = endOfDay(dayStart);
        const exp = items.filter((item) => {
          const expiry = new Date(item.expiryDate);
          return expiry >= dayStart && expiry <= dayEnd;
        }).length;
        const used = items.filter((item) => {
          if (!item.used) return false;
          const changed = new Date(item.updatedAt || item.createdAt || now);
          return changed >= dayStart && changed <= dayEnd;
        }).length;
        const status = exp >= 2 ? "red" : exp === 1 ? "yellow" : "green";
        return { day, exp, used, status };
      }
    );

    const expiringItems = items
      .filter((item) => {
        const expiry = new Date(item.expiryDate);
        return expiry >= todayStart && expiry <= in7DaysEnd;
      })
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
      .slice(0, 5)
      .map((item) => {
        const expiry = new Date(item.expiryDate);
        const daysLeft = Math.max(0, Math.ceil((expiry - todayStart) / DAY_MS));
        return {
          id: item._id,
          name: item.name,
          expiry: formatYMD(expiry),
          daysLeft,
          qty: `${item.quantity || 1} ${item.quantity > 1 ? "units" : "unit"}`,
        };
      });

    return res.json({
      totalSpent: sumValue(items),
      itemCount: items.length,
      updatedAt: now.toISOString(),
      weeklySavings: currentWeekNetSavings,
      weeklySavingsChange: pct(currentWeekNetSavings, previousWeekNetSavings),
      weeklyLoss: currentWeekLoss,
      weeklyLossChange: pct(currentWeekLoss, previousWeekLoss),
      weekAtGlance: weekByDay,
      expiringItems,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch dashboard summary" });
  }
});

module.exports = router;
