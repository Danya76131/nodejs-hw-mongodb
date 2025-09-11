import { Contact } from '../models/contacts.js';

// отримати всі контакти конкретного користувача з пагінацією, сортуванням, фільтром
export const getAllContacts = async (query, userId) => {
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

  // FILTER
  const filter = { userId };
  if (type) filter.contactType = type;
  if (isFavourite !== undefined) filter.isFavourite = isFavourite === 'true';

  const totalItems = await Contact.countDocuments(filter);

  const contacts = await Contact.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(perPageNum);

  const totalPages = Math.ceil(totalItems / perPageNum);

  return {
    data: contacts,
    page: pageNum,
    perPage: perPageNum,
    totalItems,
    totalPages,
    hasPreviousPage: pageNum > 1,
    hasNextPage: pageNum < totalPages,
  };
};

export const getContactById = async (id, userId) => {
  return Contact.findOne({ _id: id, userId });
};

export const createContact = (data) => {
  return Contact.create(data);
};

export const updateContact = async (id, data, userId) => {
  return Contact.findOneAndUpdate({ _id: id, userId }, data, { new: true });
};

export const deleteContact = async (id, userId) => {
  return Contact.findOneAndDelete({ _id: id, userId });
};
