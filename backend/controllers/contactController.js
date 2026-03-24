import ContactMessage from "../models/ContactMessage.js";

// @route   POST /api/contact
// @desc    Create a new contact message
// @access  Public
export async function createContactMessage(req, res) {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: "Please provide name, email, subject, and message.",
      });
    }

    const createdMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message,
    });

    return res.status(201).json({
      message: "Your message has been sent to admin.",
      data: createdMessage,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
}

// @route   GET /api/contact
// @desc    Get all contact messages
// @access  Private/Admin
export async function getAllContactMessages(req, res) {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });

    return res.status(200).json({
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
}

// @route   GET /api/contact/:id
// @desc    Get a single contact message
// @access  Private/Admin
export async function getContactMessageById(req, res) {
  try {
    const { id } = req.params;
    const message = await ContactMessage.findById(id);

    if (!message) {
      return res.status(404).json({ message: "Contact message not found." });
    }

    return res.status(200).json({ data: message });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
}

// @route   PUT /api/contact/:id
// @desc    Update a contact message
// @access  Private/Admin
export async function updateContactMessage(req, res) {
  try {
    const { id } = req.params;
    const { status, subject, message } = req.body;

    const existing = await ContactMessage.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Contact message not found." });
    }

    if (status) existing.status = status;
    if (subject) existing.subject = subject;
    if (message) existing.message = message;

    await existing.save();

    return res.status(200).json({
      message: "Contact message updated successfully.",
      data: existing,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
}

// @route   PUT /api/contact/:id/reply
// @desc    Reply to a contact message
// @access  Private/Admin
export async function replyContactMessage(req, res) {
  try {
    const { id } = req.params;
    const { adminReply } = req.body;

    if (!adminReply || !adminReply.trim()) {
      return res.status(400).json({ message: "Reply message is required." });
    }

    const existing = await ContactMessage.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Contact message not found." });
    }

    existing.adminReply = adminReply.trim();
    existing.repliedAt = new Date();
    existing.status = "replied";

    await existing.save();

    return res.status(200).json({
      message: "Reply saved successfully.",
      data: existing,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
}

// @route   DELETE /api/contact/:id
// @desc    Delete a contact message
// @access  Private/Admin
export async function deleteContactMessage(req, res) {
  try {
    const { id } = req.params;

    const deleted = await ContactMessage.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Contact message not found." });
    }

    return res.status(200).json({
      message: "Contact message deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
}
