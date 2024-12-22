//@ts-check
const router = require('express').Router();
module.exports = router;

const mongoose = require('mongoose');
const havePermission = require('../middlewire/havePermission');
const { Grant, resources } = require('../model/Grant');
const User = require('../model/User');
const verbose = require('debug')('verbose:app:routes:grant');

router.get('/', havePermission('grant', ['readAny']), async (req, res) => {
  try {
    const grants = await Grant.find();
    res.json(grants);
  } catch (error) {
    verbose(error);
    res.status(500).send();

  }
});

router.get('/roles',
  havePermission('grant', ['readAny']),
  async (req, res) => {
    try {
      const roles = await User.distinct('role');
      res.json(roles);
    } catch (error) {
      verbose(error);
      res.status(500).send();
    }
  }
);

router.post('/', havePermission('grant', ['createAny']), async (req, res) => {
  try {
    const { role, resource, action, possession, attributes } = req.body;
    const grant = await Grant.create({ role, resource, action, possession, attributes });
    res.status(201).send();
  } catch (error) {
    verbose(error);
    if (error.code === 11000) { // duplicate key
      return res.status(409).send();
    }
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).send({ message: error.message });
    }
    res.status(500).send();
  }
});

router.patch('/:id', havePermission('grant', ['updateAny']), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send();
    }
    const { role, resource, action, possession, attributes } = req.body;
    const update = res.locals.ac.updateAny('grant').filter({ role, resource, action, possession, attributes });

    const grant = await Grant.findByIdAndUpdate(id, update, { runValidators: true });
    if (!grant) {
      return res.status(404).send();
    }
    res.status(204).send();
  } catch (error) {
    verbose(error);
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).send({ message: error.message });
    }
    res.status(500).send();
  }
});

router.delete('/:id', havePermission('grant', ['deleteAny']), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send();
    }
    const grant = await Grant.findByIdAndDelete(id);
    if (!grant) {
      return res.status(404).send();
    }
    res.status(204).send();
  } catch (error) {
    verbose(error);
    res.status(500).send();
  }
});