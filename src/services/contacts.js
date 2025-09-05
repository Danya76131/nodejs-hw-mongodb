import { Contact } from '../models/contacts.js';

export const getAllContacts = async () => {
  return Contact.find();
};

export const getContactById = async (id) => {
  return Contact.findById(id);
};

export const createContact = (data) => {
  return Contact.create(data);
};

export const updateContact = (id, data) => {
  return Contact.findByIdAndUpdate(id, data, { new: true });
};

export const deleteContact = (id) => {
  return Contact.findByIdAndDelete(id);
};
