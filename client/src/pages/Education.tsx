import {
  useEffect,
  useState,
  type FormEvent,
  type ChangeEvent
} from 'react';

import { API_URL, getAuth } from '../lib/auth';

type Qualification = {
  id: string;
  program: string;
  institution: string;
  dates: string;
  status: string;
  expectedGraduation: string;
  relevantCourses: string[];
};

type DatabaseQualification = {
  _id: string;
  title: string;
  firstname: string;
  lastname: string;
  email: string;
  completion?: string;
  description?: string;
};

type QualificationForm = {
  title: string;
  firstname: string;
  lastname: string;
  email: string;
  completion: string;
  description: string;
};

const QUALIFICATIONS: Qualification[] = [
  {
    id: 'centennial-college',
    program:
      'Software Engineering Technology – Artificial Intelligence (Co-op)',
    institution: 'Centennial College',
    dates: '2025 – Present',
    status: 'Year 2, Semester 3',
    expectedGraduation: 'April 2028',
    relevantCourses: [
      'AI Systems Design',
      'Introduction to AI',
      'Java Programming',
      'Programming 2',
      'Introduction to Database Concepts',
      'Web Application Development'
    ]
  }
];

const emptyForm: QualificationForm = {
  title: '',
  firstname: '',
  lastname: '',
  email: '',
  completion: '',
  description: ''
};

export default function Education() {
  const auth = getAuth();
  const isAdmin = auth?.user.role === 'admin';

  const [
    databaseQualifications,
    setDatabaseQualifications
  ] = useState<DatabaseQualification[]>([]);

  const [form, setForm] =
    useState<QualificationForm>(emptyForm);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadQualifications = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/qualifications`
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
          'Unable to load qualifications'
        );
        return;
      }

      setDatabaseQualifications(data);
    } catch {
      setError(
        'Unable to connect to the server'
      );
    }
  };

  useEffect(() => {
    loadQualifications();
  }, []);

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    setForm({
      ...form,
      [event.target.name]:
        event.target.value
    });
  };

  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (!auth || !isAdmin) {
      return;
    }

    setError('');
    setMessage('');

    const url = editingId
      ? `${API_URL}/api/qualifications/${editingId}`
      : `${API_URL}/api/qualifications`;

    const method = editingId
      ? 'PUT'
      : 'POST';

    try {
      const response = await fetch(
        url,
        {
          method,
          headers: {
            'Content-Type':
              'application/json',
            Authorization:
              `Bearer ${auth.token}`
          },
          body: JSON.stringify(form)
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
          'Unable to save qualification'
        );
        return;
      }

      setMessage(
        editingId
          ? 'Qualification updated successfully.'
          : 'Qualification created successfully.'
      );

      setForm(emptyForm);
      setEditingId(null);

      await loadQualifications();
    } catch {
      setError(
        'Unable to connect to the server'
      );
    }
  };

  const handleEdit = (
    qualification: DatabaseQualification
  ) => {
    setEditingId(
      qualification._id
    );

    setForm({
      title: qualification.title,
      firstname:
        qualification.firstname,
      lastname:
        qualification.lastname,
      email:
        qualification.email,
      completion:
        qualification.completion
          ? qualification.completion.substring(
              0,
              10
            )
          : '',
      description:
        qualification.description || ''
    });

    setError('');
    setMessage('');

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  };

  const handleDelete = async (
    qualificationId: string
  ) => {
    if (!auth || !isAdmin) {
      return;
    }

    const confirmed =
      window.confirm(
        'Are you sure you want to delete this qualification?'
      );

    if (!confirmed) {
      return;
    }

    try {
      const response =
        await fetch(
          `${API_URL}/api/qualifications/${qualificationId}`,
          {
            method: 'DELETE',
            headers: {
              Authorization:
                `Bearer ${auth.token}`
            }
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
          'Unable to delete qualification'
        );
        return;
      }

      setMessage(
        'Qualification deleted successfully.'
      );

      await loadQualifications();
    } catch {
      setError(
        'Unable to connect to the server'
      );
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setMessage('');
  };

  return (
    <section>
      <h1 className="section-title">
        Education
      </h1>

      <p className="lead">
        My current program and relevant
        coursework.
      </p>

      <div className="mt-6 grid gap-4">
        {QUALIFICATIONS.map(
          (item) => (
            <article
              key={item.id}
              className="card education-card grid gap-5 items-start grid-cols-1 sm:grid-cols-[140px_1fr]"
            >
              <div className="font-bold text-accent text-[1.05rem]">
                {item.dates}
              </div>

              <div>
                <h3 className="mb-1">
                  {item.institution}
                </h3>

                <p className="text-text mb-1">
                  {item.program}
                </p>

                <p className="mb-0">
                  {item.status}
                </p>

                <p className="mb-0">
                  <span className="text-text font-semibold">
                    Expected Graduation:{' '}
                  </span>
                  {
                    item.expectedGraduation
                  }
                </p>

                <h4 className="mt-4 mb-2 text-text">
                  Relevant Courses
                </h4>

                <ul className="list-disc pl-5 m-0 grid gap-1.5 text-text leading-relaxed sm:grid-cols-2">
                  {item.relevantCourses.map(
                    (course) => (
                      <li
                        key={course}
                        className="pl-1"
                      >
                        {course}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </article>
          )
        )}
      </div>

      <div className="mt-14">
        <h2 className="section-title">
          Education Database
        </h2>

        <p className="lead">
          Qualifications loaded from the
          MongoDB backend API.
        </p>

        {error && (
          <p className="text-red-400 mt-4">
            {error}
          </p>
        )}

        {message && (
          <p className="text-green-400 mt-4">
            {message}
          </p>
        )}

        <div className="grid gap-5 mt-6 grid-cols-1 md:grid-cols-2">
          {databaseQualifications.map(
            (qualification) => (
              <article
                key={
                  qualification._id
                }
                className="card flex flex-col gap-2"
              >
                <h3 className="text-xl font-bold">
                  {
                    qualification.title
                  }
                </h3>

                <p>
                  {qualification.description ||
                    'No description provided.'}
                </p>

                <p>
                  <strong>
                    Created by:
                  </strong>{' '}
                  {
                    qualification.firstname
                  }{' '}
                  {
                    qualification.lastname
                  }
                </p>

                <p>
                  <strong>Email:</strong>{' '}
                  {qualification.email}
                </p>

                {qualification.completion && (
                  <p>
                    <strong>
                      Completion:
                    </strong>{' '}
                    {qualification.completion.substring(
                      0,
                      10
                    )}
                  </p>
                )}

                {isAdmin && (
                  <div className="flex gap-3 mt-3">
                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(
                          qualification
                        )
                      }
                      className="px-4 py-2 rounded-lg bg-accent text-bg font-semibold cursor-pointer"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          qualification._id
                        )
                      }
                      className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </article>
            )
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="mt-14 max-w-2xl">
          <div className="card">
            <h2 className="text-3xl font-bold mb-2">
              {editingId
                ? 'Edit Qualification'
                : 'Add Qualification'}
            </h2>

            <p className="text-muted mb-6">
              Admin Education Management
            </p>

            <form
              onSubmit={
                handleSubmit
              }
              className="flex flex-col gap-4"
            >
              <input
                name="title"
                type="text"
                placeholder="Qualification Title"
                required
                value={form.title}
                onChange={
                  handleChange
                }
                className="w-full px-4 py-3 rounded-lg border border-border bg-bg text-text"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="firstname"
                  type="text"
                  placeholder="First Name"
                  required
                  value={
                    form.firstname
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full px-4 py-3 rounded-lg border border-border bg-bg text-text"
                />

                <input
                  name="lastname"
                  type="text"
                  placeholder="Last Name"
                  required
                  value={
                    form.lastname
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full px-4 py-3 rounded-lg border border-border bg-bg text-text"
                />
              </div>

              <input
                name="email"
                type="email"
                placeholder="Email"
                required
                value={form.email}
                onChange={
                  handleChange
                }
                className="w-full px-4 py-3 rounded-lg border border-border bg-bg text-text"
              />

              <input
                name="completion"
                type="date"
                value={
                  form.completion
                }
                onChange={
                  handleChange
                }
                className="w-full px-4 py-3 rounded-lg border border-border bg-bg text-text"
              />

              <textarea
                name="description"
                placeholder="Qualification Description"
                rows={5}
                value={
                  form.description
                }
                onChange={
                  handleChange
                }
                className="w-full px-4 py-3 rounded-lg border border-border bg-bg text-text"
              />

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-5 py-3 rounded-lg bg-accent text-bg font-bold cursor-pointer"
                >
                  {editingId
                    ? 'Update Qualification'
                    : 'Add Qualification'}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={
                      cancelEdit
                    }
                    className="px-5 py-3 rounded-lg border border-border text-text cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}