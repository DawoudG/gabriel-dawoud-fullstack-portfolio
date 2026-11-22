import Project from '../models/project.model.js'
import errorHandler from './error.controller.js'

const create = async (req, res) => {
  try {
    const project = new Project({
      title: req.body.title,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      completion: req.body.completion,
      description: req.body.description
    })

    await project.save()

    return res.status(201).json(project)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const list = async (req, res) => {
  try {
    const projects = await Project.find().sort({
      createdAt: -1
    })

    return res.status(200).json(projects)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const projectByID = async (req, res, next, id) => {
  try {
    const project = await Project.findById(id)

    if (!project) {
      return res.status(404).json({
        error: 'Project not found'
      })
    }

    req.project = project
    next()
  } catch (err) {
    return res.status(400).json({
      error: 'Could not retrieve project'
    })
  }
}

const read = (req, res) => {
  return res.status(200).json(req.project)
}

const update = async (req, res) => {
  try {
    const project = req.project

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
        project[field] = req.body[field]
      }
    })

    await project.save()

    return res.status(200).json(project)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const remove = async (req, res) => {
  try {
    await req.project.deleteOne()

    return res.status(200).json({
      message: 'Project deleted successfully!'
    })
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const removeAll = async (req, res) => {
  try {
    const result = await Project.deleteMany({})

    return res.status(200).json({
      message: 'All projects deleted successfully!',
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
  projectByID,
  read,
  update,
  remove,
  removeAll
}