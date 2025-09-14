import {
  createContact,
  deleteContact,
  getAllContacts,
  getContactById,
  updateContact,
} from '../services/contacts.js';
import createHttpError from 'http-errors';
import { authenticate } from '../middlewares/authenticate.js';
import { uploadToCloudinary } from '../services/cloudinary.js';
import { Contact } from '../models/contacts.js';

export const getContactsController = async (req, res) => {
  const contacts = await getAllContacts(req.query, req.user._id);
  res.json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const getContactByIdController = async (req, res) => {
  const { contactId } = req.params;

  const contact = await getContactById(contactId, req.user._id);

  if (!contact) {
    return res.status(404).json({ message: 'Contact not found' });
  }
  res.json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContactController = async (req, res, next) => {
  try {
    let photoUrl = null;
    if (req.file) {
      photoUrl = await uploadToCloudinary(req.file.buffer);
    }
    const body = { ...req.body, userId: req.user._id, photo: photoUrl };
    const contact = await Contact.create(body);
    res.status(201).json({
      status: 201,
      message: 'Successfully created a contact!',
      data: contact,
    });
  } catch (err) {
    next(err);
  }
};

export const updateContactController = async (req, res) => {
  const { contactId } = req.params;
  const contact = await updateContact(contactId, req.body, req.user._id);
  if (!contact) throw createHttpError(404, 'Contact not found');

  res.json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: contact,
  });
};

export const deleteContactController = async (req, res) => {
  const { contactId } = req.params;
  const contact = await deleteContact(contactId, req.user._id);

  if (!contact) throw createHttpError(404, 'Contact not found');

  res.status(204).send();
};
