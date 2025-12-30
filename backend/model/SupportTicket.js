const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema({
    userId: { type: Number, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    category: {
        type: String,
        enum: ["automation", "billing", "security", "bug", "other"],
        default: "other"
    },
    message: { type: String, required: true },
    status: {
        type: String,
        enum: ["open", "pending", "resolved", "closed"],
        default: "open"
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SupportTicket", supportTicketSchema, "support_tickets");
