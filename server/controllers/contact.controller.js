import Contact from '../models/contact.model.js'
import errorHandler from './error.controller.js'

const create = async (req, res) => {
  try {
    const contact = new Contact({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      phone: req.body.phone,
      email: req.body.email,
      message: req.body.message
    })

    await contact.save()

    return res.status(201).json(contact)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const list = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({
      createdAt: -1
    })

    return res.status(200).json(contacts)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const contactByID = async (req, res, next, id) => {
  try {
    const contact = await Contact.findById(id)

    if (!contact) {
      return res.status(404).json({
        error: 'Contact not found'
      })
    }

    req.contact = contact
    next()
  } catch (err) {
    return res.status(400).json({
      error: 'Could not retrieve contact'
    })
  }
}

const read = (req, res) => {
  return res.status(200).json(req.contact)
}

const update = async (req, res) => {
  try {
    const contact = req.contact

    const fields = [
      'firstname',
      'lastname',
      'phone',
      'email',
      'message'
    ]

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        contact[field] = req.body[field]
      }
    })

    await contact.save()

    return res.status(200).json(contact)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const remove = async (req, res) => {
  try {
    await req.contact.deleteOne()

    return res.status(200).json({
      message: 'Contact deleted successfully!'
    })
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const removeAll = async (req, res) => {
  try {
    const result = await Contact.deleteMany({})

    return res.status(200).json({
      message: 'All contacts deleted successfully!',
      deletedCount: result.deletedCount
    })
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

export default {
  create,
  contactByID,
  read,
  list,
  remove,
  removeAll,
  update
}