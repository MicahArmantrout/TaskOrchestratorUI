import * as React from 'react';
import { apiService } from '../services/apiService';
import { useParams } from 'react-router-dom';

export const TaskStatus = {
  NotStarted: 'Not Started',
  InProgress: 'In Progress',
  Completed: 'Completed',
  OnHold: 'On Hold',
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

interface FormData {
  title: string;
  description: string;
  isComplete: boolean;
  status: TaskStatus;
}

interface Errors {
  [key: string]: string;
}

interface TaskResponse {
  item?: string;
  title?: string;
  description?: string;
  isComplete?: boolean;
  status?: string;
}

const initialFormData: FormData = {
  title: '',
  description: '',
  isComplete: false,
  status: TaskStatus.NotStarted,
};

const normalizeStatus = (value: unknown): TaskStatus => {
  if (typeof value === 'string' && Object.values(TaskStatus).includes(value as TaskStatus)) {
    return value as TaskStatus;
  }

  return TaskStatus.NotStarted;
};

const AddEditTask: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [formData, setFormData] = React.useState<FormData>(initialFormData);
  const [errors, setErrors] = React.useState<Errors>({});
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(Boolean(id));
  const [successMessage, setSuccessMessage] = React.useState<string>('');
  const [errorMessage, setErrorMessage] = React.useState<string>('');

  React.useEffect(() => {
    const loadTask = async () => {
      if (!id) {
        setFormData(initialFormData);
        setErrors({});
        setSuccessMessage('');
        setErrorMessage('');
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      try {
        const task = await apiService.getTaskById(id) as TaskResponse;
        setFormData({
          title: task.item ?? task.title ?? '',
          description: task.description ?? '',
          isComplete: Boolean(task.isComplete),
          status: normalizeStatus(task.status),
        });
      } catch (err: unknown) {
        if (err instanceof Error) setErrorMessage(err.message);
        else setErrorMessage(String(err) || 'Unable to load task.');
      } finally {
        setLoading(false);
      }
    };

    void loadTask();
  }, [id]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const name = target.name;
    const value = (target as HTMLInputElement).type === 'checkbox'
      ? (target as HTMLInputElement).checked
      : target.value;

    setFormData((current) => ({ ...current, [name]: value } as FormData));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Errors = {};

    if (!formData.title.trim()) nextErrors.title = 'Title is required.';
    if (!formData.description.trim()) nextErrors.description = 'Description is required.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const createdOn = new Date().toISOString();
      const taskPayload = {
        id: 0,
        item: formData.title,
        title: formData.title,
        description: formData.description,
        isComplete: formData.isComplete,
        status: formData.status,
        createdOn,
        completedOn: createdOn,
      };

      await apiService.createTask(taskPayload);
      setSuccessMessage('Task created successfully.');
      setFormData({ title: '', description: '', isComplete: false, status: TaskStatus.NotStarted });
      setErrors({});
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMessage(err.message);
      else setErrorMessage(String(err) || 'An unknown error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '0.25rem 0 0.5rem' }}>
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '18px',
          boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)',
          padding: '1.5rem',
        }}
      >
        {id ? (
          <p style={{ marginBottom: '0.9rem', textAlign: 'center', fontWeight: 600 }}>
            {loading ? 'Loading task...' : `Editing task ${id}`}
          </p>
        ) : null}
        {errorMessage && !loading ? <p style={{ color: 'crimson', marginBottom: '0.9rem', textAlign: 'center' }}>{errorMessage}</p> : null}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.9rem' }}>
          <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: '14px', padding: '1rem 1rem 0.75rem', margin: 0 }}>
            <legend style={{ textAlign: 'center', width: '100%', padding: '0 0.5rem', fontWeight: 600 }}>Please fill in the fields:</legend>

            <div style={{ marginBottom: '0.85rem' }}>
              <label htmlFor="title" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>Title</label>
              <input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                style={{ display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.75rem 0.85rem', border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '1rem' }}
              />
              {errors.title && <div style={{ color: 'crimson', marginTop: '0.25rem' }}>{errors.title}</div>}
            </div>

            <div style={{ marginBottom: '0.85rem' }}>
              <label htmlFor="isComplete" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  id="isComplete"
                  name="isComplete"
                  checked={formData.isComplete}
                  onChange={handleChange}
                />
                Mark as Complete
              </label>
              {errors.isComplete && <div style={{ color: 'crimson', marginTop: '0.25rem' }}>{errors.isComplete}</div>}
            </div>

            <div style={{ marginBottom: '0.85rem' }}>
              <label htmlFor="description" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>Description</label>
              <input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                style={{ display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.75rem 0.85rem', border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '1rem' }}
              />
              {errors.description && <div style={{ color: 'crimson', marginTop: '0.25rem' }}>{errors.description}</div>}
            </div>

            <div style={{ marginBottom: '0.25rem' }}>
              <label htmlFor="status" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={{ display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.75rem 0.85rem', border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '1rem', background: '#fff' }}
              >
                <option value={TaskStatus.NotStarted}>Not Started</option>
                <option value={TaskStatus.InProgress}>In Progress</option>
                <option value={TaskStatus.Completed}>Completed</option>
                <option value={TaskStatus.OnHold}>On Hold</option>
              </select>
              {errors.status && <div style={{ color: 'crimson', marginTop: '0.25rem' }}>{errors.status}</div>}
            </div>
          </fieldset>

          {successMessage && <p style={{ color: 'green', marginTop: '0.25rem', textAlign: 'center' }}>{successMessage}</p>}
          {errorMessage && <p style={{ color: 'crimson', marginTop: '0.25rem', textAlign: 'center' }}>{errorMessage}</p>}

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '0.8rem 1.1rem',
              border: 'none',
              borderRadius: '999px',
              background: '#2563eb',
              color: '#fff',
              fontWeight: 700,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEditTask;