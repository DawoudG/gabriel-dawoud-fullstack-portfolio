import mongoose from 'mongoose'

const QualificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  firstname: {
    type: String,
    required: true,
    trim: true
  },
  lastname: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  completion: {
    type: Date
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

export default mongoose.model(
  'Qualification',
  QualificationSchema
)