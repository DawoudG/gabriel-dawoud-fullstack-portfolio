import {
  useEffect,
  useState,
  type FormEvent,
  type ChangeEvent
} from 'react';

import { Link } from 'react-router-dom';
import { PROJECTS } from '../data/projects';
import { API_URL, getAuth } from '../lib/auth';

type DatabaseProject = {
  _id: string;
  title: string;
  firstname: string;
  lastname: string;
  email: string;
  completion?: string;
  description?: string;
};

type ProjectForm = {
  title: string;
  firstname: string;
  lastname: string;
  email: string;
  completion: string;
  description: string;
};

const emptyForm: ProjectForm = {
  title: '',
  firstname: '',
  lastname: '',
  email: '',
  completion: '',
  description: ''
};

export default function Projects() {
  const auth = getAuth();
  const isAdmin = auth?.user.role === 'admin';

  const [databaseProjects, setDatabaseProjects] =
    useState<DatabaseProject[]>([]);

  const [form, setForm] =
    useState<ProjectForm>(emptyForm);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadProjects = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/projects`
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Unable to load projects');
        return;
      }

      setDatabaseProjects(data);
    } catch {
      setError('Unable to connect to the server');
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
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
      ? `${API_URL}/api/projects/${editingId}`
      : `${API_URL}/api/projects`;

    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
          'Unable to save project'
        );
        return;
      }

      setMessage(
        editingId
          ? 'Project updated successfully.'
          : 'Project created successfully.'
      );

      setForm(emptyForm);
      setEditingId(null);

      await loadProjects();
    } catch {
      setError('Unable to connect to the server');
    }
  };

  const handleEdit = (
    project: DatabaseProject
  ) => {
    setEditingId(project._id);

    setForm({
      title: project.title,
      firstname: project.firstname,
      lastname: project.lastname,
      email: project.email,
      completion: project.completion
        ? project.completion.substring(0, 10)
        : '',
      description: project.description || ''
    });

    setMessage('');
    setError('');

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  };

  const handleDelete = async (
    projectId: string
  ) => {
    if (!auth || !isAdmin) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this project?'
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/projects/${projectId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
          'Unable to delete project'
        );
        return;
      }

      setMessage('Project deleted successfully.');

      await loadProjects();
    } catch {
      setError('Unable to connect to the server');
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
        Projects
      </h1>

      <p className="lead">
        Selected academic projects, including my
        contributions and the outcomes.
      </p>

      <div className="grid gap-5 mt-6 grid-cols-1 md:grid-cols-3">
        {PROJECTS.map((project) => (
          <article
            key={project.id}
            className="card project-card flex flex-col gap-2"
          >
            <img
              src={project.image}
              alt={project.imageAlt}
              loading="lazy"
              className="project-image w-full h-40 object-cover bg-surface-2"
            />

            <h3 className="mt-2 mb-0 text-text">
              <Link
                to={`/projects/${project.id}`}
                className="text-inherit no-underline hover:text-accent hover:underline"
              >
                {project.title}
              </Link>
            </h3>

            <p className="text-accent font-semibold text-[0.95rem] m-0">
              Description
            </p>

            <p className="m-0">
              {project.description[0]}
            </p>

            <p className="text-accent font-semibold text-[0.95rem] mt-1 mb-0">
              My Role
            </p>

            <p className="m-0">
              {project.role}
            </p>

            <p className="text-accent font-semibold text-[0.95rem] mt-1 mb-0">
              Outcome
            </p>

            <p className="m-0">
              {project.outcome}
            </p>

            <Link
              to={`/projects/${project.id}`}
              aria-label={`Read more about ${project.title}`}
              className="self-start mt-1 text-accent font-semibold no-underline hover:underline"
            >
              Details →
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-14">
        <h2 className="section-title">
          Portfolio Project Database
        </h2>

        <p className="lead">
          Projects loaded from the MongoDB backend API.
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
          {databaseProjects.map((project) => (
            <article
              key={project._id}
              className="card flex flex-col gap-2"
            >
              <h3 className="text-xl font-bold">
                {project.title}
              </h3>

              <p>
                {project.description ||
                  'No description provided.'}
              </p>

              <p>
                <strong>Created by:</strong>{' '}
                {project.firstname}{' '}
                {project.lastname}
              </p>

              <p>
                <strong>Email:</strong>{' '}
                {project.email}
              </p>

              {project.completion && (
                <p>
                  <strong>Completion:</strong>{' '}
                  {project.completion.substring(0, 10)}
                </p>
              )}

              {isAdmin && (
                <div className="flex gap-3 mt-3">
                  <button
                    type="button"
                    onClick={() =>
                      handleEdit(project)
                    }
                    className="px-4 py-2 rounded-lg bg-accent text-bg font-semibold cursor-pointer"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(project._id)
                    }
                    className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>

      {isAdmin && (
        <div className="mt-14 max-w-2xl">
          <div className="card">
            <h2 className="text-3xl font-bold mb-2">
              {editingId
                ? 'Edit Project'
                : 'Add Project'}
            </h2>

            <p className="text-muted mb-6">
              Admin Project Management
            </p>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              <input
                name="title"
                type="text"
                placeholder="Project Title"
                required
                value={form.title}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-border bg-bg text-text"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="firstname"
                  type="text"
                  placeholder="First Name"
                  required
                  value={form.firstname}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-bg text-text"
                />

                <input
                  name="lastname"
                  type="text"
                  placeholder="Last Name"
                  required
                  value={form.lastname}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-bg text-text"
                />
              </div>

              <input
                name="email"
                type="email"
                placeholder="Email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-border bg-bg text-text"
              />

              <input
                name="completion"
                type="date"
                value={form.completion}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-border bg-bg text-text"
              />

              <textarea
                name="description"
                placeholder="Project Description"
                rows={5}
                value={form.description}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-border bg-bg text-text"
              />

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-5 py-3 rounded-lg bg-accent text-bg font-bold cursor-pointer"
                >
                  {editingId
                    ? 'Update Project'
                    : 'Add Project'}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
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