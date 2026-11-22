import Qualification from '../models/qualification.model.js'
import errorHandler from './error.controller.js'

const create = async (req, res) => {
  try {
    const qualification = new Qualification({
      title: req.body.title,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      completion: req.body.completion,
      description: req.body.description
    })

    await qualification.save()

    return res.status(201).json(qualification)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const list = async (req, res) => {
  try {
    const qualifications = await Qualification.find().sort({
      createdAt: -1
    })

    return res.status(200).json(qualifications)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const qualificationByID = async (
  req,
  res,
  next,
  id
) => {
  try {
    const qualification =
      await Qualification.findById(id)

    if (!qualification) {
      return res.status(404).json({
        error: 'Qualification not found'
      })
    }

    req.qualification = qualification
    next()
  } catch (err) {
    return res.status(400).json({
      error: 'Could not retrieve qualification'
    })
  }
}

const read = (req, res) => {
  return res.status(200).json(
    req.qualification
  )
}

const update = async (req, res) => {
  try {
    const qualification = req.qualification

    const fields = [
      'title',
      'firstname',
      'lastname',
      'email',
      'completion',
      'description'
    ]

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        qualification[field] =
          req.body[field]
      }
    })

    await qualification.save()

    return res.status(200).json(
      qualification
    )
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const remove = async (req, res) => {
  try {
    await req.qualification.deleteOne()

    return res.status(200).json({
      message:
        'Qualification deleted successfully!'
    })
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const removeAll = async (req, res) => {
  try {
    const result =
      await Qualification.deleteMany({})

    return res.status(200).json({
      message:
        'All qualifications deleted successfully!',
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
  list,
  qualificationByID,
  read,
  update,
  remove,
  removeAll
}