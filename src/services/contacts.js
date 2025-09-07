import { Contact } from '../models/contacts.js';

export const getAllContacts = async (query) => {
  const {
    page = 1,
    perPage = 10,
    sortBy = 'name',
    sortOrder = 'asc',
    type,
    isFavourite,
  } = query;
  const pageNum = Number(page);
  const perPageNum = Number(perPage);
  const skip = (pageNum - 1) * perPageNum;
  const sortOption = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  //FILTER
  const filter = {};
  if (type) filter.contactType = type;
  if (isFavourite !== undefined) filter.isFavourite = isFavourite === 'true';
  //END FILTER
  const totalItems = await Contact.countDocuments(filter);

  const contacts = await Contact.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(Number(perPage));
  const totalPages = Math.ceil(totalItems / perPage);

  return {
    data: contacts,
    page: pageNum,
    perPage: perPageNum,
    totalItems,
    totalPages,
    hasPreviousPage: Number(page) > 1,
    hasNextPage: Number(page) < totalPages,
  };
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
