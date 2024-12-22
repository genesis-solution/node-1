const { Server } = require("socket.io");
const User = require("../model/User");
const Chat = require("../model/Chat");
const jwt = require('../utils/jwt');
require('dotenv').config();
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS.split(',').filter(Boolean);
const debug = require('debug')('app:socket');
const ObjectId = require('mongoose').Types.ObjectId;

const fs = require('fs/promises');
const multer = require('../config/multer');
const messageService = require("../service/mail/message");



function middlewire(socket, next) {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Unauthorized"));
    const user = jwt.verify(token);
    if (!user) return next(new Error("Unauthorized"));
    socket.user = user;
    // console.log(user);
    next();
}

const PATH = 'chat';

/**
 * 
 * @param {import('http').Server} server 
 */
module.exports = function (server) {
    const io = new Server(server, { cors: { origin: ALLOWED_ORIGINS } });
    io.use(middlewire);
    io.on("connection", (socket) => {
        socket.on("connection", async () => {
            try {
                const id = socket.user?.id;
                debug(id, "connected");
                if (!id) return;
                const user = await User.findByIdAndUpdate(id, { chatID: socket.id });
                io.to(socket.id).emit("connection", user);
                const chats = await Chat
                    .find({ users: id })
                    .populate("users", ["chatID", '_id'], null, {});

                chats.forEach(
                    chat => chat.users
                        .filter(u => u.chatID && u._id.toString() !== id.toString())
                        .forEach(u => socket.to(u.chatID).emit('online', { chat: chat._id, user: id }))
                );
            } catch (error) {
                debug("Error in connection", error);
            }
        });

        socket.on("disconnect", async () => {
            try {
                const id = socket.user.id;
                debug(id, "disconnected");
            } catch (error) {
                debug("Error in disconnect", error);
            }
        });

        socket.on("sendMessage", async ({ chat, message }) => {
            try {
                debug({ chat, message });
                if (!chat || !message) return;
                const from = socket.user.id;
                const fromUser = await User.findById(from).select("profilePic name id chatID _id");
                const _chat = await Chat.findById(chat);
                const to = _chat ? null : await User.exists({ _id: chat });
                if (!_chat && !to) return;
                debug({ _chat: _chat?._id });

                const query = {};
                const update = {};

                if (_chat) {
                    query._id = chat;
                    update.$push = {
                        messages: {
                            user: from,
                            message
                        }
                    };
                } else {
                    query.users = {
                        $all: [
                            { $elemMatch: { $eq: new ObjectId(to._id) } },
                            { $elemMatch: { $eq: new ObjectId(from) } },
                        ]
                    };
                    update.$set = {
                        users: [from, to._id]
                    };
                    update.$push = {
                        messages: {
                            user: from,
                            message
                        }
                    };
                }
                debug({ query, update });
                const isNotNew = await Chat.exists(query);
                debug({ isNotNew });

                const updatedChat = await Chat.findOneAndUpdate(
                    query,
                    update,
                    { upsert: true, new: true, }
                )
                    .select("users")
                    .populate("users", ["chatID", '_id', 'name', 'profilePic', 'id', 'email']);
                debug({ updatedChat: updatedChat._id });
                // .select("users")
                // .populate("users", ["chatID", '_id', 'name', 'profilePic']);
                // if chat is new then send notification to toUser
                if (!isNotNew) {
                    updatedChat.users
                    .filter(f => f._id.toString() != from)
                    .forEach(e => {
                        messageService.send(e.email);
                    });
                    updatedChat.users
                        .filter(u => u.chatID)
                        .forEach(u => socket.to(u.chatID).emit('UpdateNewChat', { chat: updatedChat }));
                    debug("New Chat");
                }

                // send ack to all users
                updatedChat.users.forEach(
                    u => io.to(u.chatID).emit("UpdateNewMessage", { chat: { _id: updatedChat._id, type: 'private', }, user: fromUser, message, createdAt: new Date() })
                );

            } catch (error) {
                debug("Error in sendMessage", error);
            }

        });

        socket.on("sendSystemMessage", async ({ chat, message, file: { buffer, filename, type } }) => {
            try {
                if (!chat || !message) return;
                const file = buffer && filename ? await multer.save({ buffer, filename, path: PATH }) : undefined;

                const from = socket.user.id;
                const _chat = await Chat.findById(chat);
                const to = _chat ? null : await User.exists({ _id: chat });
                if (!_chat && !to) return;
                debug({ _chat: _chat?._id });

                const query = {};
                const update = {};

                if (_chat) {
                    query._id = chat;
                    update.$push = {
                        messages: {
                            user: from,
                            message,
                            type,
                            file,
                        }
                    };
                } else {
                    query.users = to._id;
                    query.type = 'system';


                    update.$set = {
                        users: [to._id],
                        type: 'system',
                    };

                    update.$push = {
                        messages: {
                            user: from,
                            message,
                            type,
                            file,
                        },
                    };

                }
                debug({ query, update });
                const isNotNew = await Chat.exists(query);
                debug({ isNotNew });

                const updatedChat = await Chat.findOneAndUpdate(
                    query,
                    update,
                    { upsert: true, new: true, }
                )
                    .select({ messages: 0 })
                    .populate("users", ["chatID", '_id', 'name', 'profilePic', 'id']);
                debug({ updatedChat: updatedChat });
                // .select("users")
                // .populate("users", ["chatID", '_id', 'name', 'profilePic']);
                // if chat is new then send notification to toUser
                if (!isNotNew) {
                    updatedChat.users
                        .filter(f => f._id.toString() != from)
                        .forEach(e => {
                            messageService.send(e.email);
                        });
                    updatedChat.users
                        .filter(u => u.chatID)
                        .forEach(u => socket.to(u.chatID).emit('UpdateNewChat', { chat: updatedChat }));
                    debug("New Chat");
                }
                if (!isNotNew) {
                    updatedChat.messages = [];
                    updatedChat.users
                        .filter(u => u.chatID)
                        .forEach(u => socket.to(u.chatID).emit('UpdateNewChat', { chat: updatedChat, replace: chat }));
                    debug("New Chat");
                    io.to(socket.id).emit('UpdateNewChat', { chat: updatedChat, replace: chat });
                }

                // send ack to all users
                const ack = { chat: { _id: updatedChat._id, type: 'system' }, user: from, message, type, file };
                if (to) ack.chat.replace = chat;
                updatedChat.users.forEach(
                    u => io.to(u.chatID).emit("UpdateNewMessage", ack)
                );
                io.to(socket.id).emit("UpdateNewMessage", ack);


            } catch (error) {
                debug("Error in sendMessage", error);
            }

        });

        socket.on("sendBroadcastMessage", async ({ chat: role, message, file: { buffer, filename, type } }) => {
            debug({ role, message, file: { buffer, filename, type } });
            if (!role || !message) return;
            const file = buffer && filename ? await multer.save({ buffer, filename, path: PATH }) : undefined;
            const from = socket.user.id;
            const chat = await Chat.findOneAndUpdate(
                { broadcast: role },
                {
                    type: 'broadcast',
                    $push: {
                        messages: {
                            user: from,
                            message,
                            type,
                            file,
                        }
                    }
                },
                { upsert: true, new: true }
            )
                .select("users")
                .populate("users", ["chatID", '_id', 'name', 'profilePic', 'id']);
            debug({ chat: chat._id });
            // send ack to all users
            ack = { chat: { _id: role, type: 'broadcast' }, user: from, message, type, file };
            io.to(socket.id).emit("UpdateNewMessage", ack);
            io.to(role).emit("UpdateNewMessage", ack);
        });


    });

};