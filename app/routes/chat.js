const router = require('express').Router();
module.exports = router;
const multer = require('../config/multer');
const havePermission = require('../middlewire/havePermission');
const Chat = require('../model/Chat');
const User = require('../model/User');
const debug = require('debug')('app:routes:chat');


// Get all chats
router.get('/',
    havePermission('chat', ['readOwn'],),
    async (req, res, next) => {
        try {
            const canReadAny = res.locals.ac.readAny();
            const query = {};

            if (!canReadAny.granted) {
                const user = req.user;
                query.$or = [
                    { users: user._id },
                    { 'broadcast': user.role },
                    { users: user._id, type: 'system' }
                ];
            }


            const chats = await Chat.find(query)
                .populate('users messages.user', ['name', 'profilePic', 'id'])
                // sort by broadcast, system, and then by last message
                .sort({ broadcast: -1, type: -1, updatedAt: -1 });
            res.send(chats);
        } catch (error) {
            debug(error);
            next(error);
        }
    }
);

// Get chat between two users
router.get('/user/:id',
    havePermission('chat', ['readOwn'],),
    async (req, res) => {
        try {
            const canReadAny = res.locals.ac.readAny();
            const query = {};
            if (!canReadAny.granted) query.users = { $all: [req.user._id, req.params.id] };
            else query.users = req.params.id;
            const chat = await Chat.findOne(query).populate('users', ['name', 'profilePic',]);
            res.send(chat);
            // debug(chat);
        } catch (error) {
            debug(error);
            next(error);
        }
    }
);

router.use('/file', multer.static('chat'));
