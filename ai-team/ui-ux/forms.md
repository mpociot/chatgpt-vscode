Please create reusable forms for the same that are inline with the Design System and that use React hook form to handle form submissions and validation etc
===

Certainly! Here's an example of a reusable form component using React Hook Form and Tailwind CSS for building forms inline with the Design System of "GovWeb Solutions":

```tsx
// components/Form.jsx
import React from 'react';
import { useForm } from 'react-hook-form';

const Form = ({ onSubmit, children }) => {
  const { handleSubmit, formState } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {children}
      <button
        type="submit"
        disabled={formState.isSubmitting || !formState.isValid}
        className="py-2 px-4 bg-blue-500 text-white rounded"
      >
        Submit
      </button>
    </form>
  );
};

export default Form;
```

Now you can use the Form component to create forms with form fields and submit functionality in your "GovWeb Solutions" application. Here's an example of how you can use it:

```tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import Form from './components/Form';

const ContactPage = () => {
  const { register, handleSubmit, formState } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <div>
      <h1>Contact Us</h1>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            {...register('name', { required: true })}
            className="border rounded px-2 py-1"
          />
          {formState.errors.name && (
            <span className="text-red-500">Name is required</span>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            {...register('email', { required: true })}
            className="border rounded px-2 py-1"
          />
          {formState.errors.email && (
            <span className="text-red-500">Email is required</span>
          )}
        </div>
      </Form>
    </div>
  );
};

export default ContactPage;
```

In this example, the Form component wraps the form fields and handles form submission using the onSubmit prop. The form fields are registered using react-hook-form's register function, and form validation is applied using the required rule. The form submission button is disabled when the form is submitting or invalid.