import {
  useEffect,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type FormEvent
} from 'react';

import { API_URL, getAuth } from '../lib/auth';

type ContactFormValues = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  message: string;
};

type ContactMessage = {
  _id: string;
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  message: string;
  createdAt?: string;
};

type FieldName = keyof ContactFormValues;
type FormErrors = Partial<Record<FieldName, string>>;
type TouchedFields = Partial<Record<FieldName, boolean>>;

const EMPTY_FORM: ContactFormValues = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  message: ''
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+()\-\s]{7,20}$/;
const NAME_PATTERN =
  /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'.\- ]{0,39}$/;

const MESSAGE_MIN_LENGTH = 10;
const MESSAGE_MAX_LENGTH = 500;

const FIELD_LABEL =
  'grid gap-1.5 text-sm text-muted';

const FIELD_CONTROL =
  'bg-surface-2 border border-border text-text rounded-md px-3.5 py-2.5 text-base font-sans focus:outline-2 focus:outline-accent focus:outline-offset-2 aria-invalid:border-danger';

function validate(
  values: ContactFormValues
): FormErrors {
  const errors: FormErrors = {};

  if (!values.firstName.trim()) {
    errors.firstName =
      'First name is required.';
  } else if (
    !NAME_PATTERN.test(
      values.firstName.trim()
    )
  ) {
    errors.firstName =
      'Use letters, spaces, hyphens, or apostrophes only.';
  }

  if (!values.lastName.trim()) {
    errors.lastName =
      'Last name is required.';
  } else if (
    !NAME_PATTERN.test(
      values.lastName.trim()
    )
  ) {
    errors.lastName =
      'Use letters, spaces, hyphens, or apostrophes only.';
  }

  if (!values.phone.trim()) {
    errors.phone =
      'Phone number is required.';
  } else if (
    !PHONE_PATTERN.test(
      values.phone.trim()
    )
  ) {
    errors.phone =
      'Enter a valid phone number.';
  }

  if (!values.email.trim()) {
    errors.email =
      'Email is required.';
  } else if (
    !EMAIL_PATTERN.test(
      values.email.trim()
    )
  ) {
    errors.email =
      'Enter a valid email address.';
  }

  const trimmedMessage =
    values.message.trim();

  if (!trimmedMessage) {
    errors.message =
      'Message is required.';
  } else if (
    trimmedMessage.length <
    MESSAGE_MIN_LENGTH
  ) {
    errors.message =
      `Message must be at least ${MESSAGE_MIN_LENGTH} characters.`;
  } else if (
    trimmedMessage.length >
    MESSAGE_MAX_LENGTH
  ) {
    errors.message =
      `Message must be ${MESSAGE_MAX_LENGTH} characters or fewer.`;
  }

  return errors;
}

export default function Contact() {
  const auth = getAuth();
  const isAdmin =
    auth?.user.role === 'admin';

  const [
    formValues,
    setFormValues
  ] = useState<ContactFormValues>(
    EMPTY_FORM
  );

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [touched, setTouched] =
    useState<TouchedFields>({});

  const [
    contacts,
    setContacts
  ] = useState<ContactMessage[]>([]);

  const [success, setSuccess] =
    useState('');

  const [serverError, setServerError] =
    useState('');

  const loadContacts = async () => {
    if (!auth || !isAdmin) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/contacts`,
        {
          headers: {
            Authorization:
              `Bearer ${auth.token}`
          }
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setServerError(
          data.error ||
          'Unable to load contacts'
        );
        return;
      }

      setContacts(data);
    } catch {
      setServerError(
        'Unable to connect to the server'
      );
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleFieldChange = (
    event: ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement
    >
  ) => {
    const fieldName =
      event.target.name as FieldName;

    setFormValues((previous) => ({
      ...previous,
      [fieldName]:
        event.target.value
    }));

    if (errors[fieldName]) {
      setErrors((previous) => {
        const next = {
          ...previous
        };

        delete next[fieldName];

        return next;
      });
    }
  };

  const handleFieldBlur = (
    event: FocusEvent<
      HTMLInputElement |
      HTMLTextAreaElement
    >
  ) => {
    const fieldName =
      event.target.name as FieldName;

    setTouched((previous) => ({
      ...previous,
      [fieldName]: true
    }));

    setErrors(
      validate(formValues)
    );
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const nextErrors =
      validate(formValues);

    if (
      Object.keys(nextErrors).length >
      0
    ) {
      setErrors(nextErrors);

      const allTouched:
        TouchedFields = {};

      (
        Object.keys(
          EMPTY_FORM
        ) as FieldName[]
      ).forEach((name) => {
        allTouched[name] = true;
      });

      setTouched(allTouched);
      return;
    }

    setServerError('');
    setSuccess('');

    try {
      const response = await fetch(
        `${API_URL}/api/contacts`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json'
          },
          body: JSON.stringify({
            firstname:
              formValues.firstName,
            lastname:
              formValues.lastName,
            phone:
              formValues.phone,
            email:
              formValues.email,
            message:
              formValues.message
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setServerError(
          data.error ||
          'Unable to send message'
        );
        return;
      }

      setSuccess(
        'Message sent successfully!'
      );

      setFormValues(EMPTY_FORM);
      setErrors({});
      setTouched({});

      if (isAdmin) {
        await loadContacts();
      }
    } catch {
      setServerError(
        'Unable to connect to the server'
      );
    }
  };

  const handleDelete = async (
    contactId: string
  ) => {
    if (!auth || !isAdmin) {
      return;
    }

    const confirmed =
      window.confirm(
        'Delete this contact message?'
      );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/contacts/${contactId}`,
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
        setServerError(
          data.error ||
          'Unable to delete contact'
        );
        return;
      }

      await loadContacts();
    } catch {
      setServerError(
        'Unable to connect to the server'
      );
    }
  };

  const errorFor = (
    name: FieldName
  ) =>
    touched[name]
      ? errors[name]
      : undefined;

  return (
    <section>
      <h1 className="section-title">
        Contact Me
      </h1>

      <p className="lead">
        Want to work together, ask a
        question, or just say hello?
        Reach out below and I'll get
        back to you within a couple
        of business days.
      </p>

      <div className="grid gap-5 mt-6 items-start grid-cols-1 md:grid-cols-[1fr_1.4fr]">
        <aside className="card">
          <h2 className="mt-0">
            Get in touch
          </h2>

          <dl className="m-0 grid gap-3">
            <div className="grid grid-cols-[90px_1fr] gap-2">
              <dt className="text-muted font-semibold">
                Name
              </dt>

              <dd className="m-0 text-text">
                Gabriel Dawoud
              </dd>
            </div>

            <div className="grid grid-cols-[90px_1fr] gap-2">
              <dt className="text-muted font-semibold">
                Email
              </dt>

              <dd className="m-0 text-text">
                <a href="mailto:dawoudgabriel@gmail.com">
                  dawoudgabriel@gmail.com
                </a>
              </dd>
            </div>

            <div className="grid grid-cols-[90px_1fr] gap-2">
              <dt className="text-muted font-semibold">
                Phone
              </dt>

              <dd className="m-0 text-text">
                <a href="tel:9055173507">
                  905-517-3507
                </a>
              </dd>
            </div>

            <div className="grid grid-cols-[90px_1fr] gap-2">
              <dt className="text-muted font-semibold">
                Location
              </dt>

              <dd className="m-0 text-text">
                Mississauga, Ontario
              </dd>
            </div>
          </dl>
        </aside>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="card contact-form grid gap-4"
        >
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <label className={FIELD_LABEL}>
              <span>
                First Name
              </span>

              <input
                type="text"
                name="firstName"
                value={
                  formValues.firstName
                }
                onChange={
                  handleFieldChange
                }
                onBlur={
                  handleFieldBlur
                }
                className={
                  FIELD_CONTROL
                }
              />

              {errorFor(
                'firstName'
              ) && (
                <p className="text-danger">
                  {errorFor(
                    'firstName'
                  )}
                </p>
              )}
            </label>

            <label className={FIELD_LABEL}>
              <span>
                Last Name
              </span>

              <input
                type="text"
                name="lastName"
                value={
                  formValues.lastName
                }
                onChange={
                  handleFieldChange
                }
                onBlur={
                  handleFieldBlur
                }
                className={
                  FIELD_CONTROL
                }
              />

              {errorFor(
                'lastName'
              ) && (
                <p className="text-danger">
                  {errorFor(
                    'lastName'
                  )}
                </p>
              )}
            </label>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <label className={FIELD_LABEL}>
              <span>
                Contact Number
              </span>

              <input
                type="tel"
                name="phone"
                value={
                  formValues.phone
                }
                onChange={
                  handleFieldChange
                }
                onBlur={
                  handleFieldBlur
                }
                className={
                  FIELD_CONTROL
                }
              />

              {errorFor('phone') && (
                <p className="text-danger">
                  {errorFor(
                    'phone'
                  )}
                </p>
              )}
            </label>

            <label className={FIELD_LABEL}>
              <span>
                Email Address
              </span>

              <input
                type="email"
                name="email"
                value={
                  formValues.email
                }
                onChange={
                  handleFieldChange
                }
                onBlur={
                  handleFieldBlur
                }
                className={
                  FIELD_CONTROL
                }
              />

              {errorFor('email') && (
                <p className="text-danger">
                  {errorFor(
                    'email'
                  )}
                </p>
              )}
            </label>
          </div>

          <label className={FIELD_LABEL}>
            <span>Message</span>

            <textarea
              name="message"
              rows={5}
              maxLength={
                MESSAGE_MAX_LENGTH
              }
              value={
                formValues.message
              }
              onChange={
                handleFieldChange
              }
              onBlur={
                handleFieldBlur
              }
              className={`${FIELD_CONTROL} resize-y`}
            />

            <p className="m-0 text-right text-xs text-muted">
              {
                formValues.message
                  .length
              }
              /
              {MESSAGE_MAX_LENGTH}
            </p>

            {errorFor(
              'message'
            ) && (
              <p className="text-danger">
                {errorFor(
                  'message'
                )}
              </p>
            )}
          </label>

          {success && (
            <p className="text-green-400">
              {success}
            </p>
          )}

          {serverError && (
            <p className="text-red-400">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            className="btn justify-self-start"
          >
            Send Message
          </button>
        </form>
      </div>

      {isAdmin && (
        <div className="mt-14">
          <h2 className="section-title">
            Contact Messages
          </h2>

          <p className="lead">
            Messages stored in MongoDB.
          </p>

          <div className="grid gap-5 mt-6">
            {contacts.map(
              (contact) => (
                <article
                  key={contact._id}
                  className="card"
                >
                  <h3>
                    {
                      contact.firstname
                    }{' '}
                    {
                      contact.lastname
                    }
                  </h3>

                  <p>
                    <strong>
                      Email:
                    </strong>{' '}
                    {contact.email}
                  </p>

                  <p>
                    <strong>
                      Phone:
                    </strong>{' '}
                    {contact.phone}
                  </p>

                  <p>
                    <strong>
                      Message:
                    </strong>{' '}
                    {contact.message}
                  </p>

                  {contact.createdAt && (
                    <p>
                      <strong>
                        Submitted:
                      </strong>{' '}
                      {new Date(
                        contact.createdAt
                      ).toLocaleString()}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(
                        contact._id
                      )
                    }
                    className="px-4 py-2 mt-3 rounded-lg bg-red-500 text-white font-semibold cursor-pointer"
                  >
                    Delete
                  </button>
                </article>
              )
            )}
          </div>
        </div>
      )}
    </section>
  );
}