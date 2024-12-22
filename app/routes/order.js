const { param, query } = require("express-validator");
const havePermission = require("../middlewire/havePermission");
const debug = require("debug")("app:routes:order");
const Order = require("../model/Order");
const router = require("express").Router();
const paginations = require("../utils/paginations");
const UserDetails = require("../model/UserDetails");
const reportExpressValidator = require("../middlewire/reportExpressValidator");
const multer = require("../config/multer");
const groupBy = require("lodash.groupby");
const Payout = require("../model/Payout");
const Ledger = require("../model/Ledger");
const checkout = require("../controller/checkout");
module.exports = router;

const SERVICE_FEE = 0.1;

router.get(
  "/",
  havePermission("order", ["readOwn"]),
  query("user").optional().isMongoId().withMessage("Invalid user id"),
  reportExpressValidator,
  async (req, res, next) => {
    try {
      const readAny = res.locals.ac.readAny();
      const readOwn = res.locals.ac.readOwn();
      const user = readAny.granted ? req.query.user : req.user._id;

      const query = {};
      if (user) {
        query.$or = [{ user: user }, { "products.owner": user }];
      }
      const status = ["confirmed", "cancelled", "out of stock"];
      if (readAny.granted) {
        status.push("payment required", "pending", "processing", "failed");
      }
      query.status = { $in: status };

      // delete req.query.product;
      delete req.query.user;

      await paginations.paginateWithMaterialReactTable({
        req,
        filter: (_q) => ({ ..._q, ...query }),
        total: (_query) => Order.countDocuments(_query),
        handler: async ({ skip, limit }, extra, { sorting, query }) => {
          const _query = Order.find(query).skip(skip).limit(limit);
          if (sorting) {
            _query.sort(sorting);
          }
          _query.populate("user", "name email id ");
          _query.populate({
            path: "products.product",
            select: "name price location description images id",
          });
          _query.populate({
            path: "products.owner",
            select: "name email id",
          });

          const orders = await _query;
          const filtered = readOwn.filter(JSON.parse(JSON.stringify(orders)));
          res.json({
            ...extra,
            data: filtered,
          });
        },
      });
    } catch (error) {
      debug(error);
      next(error);
    }
  }
);

router.get(
  "/invoice/:id",
  havePermission("order", ["readOwn"]),
  param("id").isMongoId().withMessage("Invalid order id"),
  reportExpressValidator,
  async (req, res, next) => {
    try {
      const canReadAny = res.locals.ac.readAny().granted;
      const id = req.params.id;
      const query = canReadAny ? { _id: id } : { user: req.user._id, _id: id };
      const order = await Order.findOne(query)
        .populate("user", "name email")
        .populate({
          path: "products.product",
          select: "name price id location",
        })
        .populate({
          path: "products.owner",
          select: "name email id",
        });
      if (!order) {
        return res.status(404).send("Not found");
      }
      res.download(multer.resolvePath("invoices", id), "invoice.pdf");
    } catch (error) {
      debug(error);
      next(error);
    }
  }
);

router.patch(
  "/:id",
  havePermission("order", ["updateAny"]),
  param("id").isMongoId().withMessage("Invalid order id"),
  query("status")
    .optional()
    .isIn(["confirmed", "cancelled", "out of stock"])
    .withMessage("Invalid status"),
  reportExpressValidator,
  async (req, res, next) => {
    try {
      const id = req.params.id;
      const updateAny = res.locals.ac.updateAny();
      const data = updateAny.filter(req.body);
      if (data.guests) {
        data["products.$[].guests"] = data.guests; //
        delete data.guests;
      }
      const order = await Order.findByIdAndUpdate(id, data, { new: true })
        .populate("products.product")
        .populate("products.owner")
        .populate("user");
      if (!order) {
        return res.status(404).send();
      }
      res.json(order);
      if (
        order.status === "confirmed" &&
        order.transection.status === "completed"
      ) {
        await checkout.onAfterPaymentSuccess(order, res);
      }
    } catch (error) {
      debug(error);
      next(error);
    }
  }
);
